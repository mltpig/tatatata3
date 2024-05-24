import CCAnimation from "../../../framework/creator/CCAnimation";
import EventDispatcher from "../../../framework/utils/EventDispatcher";
import AudioManager from "../../manager/AudioManager";
import GameManager from "../../manager/GameManager";
import PlayerManager from "../../manager/PlayerManager";
import { COMMONLOGICTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { ATTRTYPE, CAMPTYPE, FLYTYPE, SKILLTYPE, SPECIALTYPE } from "../../other/FightEnum";
import { clone, DS, random2 } from "../../other/Global";
import ActorBase from "../ActorBase";
import FightManager from "../FightManager";
import RealValue from "./RealValue";

/**
 * 伤害管理类
 */
export default class HurtDeal {
    private target: ActorBase;
    private realValue: RealValue;
    private fm: FightManager;

    constructor (target) {
        this.target = target
        this.fm = target.fm 
    }

    init (realValue: RealValue) {
        this.realValue = realValue
    }

    // 攻速转化为伤害值
    getAtkSpeedGrow (bAttr: BULLETDATA, fight: ATTRDATA): number {
        if (bAttr.skillType != SKILLTYPE.normal) { return 1 }
        if (!fight.atkSpeedNum) { return 1}

        let num = DS(fight.atkSpeedNum)
        num = num - 1000
        if (num <= 0) { return 1 }

        let add = Math.floor(num / 200)
        // add = 1 + add * 0.05
        add = 1 + add * 0.1
        return add
    }

    // 能量回复转化为伤害值
    getRageGrow (bAttr: BULLETDATA, fight: ATTRDATA): number {
        if (bAttr.skillType == SKILLTYPE.normal) { return 1 }

        let num = DS(fight.rage)
        num = num - 200
        if (num <= 0) { return 1 }

        // 1转化为0.25%伤害加成
        let add = 1 + num * 0.0025
        return add
    }   

    addHurt (bAttr: BULLETDATA, fight: ATTRDATA) {
        if (this.target.isDead) { return }

        bAttr = clone(bAttr)
        let attacker: ActorBase = this.fm.getHeroByid(fight.uid);
        if (attacker) {
            if (attacker._special.checkS2Nor()) {
                bAttr.skillType = SKILLTYPE.normal
            }
        }

        let hp = this.realValue.getUseAttr(ATTRTYPE.hp)
        let hurt = DS(fight.attack) * bAttr.atk
        let baseHurt: number = hurt

        hurt = hurt * this.getAtkSpeedGrow(bAttr, fight)    // 普攻
        hurt = hurt * this.getRageGrow(bAttr, fight)        // 技能

        hurt = this.target._realValue.getGrowHurt(hurt, bAttr, this.target)
        
        let buffs = JSON.parse(bAttr.buff)
        this.target._buffs.addBuffs(buffs, fight, bAttr)
        
        if (attacker) {
            attacker._special.checkCampAtk(this.target)
            hurt = attacker._realValue.getGrowHurt(hurt, bAttr, this.target)
        }
        
        // 无伤害
        if (hurt == 0) { return }

        // 暴击
        let isCrit: boolean = false
        if (bAttr.crit >= 0) {
            // 技能固有暴击率
            isCrit = random2(0, 100) < bAttr.crit
        } else {
            let can = attacker && attacker._special.checkSkillCrit(bAttr.skillType)
            isCrit = (bAttr.skillType == SKILLTYPE.normal || can) && random2(0, 100) < DS(fight.crit)
        }
        
        if (isCrit) {
            hurt = hurt * DS(fight.critHurt) / 100
        }   

        if (attacker) {
            let dhurt: number = hurt
            hurt = hurt + attacker._special.checkDistance(this.target, bAttr.skillType, dhurt)
            hurt = hurt + attacker._special.checkSkillDistance(this.target, bAttr.skillType, dhurt)
            
            hurt = attacker._special.checkKill(this.target, hurt)   // 斩杀
        }

        hurt = Math.floor(hurt)
        if (hurt < 0) { hurt = 0 }

        let newHp = hp - hurt 
        this.realValue.changeHp(newHp)
        AudioManager.playEffect(bAttr.hitSound)
        
        if (hurt > 0) {
            if (attacker) {
                attacker._notes.addAttackNotes()
            }
        }

        // 击杀
        if (newHp <= 0 && this.target.uable()) {
            if (attacker) {
                attacker._notes.addKillNotes(bAttr)
                // 受击者符合条件 攻击者加击杀buff
                if (this.target._condition.checkCurrent(JSON.parse(bAttr.killCondition))) {
                    attacker._buffs.addBuffs(JSON.parse(bAttr.killBuff), fight, bAttr)
                }
            }
            EventDispatcher.dispatchEvent(Events.fight_kill_exp_event, {
                uid: fight.uid,
                exp: this.realValue.getUseAttr(ATTRTYPE.exp)
            })

            EventDispatcher.dispatchEvent(Events.game_logic_event, {
                type: COMMONLOGICTYPE.kill
            })
            if (this.target.campType == CAMPTYPE.monster) {
                this.target.isDead = true
            }
        }

        this.target.refreshBlood()
        this.addEffect(bAttr.hitEffect)
        if (this.target.uable()) {
            this.fm.addRecord(fight.uid, hurt)
        }

        EventDispatcher.dispatchEvent(Events.game_logic_event, {
            type: COMMONLOGICTYPE.hurt,
            value: hurt,
        })

        if (bAttr.skillType == SKILLTYPE.major) {
            this.fm.dealGlobalSpecial(SPECIALTYPE.activeHurt, {
                target: this.target
            })
        }

        // 额外的符文伤害
        this.addRuneHurt(bAttr, fight, baseHurt, attacker)

        if (this.target.campType == CAMPTYPE.hero) { return }
        if (PlayerManager.isForbidNumber) { return }        // 禁止显示伤害数字
        let type = isCrit ? FLYTYPE.crit : FLYTYPE.hurt
        this.fm.flyNum(hurt.toString(), type, cc.v2(this.target.node.x, this.target.node.y))
    }
    
    addBuffHurt (bInfo: BUFFDATA, bAttr: BULLETDATA, fight: ATTRDATA) {
        if (this.target.isDead) { return }

        bAttr = clone(bAttr)
        let attacker: ActorBase = this.fm.getHeroByid(fight.uid);
        if (attacker) {
            if (attacker._special.checkS2Nor()) {
                bAttr.skillType = SKILLTYPE.normal
            }
        }
        
        let hurt = bInfo.value
        if (bInfo.percent == 1) {
            hurt = Math.floor(DS(fight.attack) * bInfo.value / 100) 
            hurt = hurt <= 0? 1 : hurt
        }
        hurt = this.target._realValue.getGrowHurt(hurt, bAttr, this.target)

        // buff伤害暴击
        let isCrit: boolean = false
        if (bAttr) {
            if (bAttr.crit >= 0) {
                // 技能固有暴击率
                isCrit = random2(0, 100) < bAttr.crit
            } else {
                let can = attacker && attacker._special.checkSkillCrit(bAttr.skillType)
                isCrit = (bAttr.skillType == SKILLTYPE.normal || can) && random2(0, 100) < DS(fight.crit)
            }
        }
        if (isCrit) {
            hurt = hurt * DS(fight.critHurt) / 100
        }   
        
        if (attacker) {
            hurt = attacker._realValue.getGrowHurt(hurt, bAttr, this.target)
        }

        let hp = this.realValue.getUseAttr(ATTRTYPE.hp)
        let newHp = hp - hurt 
        this.realValue.changeHp(newHp)

        // 无伤害
        if (hurt == 0) { return }
        hurt = Math.floor(hurt)
        if (hurt < 0) { hurt = 0 }

        if (hurt > 0) {
            if (attacker) {
                attacker._notes.addAttackNotes()
            }
        }

        // 击杀
        if (newHp <= 0 && this.target.uable()) {
            if (attacker && bAttr) {
                attacker._notes.addKillNotes(bAttr)
                // 受击者符合条件 攻击者加击杀buff
                if (this.target._condition.checkCurrent(JSON.parse(bAttr.killCondition))) {
                    attacker._buffs.addBuffs(JSON.parse(bAttr.killBuff), fight, bAttr)
                }
            }
            EventDispatcher.dispatchEvent(Events.fight_kill_exp_event, {
                uid: fight.uid,
                exp: this.realValue.getUseAttr(ATTRTYPE.exp)
            })
            EventDispatcher.dispatchEvent(Events.game_logic_event, {
                type: COMMONLOGICTYPE.kill
            })
            if (this.target.campType == CAMPTYPE.monster) {
                this.target.isDead = true
            }
        }
        this.target.refreshBlood()
        if (this.target.uable()) {
            this.fm.addRecord(fight.uid, hurt)
        }

        if (this.target.campType == CAMPTYPE.hero) { return }
        if (PlayerManager.isForbidNumber) { return }        // 禁止显示伤害数字
        let type = isCrit ? FLYTYPE.crit : FLYTYPE.hurt
        this.fm.flyNum(hurt.toString(), type, cc.v2(this.target.node.x, this.target.node.y))
    }

    /**
     * 符文特性造成的伤害
     */
    addRuneHurt (bAttr: BULLETDATA, fight: ATTRDATA, oldHurt: number, attacker: ActorBase) {
        if (this.target.isDead) { return }
        if (!attacker) { return }

        let hurt: number = attacker._special.checkHurt2Normal(oldHurt)
        if (hurt <= 0) { return }

        bAttr = clone(bAttr)
        bAttr.skillType = SKILLTYPE.normal

        let hp = this.realValue.getUseAttr(ATTRTYPE.hp)

        hurt = hurt * this.getAtkSpeedGrow(bAttr, fight)    // 普攻
        // hurt = hurt * this.getRageGrow(bAttr, fight)        // 技能

        hurt = this.target._realValue.getGrowHurt(hurt, bAttr, this.target)

        attacker._special.checkCampAtk(this.target)
        hurt = attacker._realValue.getGrowHurt(hurt, bAttr, this.target)

        // 无伤害
        if (hurt == 0) { return }

        // 暴击
        let isCrit: boolean = false
        if (bAttr.crit >= 0) {
            // 技能固有暴击率
            isCrit = random2(0, 100) < bAttr.crit
        } else {
            let can = attacker && attacker._special.checkSkillCrit(bAttr.skillType)
            isCrit = (bAttr.skillType == SKILLTYPE.normal || can) && random2(0, 100) < DS(fight.crit)
        }
        
        if (isCrit) {
            hurt = hurt * DS(fight.critHurt) / 100
        }   

        let dhurt: number = hurt
        hurt = hurt + attacker._special.checkDistance(this.target, bAttr.skillType, dhurt)
        // hurt = hurt + attacker._special.checkSkillDistance(this.target, bAttr.skillType, dhurt)
        
        hurt = attacker._special.checkKill(this.target, hurt)   // 斩杀

        hurt = Math.floor(hurt)
        if (hurt < 0) { hurt = 0 }

        let newHp = hp - hurt 
        this.realValue.changeHp(newHp)
        
        if (hurt > 0) {
            attacker._notes.addAttackNotes()
        }

        // 击杀
        if (newHp <= 0 && this.target.uable()) {
            attacker._notes.addKillNotes(bAttr)
            
            EventDispatcher.dispatchEvent(Events.fight_kill_exp_event, {
                uid: fight.uid,
                exp: this.realValue.getUseAttr(ATTRTYPE.exp)
            })

            EventDispatcher.dispatchEvent(Events.game_logic_event, {
                type: COMMONLOGICTYPE.kill
            })

            if (this.target.campType == CAMPTYPE.monster) {
                this.target.isDead = true
            }
        }

        this.target.refreshBlood()
        if (this.target.uable()) {
            this.fm.addRecord(fight.uid, hurt)
        }

        EventDispatcher.dispatchEvent(Events.game_logic_event, {
            type: COMMONLOGICTYPE.hurt,
            value: hurt,
        })

        // if (bAttr.skillType == SKILLTYPE.major) {
        //     this.fm.dealGlobalSpecial(SPECIALTYPE.activeHurt, {
        //         target: this.target
        //     })
        // }

        if (this.target.campType == CAMPTYPE.hero) { return }
        if (PlayerManager.isForbidNumber) { return }        // 禁止显示伤害数字
        let type = isCrit ? FLYTYPE.crit : FLYTYPE.hurt
        this.fm.flyNum(hurt.toString(), type, cc.v2(this.target.node.x, this.target.node.y))
    }

    addLordHurt () {
        let hp = this.realValue.getUseAttr(ATTRTYPE.hp)
        let newHp = hp - 1
        this.realValue.changeHp(newHp)

        this.target.refreshBlood()
    }

    // 添加特效
    addEffect (res: string) {
        if (!this.target.effectNode) { return }
        
        if (parseInt(res) != 0) {
            let node = new cc.Node()
            node.setPosition(0,0)
            this.target.effectNode.addChild(node)

            let effect = node.addComponent(CCAnimation)
            GameManager.getFM().playEffect(effect, "hitEffect/", res, cc.WrapMode.Normal)
            effect.autoRemove()
        }
    }
}