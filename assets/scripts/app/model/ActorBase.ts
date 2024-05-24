import AudioManager from "../manager/AudioManager";
import PlayerManager from "../manager/PlayerManager";
import BloodItem from "../module/pve/BloodItem";
import { ASYNTYPE, ATTRTYPE, BULLETTYPE, CAMPTYPE, DIALOGTYPE, INSTANTTYPE, SEARCHTYPE, SKILLTYPE, SPECIALTYPE, STATETYPE } from "../other/FightEnum";
import { checkArrayIn, ES, sortByKey } from "../other/Global";
import BuffOwner from "./buff/BuffOwner";
import Addition from "./states/Addition";
import Condition from "./states/Condition";
import HurtDeal from "./states/HurtDeal";
import Notes from "./states/Notes";
import RealValue from "./states/RealValue";
import SpecialOwner from "./states/SpecialOwner";
import Status from "./states/Status";
import WorkFocus from "./states/WorkFocus";
import UnitBase from "./UnitBase";

// 特效层级
const EFFECTZODER = {
    buff:     1000,
    hit:      1100,
}

/**
 * 角色基础类
 */
export default class ActorBase extends UnitBase {
    public bloodItem : BloodItem;

    public _addition: Addition;             // 强化
    public _condition: Condition;           // 条件
    public _hurtDeal: HurtDeal;             // 伤害处理
    public _notes: Notes;                   // 记录
    public _realValue: RealValue;           // 真实属性
    public _status: Status;                 // 状态
    public _buffs: BuffOwner;               // buff
    public _special: SpecialOwner;          // 特殊
    public _work: WorkFocus;                // 发射器+工作效率

    public states: Array<STATEDATA> = [];
    public winkStates: Array<STATEDATA> = [];   // 瞬时state
    public curState: STATEDATA;

    public _level: string = ES(1);           // 等级
    public _exp: string = ES(0);             // 经验值
    public _pid: string = "";                // 角色id                    
    public isFight: boolean = false;         // 战斗开始？
    public normalSkill: string = "";         // 普攻id
    public initiativeSkill: string = "";     // 主动id
    public isDead: boolean = false;          // 死亡处理
    private cdList: Map<string, number> = new Map();    // 内置cd

    protected _recordTarget: Map<string, ActorBase> = new Map();  // 记录攻击对象

    get pid () { return this._pid }

    // 受击特效添加点
    public effectNode: cc.Node;
    // buff特效添加点
    public buffNode: cc.Node;

    onLoad () {
        super.onLoad()

        this.effectNode = new cc.Node()
        this.node.addChild(this.effectNode, EFFECTZODER.hit)
        this.buffNode = new cc.Node()
        this.node.addChild(this.buffNode, EFFECTZODER.buff)
        
        this._addition = new Addition(this)
        this._condition = new Condition(this)
        this._hurtDeal = new HurtDeal(this)
        this._notes = new Notes(this)
        this._realValue = new RealValue(this)
        this._status = new Status(this)
        this._buffs = new BuffOwner(this)
        this._special = new SpecialOwner(this)
        this._work = new WorkFocus(this)

        this._condition.init(this._realValue)
        this._hurtDeal.init(this._realValue)
        this.cdList.clear()
    }

    update2 (dt: number) {
        super.update2(dt)
        this.updateCd(dt)
        this._work.update2()
        this._notes.update2(dt)
        this._buffs.update2(dt)
    }

    // 很多逻辑不可处理英雄
    uable () {
        return this.campType != CAMPTYPE.hero
    }

    updateCd (dt: number) {
        this.cdList.forEach((value, key) => { 
            this.cdList.set(key, value + dt)
        }) 
    }

    getCd (id: string): boolean {
        id = id.toString()
        let d = this.cdList.get(id)
        if (d) {
            return d >= 0.17
        } else {
            this.cdList.set(id, 0)
        }
        return true
    }

    clearCd (id: string) {
        id = id.toString()
        this.cdList.set(id, 0)
    }

    updateState () {
        // 执行中
        if (this.asynData) { return }

        // check
        let list: Array<STATEDATA> = [];
        for (let i = 0; i < this.states.length; i++) {
            const v = this.states[i];
            let can = checkArrayIn(v.from, this.state)
            if (can) {
                can = this._condition.check(v)
            }
            if (can) {
                list.push(v)
            }
        }

        sortByKey(list, "sort")

        // change
        let nextState: STATEDATA = list[0]
        if (!nextState) { return }

        if (this.curState) {
            if (this.curState.id == nextState.id) { return }
        }

        // dostate
        this["do" + nextState.to](nextState)
        this.curState = nextState
        this.state = nextState.pid
        this._notes.clearNotes(nextState.uid)
    }

    // 更新瞬时
    updateWinkStates () {
        for (let i = 0; i < this.winkStates.length; i++) {
            const v = this.winkStates[i];

            // 只执行一次
            if (v.ended && v.once == 1) {
                continue
            }
            
            let can = this._condition.check(v)
            if (can) {
                let extra = JSON.parse(v.extra)
                switch (v.pid) {
                    case INSTANTTYPE.buff:
                        this._buffs.addBuffs(JSON.parse(v.extra), this._realValue.realFight)
                        break;
                    case INSTANTTYPE.tSkill:
                        for (let i = 0; i < extra.length; i++) {
                            let def = this._addition.getSkillData(extra[i])
                            // 未达到内置cd
                            if (!this.getCd(def.id)) { return }
                            let target = this.checkTarget(def)
                            if (target) {
                                this.addLaunch(def.id, target)
                                this.clearCd(def.id)
                            }
                        }
                        break;
                    case INSTANTTYPE.halo:
                        break;
                    case INSTANTTYPE.special:
                        this._special.addSpecial(extra)
                        break;
                    case INSTANTTYPE.dialog:
                        switch (extra[0]) {
                            case DIALOGTYPE.skill:
                                // 英雄
                                this.talkSkill()
                                break;
                            default:
                                break;
                        }
                        break;
                    default:
                        break;
                }
                this._notes.clearNotes(v.uid)
                this.winkStates[i].ended = true
            }
        }
    }
    
    // 按照顺序来
    checkTarget (def: BULLETDATA): ActorBase | cc.Vec2 {

        // 攻击对象是英雄且...
        let getRecordTarget = (t: ActorBase) => {
            let ot: ActorBase = this._recordTarget.get(def.id.toString()) 
            return ot ? ot : t
        }

        // 类型转化
        function changeTarget (t: ActorBase): ActorBase | cc.Vec2 {
            if (!t) { return undefined }
            switch (def.type) {
                case BULLETTYPE.one:
                case BULLETTYPE.laser:
                    return getRecordTarget(t)
            }
            return cc.v2(t.node.x, t.node.y)
        }

        if (def.search == SEARCHTYPE.out) {
            return cc.v2(this.node.x, this.node.y)
        }

        let list = this.findTarget(def);
        list.sort((a,b)=>{
            let n1 = a["season"] ? -1 : 1
            let n2 = b["season"] ? -1 : 1
            return n2 - n1
        })
        if (def.search == SEARCHTYPE.call) {
            
            // 存在假想敌（自己）
            if (PlayerManager.isForbidEnemy && this.fm.superFast) {
                if (!list[0]) { return changeTarget(this) }
            }

            return changeTarget(list[0]) 
        }

        if (def.search == SEARCHTYPE.enemy) {
            if (list.length > 0) {
                return cc.v2(this.node.x, this.node.y)
            }
        }
    }

    findTarget (def: BULLETDATA) {
        let list : Array<ActorBase> = []
        let camps = JSON.parse(def.campType)

        for (let j = 0; j < CAMPTYPE.length; j++) {
            if (checkArrayIn(camps, j)) {
                let actors = this.fm.getActorsByCamp(j)
                for (let i = 0; i < actors.length; i++) {
                    let v = actors[i]
                    let can1 = !v.onState(STATETYPE.finish)
                    let can2 = this.node.position.sub(v.node.position).mag() <= def.range
                    if (can1 && can2) {
                        list.push(v)
                    }
                }
            }
        }
        return list
    }

    // 发射子弹
    addLaunch (id: string, arg: ActorBase | cc.Vec2, speical: boolean = false) {
        this._work.add(id, arg, speical)
    }

    // 发射子弹
    addLaunchStart (id: string, arg: ActorBase | cc.Vec2, speical: boolean = false) {
        let target: ActorBase = arg as ActorBase
        let targetPos: cc.Vec2 = null;
        if (target && target.uid) {
            targetPos = cc.v2(target.node.x, target.node.y)
        } else {
            target = null
            targetPos = arg as cc.Vec2
        }

        // 目标死亡
        if (target && target.onState(STATETYPE.finish)) {
            return
        }

        let def = this._addition.getSkillData(id) as BULLETDATA
        let buffs = JSON.parse(def.atkBuff)
        this._buffs.addBuffs(buffs, this._realValue.realFight, def)

        this.addAtkAct(def.jump)
        AudioManager.playEffect(def.launchSound)

        this._notes.addSkillNotes(def)
        this.fm.pveScene.createLaunch({
            attacker: this,
            target: target,
            targetPos: targetPos,
            fight: this._realValue.realFight,
            bAttr: def,
            startPos: cc.v2(this.node.x, this.node.y),
        })
        
        // 多重施法
        if (!speical) {
            this._special.checkSkillPro(def, arg)
            this._special.checkSkillNormal(def, arg)
        }

        if (def.skillType == SKILLTYPE.major) {
            this.fm.dealGlobalSpecial(SPECIALTYPE.activeSkill, {
                target: arg
            })
        }
    }
    
    addBloodItem (): BloodItem {
        let name = "bloodItem"
        let node = this.node.getChildByName(name)
        if (!node) {
            node = cc.instantiate(this.fm.getPrefabByName("bloodItem"))
            node.setPosition(cc.v2(0, this.nsize.height/2+5))
            this.node.addChild(node,1,name)
            node.addComponent(BloodItem)
        }

        let script = node.getComponent(BloodItem)
        return script
    }

    // 攻击表现
    addAtkAct (jump: number) {
    }

    talkSkill () {
    }

    /*************************** state ***************************/

    dowalk (state: STATEDATA) {

    }

    dowait (state: STATEDATA) {

    }

    doskill (state: STATEDATA) {
        let def = this._addition.getSkillData(state.skillId)
        let target = this.checkTarget(def)

        let check = (): boolean => {
            if (!target) { return false }
            if (target instanceof ActorBase) {
                if (!target.isValid) { return false }
            }
            return true
        }
        if (!check()) { return }

        // 普攻攻击有前后摇 其他无
        if (def.skillType == SKILLTYPE.normal) {
            let self = this
            let cb = function () {
                if (target instanceof ActorBase) {
                    if (!target.isValid) {
                        // 目标不存在 重新查询目标
                        target = self.checkTarget(def)
                    }
                }
                if (!check()) { return }
                self.addLaunch(state.skillId, target)
            }

            this.setAsynData({
                type: ASYNTYPE.skill,
                act: def.actTime / 1000,
                ended: def.endTime / 1000,
                timer: 0,
                callback: cb,
                did: false,
            })
        } else {
            this.addLaunch(state.skillId, target)
        }
    }

    dodead (state: STATEDATA) {

    }

    dorevive (state: STATEDATA) {

    }

    dofinish (state: STATEDATA) {

    }
    
    /*************************** logic ***************************/

    checkWinkStates () {
        for (let i = 0; i < this.states.length; i++) {
            if (this.states[i].pid >= INSTANTTYPE.start) {
                this.winkStates.push(this.states[i])
                this.states.splice(i,1)
                i--
            }
        }
    }

    //添加state 根据id添加
    addStates (ids: Array<string>): Array<string> {
        let newList = this.fm.getStatesByIds(ids)
        let uids: Array<string> = []
        for (let i = 0; i < newList.length; i++) {
            this.states.push(newList[i])
            uids.push(newList[i].uid)
        }

        this.checkWinkStates()
        return uids
    }

    // 删除state 根据唯一id删除
    delStates (uids: Array<string>) {
        for (let i = 0; i < this.states.length; i++) {
            if (checkArrayIn(uids, this.states[i].uid)) {
                this.states.splice(i,1)
                i--
            }
        }
        for (let i = 0; i < this.winkStates.length; i++) {
            if (checkArrayIn(uids, this.winkStates[i].uid)) {
                this.winkStates.splice(i,1)
                i--
            }
        }
    }

    // 根据id添加强化
    addAddition (ids: Array<string>, merge: boolean): Array<string> {
        return this._addition.addAddition(ids, merge)
    }

    // 根据唯一id删除强化
    delAddition (uids: Array<string>) {
        this._addition.delAddition(uids)
    }

    refresh () { }
    
    /*************************** view ***************************/

    refreshBlood () {
        let pro = this._realValue.getUseAttr(ATTRTYPE.hp) / this._realValue.getUseAttr(ATTRTYPE.maxHp)
        this.bloodItem.hpProgress = pro
    }
    
    clear () {
        this.node.destroy()
    }

}