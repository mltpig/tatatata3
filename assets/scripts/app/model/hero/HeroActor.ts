import DisUtils from "../../../framework/utils/DisUtils";
import HeroManager from "../../manager/HeroManager";
import StaticManager from "../../manager/StaticManager";
import Contants from "../../other/Contants";
import { REFRESHINFOTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { ASYNTYPE, ATTRTYPE, CAMPTYPE, INSTANTTYPE, SKILLTYPE, STATETYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { checkArrayIn, clone, DS, ES, mergeArray, spliceByValue } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import ActorBase from "../ActorBase";
import AutoSkill from "../states/AutoSkill";
import SkillMg from "../states/SkillMg";
import { heroState } from "../states/StateBase";
import UnitBase from "../UnitBase";

/**
 * 英雄角色
 */
const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("model/HeroActor")
export default class HeroActor extends ActorBase {
    private headIcon: cc.Node;
    public skillIcon: cc.Node;
    public rangeNode: cc.Node;
    private heroIde: cc.Label;

    public data: HEROINFO;
    public towerIndex: number;
    public IdeIndex: number;        // 几号位

    public _skill: SkillMg;
    public _auto: AutoSkill;
    public startPos: cc.Vec2 = cc.v2(0,0);
    public _upJob: boolean = false; // 转职
    public jobData: JOBDATA;
    public _normalStates: Array<STATEDATA> = [];  // 记录消失的普攻

    onLoad () {
        super.onLoad()
        this.headIcon = this.getNode("headIcon")
        this.skillIcon = this.getNode("skillIcon")
        this.heroIde = this.getCpByType("heroIde", cc.Label)

        this.skillIcon.active = false
        this._skill = new SkillMg(this)
        this._auto = new AutoSkill(this)
    }

    setData (data: HEROINFO) {
        this.data = data
        this._pid = data.id.toString()
        
        this.initFightData()
        this.nsize = this.data.size
        this.bodyCollider.size = this.nsize
        this.headIcon.setContentSize(this.nsize)

        DisUtils.replaceSprite(PATHS.hero + "/" + data.res, this.headIcon)

        this.normalSkill = this.data.normalSkill.toString()
        this.initiativeSkill = this.data.initiativeSkill.toString()
        
        this.states = this.fm.getStates(heroState)
        let extraStates = this.fm.getStatesByIds(this.data.extraStates)
        this.states = mergeArray(this.states, extraStates)

        this.checkWinkStates()

        for (let i = 0; i < this.states.length; i++) {
            const v = this.states[i];
            if (v.pid == STATETYPE.skill && v.pos == SKILLTYPE.normal) {
                if (parseInt(this.normalSkill) == 0) {
                    // 无普攻
                    this._normalStates.push(this.states[i])
                    this.states.splice(i,1)
                    i--
                } else {
                    this.states[i].skillId = this.normalSkill
                }
            }
        }

        this.campType = CAMPTYPE.hero

        this._skill.setSkillId(this.initiativeSkill)
        this._skill.setRecoveryRage(this._realValue.getUseAttr(ATTRTYPE.rage))
        this._skill.setMaxRage(this._realValue.getUseAttr(ATTRTYPE.maxRage))
        
        this.upLevel()

        this.bloodItem = this.addBloodItem()
        this.bloodItem.rageActive = true
        this.bloodItem.rageProgress = 1

        this.startPos = cc.v2(this.node.x, this.node.y)
        this.showRange(true)
    }

    setIde (ide: number) {
        this.IdeIndex = ide
        this.heroIde.string = ide.toString()
    }
    
    // 养成数据
    initFightData () {
        let upData = HeroManager.getCurHeroData(this.data.id)
        for (let i = 0; i < Contants.SHOWATTR.length; i++) {
            let key = Contants.SHOWATTR[i]
            if (this.data[key] && upData[key]) {
                this.data[key] = ES(upData[key])
            }
        }
        this._realValue.initBaseData(this.data)

        let exp = HeroManager.getCurHeroExpData(this.data.id)
        this.addExp(exp)
    }
    
    // 普攻范围
    showRange (show: boolean) {
        if (!this.rangeNode) {
            this.rangeNode = DisUtils.newSprite2("icon/big/range")
            this.rangeNode.scale = this.data.atkRange / 50
            this.rangeNode.zIndex = -1
            this.node.addChild(this.rangeNode)
        }
        this.rangeNode.active = show
    }

    checkWinkStates () {
        super.checkWinkStates()

        for (let i = 0; i < this.winkStates.length; i++) {
            let v = this.winkStates[i]
            if (v.pid == INSTANTTYPE.tSkill && v.pos == SKILLTYPE.major) {
                this.winkStates[i].skillId = this.initiativeSkill
                this.winkStates[i].extra = JSON.stringify([this.initiativeSkill.toString()]) 
            }
        }
    }
    
    // 攻击表现
    addAtkAct (jump: number) {
        if (!jump || jump != 1) {
            return
        }
        
        this.headIcon.stopAllActions()
        this.headIcon.setPosition(cc.v2(0,0))
        cc.tween(this.headIcon)
            .by(0.1, { position: cc.v3(0, 30)}, {easing: "backIn"})
            .by(0.1, { position: cc.v3(0, -30)}, {easing: "backOut"})
            .start()
    }
    
    addHandSkill (target: ActorBase | cc.Vec2) {
        let id = this.initiativeSkill
        let def = this._addition.getSkillData(id)
        this.addLaunch(id, target)
        this._skill.costRage()

        let t = target as ActorBase
        if (t && t.uid && t.campType == CAMPTYPE.hero) {
            this._recordTarget.set(id.toString(), t)
        }

        // let self = this
        // let cb = function () {
        //     self.addLaunch(id, target)
        //     self._skill.costRage()
        // }
        // this.setAsynData({
        //     type: ASYNTYPE.hand,
        //     act: def.actTime / 1000,
        //     ended: def.endTime / 1000,
        //     timer: 0,
        //     callback: cb,
        //     did: false,
        // })
    }

    setTowerIndex (index: number) {
        this.towerIndex = index
    }

    update2 (dt: number) {
        super.update2(dt)

        this._skill.update2(dt)
        this.updateState()
        this.updateWinkStates()
        this._auto.updateAuto()
    }

    addExp (exp: number) {
        exp = this._realValue.getRealExp(exp)
        let newExp = DS(this._exp) + exp
        let upExp = this._realValue.getUseAttr(ATTRTYPE.upExp)
        let addLevel = Math.floor(newExp / upExp)    // 升级
        let addExp = newExp % upExp

        if (addLevel > 0) {
            this._level = ES(DS(this._level) + addLevel)
            this.upLevel()
        }
        this._exp = ES(addExp)

        this.dispatchEvent_(Events.fight_hero_change_event, { 
            id: this.uid,
            type: REFRESHINFOTYPE.exp,
        })
    }

    // 升级
    upLevel () {
        let newAtk = DS(this.data.attack) + DS(this.data.atkGrow) * (DS(this._level) - 1)
        this._realValue.resetUseAttr(ATTRTYPE.attack, newAtk)
        
        this._special.checkLv2Atk()
        this._special.checkLvAddCritHurt()
    }

    refresh () { 
        this.dispatchEvent_(Events.fight_hero_change_event, { 
            id: this.uid,
            type: REFRESHINFOTYPE.attr,
        })
    }
    
    // 转职
    setJob (data: JOBDATA) {
        this._upJob = true
        this.jobData = data
        let ids = JSON.parse(data.buff)
        this._buffs.addBuffs(ids, this._realValue.realFight)

        this.dispatchEvent_(Events.hero_job_event)
    }
    
    /*************************** 表现 ***************************/

    talkSkill () {
        let id = this.initiativeSkill
        let def = this._addition.getSkillData(id)
        GameUtils.talk(def.name, cc.v2(this.node.x, this.node.y))
    }
    
    showCanCastSkill (can: boolean) {
        this.skillIcon.active = can
    }

    clear () {
        this.node.destroy()
    }

}