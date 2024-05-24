import PlayerManager from "../../manager/PlayerManager";
import Contants from "../../other/Contants";
import { ATTRTYPE, BUFFGROWTYPE, CAMPTYPE, MONSTERTYPE, SCENETYPE, SKILLTYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { clone, DS, ES, mergeArray } from "../../other/Global";
import ActorBase from "../ActorBase";
import HeroActor from "../hero/HeroActor";
import MonsterActor from "../monster/MonsterActor";

/**
 * 真实战斗数据管理类
 */
export default class RealValue {
    public target: ActorBase;
    public buffAdd: Array<BUFFADD> = [];        // 属性增幅
    public buffList: Array<BUFFADD> = [];       // 其他增幅
    public fight: ATTRDATA;                     // 基础属性
    public realFight: ATTRDATA;                 // 最终数据
    private showAtkSpeed: string;               // 用于展示攻速的

    // 特殊
    public buffAddSpecial: Array<BUFFADD> = [];         // 固定属性增幅
    public buffListSpecial: Array<BUFFADD> = [];        // 固定其他增幅

    // 其他加成
    public otherAddAttr: Array<BUFFADD> = [];           // 其他加成

    getBuffAdd (): Array<BUFFADD> {
        let newList: Array<BUFFADD> = []
        for (let i = 0; i < this.buffAdd.length; i++) {
            newList.push(this.buffAdd[i])
        }
        for (let i = 0; i < this.buffAddSpecial.length; i++) {
            newList.push(this.buffAddSpecial[i])
        }
        for (let i = 0; i < this.otherAddAttr.length; i++) {
            newList.push(this.otherAddAttr[i])
        }

        return newList
    }

    getbuffList (): Array<BUFFADD> {
        return mergeArray(this.buffList, this.buffListSpecial)
    }
    
    constructor (target) {
        this.target = target
    }

    // 基础数据
    initBaseData (data) {
        let attr = {}
        for (let i = 0; i < ATTRTYPE.length; i++) {
            let key = Contants.ATTRINFO[i]
            if (data[key]) {
                attr[key] = data[key]
            } else {
                attr[key] = ES(0)
            }
        }
        this.fight = <ATTRDATA> attr
        this.refresh()
    }
    
    // 获取加成后的数据
    getFinalAttr (key: string): string {
        let base = DS(this.fight[key])
        
        let num = base
        let list = this.getBuffAdd()
        for (let i = 0; i < list.length; i++) {
            const e = list[i];
            if (e.key == key) {
                if (e.per) {
                    num = num + base * e.value / 100
                } else {
                    num = num + e.value
                }
            }
        }
        num = Math.floor(num * 100) / 100
        num = num < 0? 0 : num

        // 暴击和暴击率特殊变化形式
        if (key == "crit") {
            num = num * this.target._special.checkCrit()
        } else if (key == "critHurt") {
            num = num * this.target._special.checkCritHurt()
        } else if (key == "atkSpeed") {
            num = num * this.target._special.checkAtkSpeed()
        }
        
        // 特殊模式
        if (this.target.fm.pveType == SCENETYPE.lord) {
            if (key == "speed") {
                let d = DS(this.target.fm["speedLimit"])
                num = num < d ? d : num
            }
        }
        
        return ES(num)
    }

    // 攻速切换
    atkSpeedSwitch (m: string): string {
        let n = 2 / (0.01* (DS(m) + 1)) * 0.97 + 0.03
        n = Math.floor(n * 100) / 100
        return ES(n)
    }

    // 更新最新数据
    refresh () {
        // 旧属性记录
        let oldReal = this.realFight ? clone(this.realFight) : {}
        let oldAtkSpeed = this.showAtkSpeed
        
        // 当前属性
        if (this.realFight) {
            this.realFight.attack = this.getFinalAttr("attack")
            this.realFight.maxHp = this.getFinalAttr("hp")
            this.realFight.atkSpeed = this.atkSpeedSwitch(this.getFinalAttr("atkSpeed"))
            this.realFight.atkSpeedNum = this.getFinalAttr("atkSpeed")
            this.realFight.speed = this.getFinalAttr("speed")
            this.realFight.hpGrow = this.getFinalAttr("hpGrow")
            this.realFight.atkGrow = this.getFinalAttr("atkGrow")
            this.realFight.crit = this.getFinalAttr("crit")
            this.realFight.critHurt = this.getFinalAttr("critHurt")
            this.realFight.rage = this.getFinalAttr("rage")
            this.realFight.maxRage = this.getFinalAttr("maxRage")
            this.realFight.exp = this.getFinalAttr("exp")
            this.realFight.upExp = this.getFinalAttr("upExp")
        } else {
            this.realFight = {
                uid: this.target.uid,
                pid: this.target._pid,
                attack : this.getFinalAttr("attack"),
                hp : this.getFinalAttr("hp"),
                atkSpeed: this.atkSpeedSwitch(this.getFinalAttr("atkSpeed")),
                atkSpeedNum: this.getFinalAttr("atkSpeed"),
                speed : this.getFinalAttr("speed"),
                hpGrow : this.getFinalAttr("hpGrow"),
                atkGrow : this.getFinalAttr("atkGrow"),
                crit : this.getFinalAttr("crit"),
                critHurt : this.getFinalAttr("critHurt"),
                rage : this.getFinalAttr("rage"),
                maxRage : this.getFinalAttr("maxRage"),
                exp : this.getFinalAttr("exp"),
                upExp: this.getFinalAttr("upExp"),
            }
            this.realFight.maxHp = DS(this.realFight.hp) <= 0 ? ES(1) : this.realFight.hp
        }
        this.showAtkSpeed = this.getFinalAttr("atkSpeed")
        
        // 表现
        let change: boolean = false
        let index = 0
        let pos: cc.Vec2 = cc.v2(this.target.node.x, this.target.node.y)
        let fly = function (key: string, num: number, pos: cc.Vec2) {
            if (num == 0) { return }

            num = Math.floor(num)
            change = true

            if (num == 0) { return }
            
            if (PlayerManager.isForbidNumber) { return }    // 不显示文字

            setTimeout(()=>{
                GameUtils.flyUp(key, num, pos)
            }, index * 0.6)
            index = index + 1
        }
        
        if (this.target.campType == CAMPTYPE.hero && this.target.isFight) {
            for (let i = 0; i < ATTRTYPE.length; i++) {
                if (i != ATTRTYPE.atkSpeed) {
                    let key = Contants.ATTRINFO[i]
                    let num = DS(this.realFight[key]) - DS(oldReal[key])
                    fly(key, num, pos)
                }
            }
            
            let num2 = DS(this.showAtkSpeed) - DS(oldAtkSpeed)
            fly(Contants.ATTRINFO[ATTRTYPE.atkSpeed], num2, pos)
        }
        
        if (change) {
            this.target.refresh()
        }
    }

    // 解密后数据
    getUseAttr (type: number) {
        let key = Contants.ATTRINFO[type]
        return DS(this.realFight[key])
    }
    
    // 重设基础数据
    resetUseAttr (type: number, num: number) {
        let key = Contants.ATTRINFO[type]
        if (num < 0) { num = 0 }
        this.fight[key] = ES(num)
        this.refresh()
    }

    // 重设血量
    changeHp (num: number) {
        if (this.target.campType == CAMPTYPE.hero) { return }
        
        if (num < 0) { num = 0 }
        this.realFight.hp = ES(num)
    }
    
    forceDead () {
        this.realFight.hp = ES(0)
    }

    forceSeason () {
        this.realFight.hp = ES(Math.floor(DS(this.realFight.hp) * 0.15))
        this.target.refreshBlood()
    }
    
    // 获取攻速转化值
    getAtkSpeed () {
        if (this.realFight.atkSpeedNum) {
            return DS(this.realFight.atkSpeedNum)
        }
        return 0
    }
    
    /************************ buff设置 ************************/

    // buff设置
    setBuffAdd (item: BUFFADD, special: boolean = false) {
        if (special) {
            let add: boolean = false
            for (let i = 0; i < this.buffAddSpecial.length; i++) {
                let can = this.buffAddSpecial[i].key == item.key && this.buffAddSpecial[i].per == item.per
                if (can) {
                    this.buffAddSpecial[i].value = this.buffAddSpecial[i].value + item.value
                    add = true
                    break
                }
            }
            if (!add) {
                this.buffAddSpecial.push(item)
            }
        } else {
            this.buffAdd.push(item)
        }
        this.refresh()
        this.updateBuffAddTarget(item.key)
    }

    // 清除
    clearBuffAdd (uid: string) {
        for (let i = 0; i < this.buffAdd.length; i++) {
            if (this.buffAdd[i].uid == uid) {
                let v = this.buffAdd[i]
                this.buffAdd.splice(i,1)
                this.refresh()
                this.updateBuffAddTarget(v.key)
                return
            }
        }
    }
        
    // 更新buff数据
    updateBuffAdd (uid: string, newValue: number) {
        for (let i = 0; i < this.buffAdd.length; i++) {
            if (this.buffAdd[i].uid == uid) {
                this.buffAdd[i].value = newValue
                this.refresh()
                this.updateBuffAddTarget(this.buffAdd[i].key)
                return
            }
        }
    }

    updateBuffAddTarget (key: string) {
        switch (key) {
            case "rage":
                let t = this.target as HeroActor
                if (t && t._skill) {
                    t._skill.setRecoveryRage(this.getUseAttr(ATTRTYPE.rage))
                }
                break;
            case "maxRage":
                let t1 = this.target as HeroActor
                if (t1 && t1._skill) {
                    t1._skill.setMaxRage(this.getUseAttr(ATTRTYPE.maxRage))
                }
                break;
            default:
                break;
        }
    }

    setOtherAddAttr (item: BUFFADD) {
        let add: boolean = false
        for (let i = 0; i < this.otherAddAttr.length; i++) {
            let can = this.otherAddAttr[i].key == item.key && this.otherAddAttr[i].per == item.per
            if (can) {
                this.otherAddAttr[i].value = this.otherAddAttr[i].value + item.value
                add = true
                break
            }
        }
        if (!add) {
            this.otherAddAttr.push(item)
        }
        this.refresh()
    }
    
    // buff
    setBuffList (item: BUFFADD, special: boolean = false) {
        if (special) {
            let add: boolean = false
            for (let i = 0; i < this.buffListSpecial.length; i++) {
                let can = this.buffListSpecial[i].key == item.key && this.buffListSpecial[i].per == item.per
                if (can) {
                    this.buffListSpecial[i].value = this.buffListSpecial[i].value + item.value
                    add = true
                    break
                }
            }
            if (!add) {
                this.buffListSpecial.push(item)
            }
        } else {
            this.buffList.push(item)
        }
    }

    // 清除
    clearBuffList (uid: string) {
        for (let i = 0; i < this.buffList.length; i++) {
            if (this.buffList[i].uid == uid) {
                this.buffList.splice(i,1)
                i--;
            }
        }
    }

    // 增减伤
    /**
     * 注意： 目前针对英雄为增伤 针对怪物为受伤 ，如果两边都有对应 则必须分开处理
     */
    getGrowHurt (hurt: number, bAttr: BULLETDATA, target: ActorBase): number {
        let newHurt: number = hurt

        let cal = function(item: BUFFADD) {
            if (item.per) {
                newHurt = newHurt + hurt * item.value / 100
            } else {
                newHurt = newHurt + item.value
            }
        }

        let list = this.getbuffList()
        for (let i = 0; i < list.length; i++) {
            const v = list[i];
            switch (parseInt(v.key)) {
                case BUFFGROWTYPE.hurt:
                    cal(v)
                    break;
                case BUFFGROWTYPE.normalHurt:
                    if (bAttr.skillType == SKILLTYPE.normal) {
                        cal(v)
                    }
                    break;
                case BUFFGROWTYPE.boss:
                    if (target.campType == CAMPTYPE.monster) {
                        if ((target as MonsterActor).data.type == MONSTERTYPE.boss) {
                            cal(v)
                        }
                    }
                    break;
                case BUFFGROWTYPE.skillHurt:
                    if (bAttr.skillType != SKILLTYPE.normal) {
                        cal(v)
                    }
                    break;
                case BUFFGROWTYPE.season:
                    if (target.campType == CAMPTYPE.monster) {
                        if ((target as MonsterActor).season) {
                            cal(v)
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        return newHurt
    }

    /**
     * 获取详细的技能伤害数据 百分比
     * @param type 
     * @returns 
     */
    getHurtDetails (type: SKILLTYPE): number {
        let newHurt: number = 100

        let cal = function(item: BUFFADD) {
            if (item.per) {
                newHurt = newHurt + 100 * item.value / 100
            }
        }
        
        let list = this.getbuffList()
        for (let i = 0; i < list.length; i++) {
            const v = list[i];
            switch (parseInt(v.key)) {
                case BUFFGROWTYPE.hurt:
                    cal(v)
                    break;
                case BUFFGROWTYPE.normalHurt:
                    if (type == SKILLTYPE.normal) {
                        cal(v)
                    }
                    break;
                case BUFFGROWTYPE.skillHurt:
                    if (type != SKILLTYPE.normal) {
                        cal(v)
                    }
                    break;
                default:
                    break;
            }
        }
        return newHurt
    }

    // 获取最终经验
    getRealExp (exp: number): number {
        let num: number = exp
        let list = this.getBuffAdd()
        for (let i = 0; i < list.length; i++) {
            const e = list[i];
            if (e.key == "exp") {
                if (e.per) {
                    num = num + exp * e.value / 100
                } else {
                    num = num + e.value
                }
            }
        }
        return Math.ceil(num)
    }
}