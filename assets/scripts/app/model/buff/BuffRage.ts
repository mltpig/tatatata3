import { ATTRTYPE, CAMPTYPE } from "../../other/FightEnum";
import { DS } from "../../other/Global";
import HeroActor from "../hero/HeroActor";
import BuffBase from "./BuffBase";

/**
 * 数值
 */
enum valueType {
    rage        = 1,
    glod        = 2,
    exp         = 3,    
    rageNum     = 4,    // 能量回复，此加成无法还原
    ragePer     = 5,    // 回复百分比能量
    crit2Atk    = 6,    // 暴击率转化为攻击力
    heroRage    = 7,    // 为第一位友军回复携带者能量回复值百分比的能量，最低1点
    rageAtk     = 8,    // 增加3*能量回复值的攻击力
    asAtk       = 9,    // 攻击速度转化为攻击力
    artifact    = 10,   // 神器数量转化为攻击力
    as2r        = 11,   // 攻速增加能量回复
    lv2Atk      = 12,   // 根据自身当前的等级来提升攻击力
}

export default class BuffRage extends BuffBase {

    trigger () {
        if (this.target.campType == CAMPTYPE.hero) {
            let t = <HeroActor> this.target
            if (!t._skill) { return }

            switch (this.data.harmType) {
                case valueType.rage:
                    t._skill.changeRage(this.data.value)
                    break;
                case valueType.exp:
                    t.addExp(this.data.value)
                    break;
                case valueType.rageNum:
                    // 修改基础值
                    let max = t._realValue.getUseAttr(ATTRTYPE.maxRage)
                    let newNum = Math.ceil(max * this.data.value / 100)
                    t._realValue.resetUseAttr(ATTRTYPE.rage, newNum)
                    break;
                case valueType.ragePer:
                    let max1 = t._realValue.getUseAttr(ATTRTYPE.maxRage)
                    let newNum1 = Math.ceil(max1 * this.data.value / 100)
                    t._skill.changeRage(newNum1)
                    break;
                case valueType.crit2Atk:
                    // 暴击率转化为攻击力
                    let critNum = t._realValue.getUseAttr(ATTRTYPE.crit)
                    let atkNum = Math.ceil(critNum * this.data.value / 100)
                    t._realValue.setOtherAddAttr({
                        uid: this.uid,
                        key: "attack",
                        value: atkNum,
                        per: false,
                    })
                    break;
                case valueType.heroRage:
                    let num3 = t._realValue.getUseAttr(ATTRTYPE.rage)
                    let rage2 = Math.ceil(num3 * this.data.value / 100)
                    let hero = this.target.fm.getHeros()[0]
                    hero._skill.changeRage(rage2)
                    break;
                case valueType.rageAtk:
                    let num4 = t._realValue.getUseAttr(ATTRTYPE.rage)
                    let atk = Math.ceil(num4 * this.data.value / 100)
                    t._realValue.setOtherAddAttr({
                        uid: this.uid,
                        key: "attack",
                        value: atk,
                        per: false,
                    })
                    break;
                case valueType.asAtk:
                    // 攻击速度转化为攻击力
                    let asNum = t._realValue.getAtkSpeed()
                    let atkNum2 = Math.ceil(asNum * this.data.value / 100)
                    t._realValue.setOtherAddAttr({
                        uid: this.uid,
                        key: "attack",
                        value: atkNum2,
                        per: false,
                    })
                    break;
                case valueType.artifact:
                    // 神器数量转化为攻击力
                    let fm = this.target.fm
                    let am: number = 0
                    for (let i = 0; i < fm.artifacts.length; i++) {
                        am = am + fm.artifacts[i].num
                    }
                    let am2: number = Math.floor(am * this.data.value)
                    t._realValue.setOtherAddAttr({
                        uid: this.uid,
                        key: "attack",
                        value: am2,
                        per: false,
                    })
                    break;
                case valueType.as2r:
                    // 攻速增加能量回复
                    let asdNum = t._realValue.getAtkSpeed()
                    let asdNum2 = Math.ceil(asdNum * this.data.value / 100)
                    t._realValue.setOtherAddAttr({
                        uid: this.uid,
                        key: "rage",
                        value: asdNum2,
                        per: false,
                    })
                    break;
                case valueType.lv2Atk:
                    // 根据自身当前的等级来提升攻击力
                    let lvNum = DS(t._level) * this.data.value / 100
                    t._realValue.setOtherAddAttr({
                        uid: this.uid,
                        key: "attack",
                        value: lvNum,
                        per: false,
                    })
                    break;
                default:
                    break;
            }
            return
        }
        
        // 其他
        switch (this.data.harmType) {
            case valueType.glod:
                break;
            default:
                break;
        }
    }

    clear () {
        super.clear()
    }
}