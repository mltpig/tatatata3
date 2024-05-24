import StaticManager from "../../manager/StaticManager";
import { ATTRTYPE, SKILLTYPE, SPECIALTYPE } from "../../other/FightEnum";
import { checkArrayIn, DS, random2 } from "../../other/Global";
import ActorBase from "../ActorBase";

/**
 * 特性处理相关
 * 通过buff添加
 * 特性只针对个人
 */

interface SPECIALINFO {
    uid: string,
    type: SPECIALTYPE,
    data: SPECIALDATA,
}

export default class SpecialOwner {
    private target: ActorBase;
    private specialList: Map<SPECIALTYPE, Array<SPECIALINFO>> = new Map();
    
    // sign
    private specialSignSuper: boolean = false;

    constructor (target) {
        this.target = target
        for (let i = 1; i < SPECIALTYPE.length; i++) {
            this.specialList.set(i, [])
        }
    }

    // 添加
    addSpecial (ids: Array<string>): Array<string> {
        let uids: Array<string> = [];
        for (let i = 0; i < ids.length; i++) {
            let v = ids[i];
            let def = StaticManager.getStaticValue("static_special", v) as SPECIALDATA
            let list = this.specialList.get(def.type)
            let uid = this.target.fm.uniqueId.toString()
            uids.push(uid)

            list.push({
                uid: uid,
                data: def,
                type: def.type,
            })
            this.specialList.set(def.type, list)
        }
        return uids
    }

    // 清除
    delSpecial (uids: Array<string>) {
        this.specialList.forEach((value, key) => {
            for (let i = 0; i < value.length; i++) {
                if (checkArrayIn(uids, value[i].uid)) {
                    value.splice(i, 1)
                    i--
                }
            }
        })
    }

    /************************** 特性处理 **************************/

    checkSkillCrit (type: SKILLTYPE): boolean {
        let d = this.specialList.get(SPECIALTYPE.skill_crit)
        if (d.length > 0) { return true }
        return false
    }

    checkSkillPro (data: BULLETDATA, target: ActorBase | cc.Vec2) {
        if (data.skillType != SKILLTYPE.major) { return }

        let d = this.specialList.get(SPECIALTYPE.skill_pro)
        for (let i = 0; i < d.length; i++) {
            let pro = JSON.parse(d[i].data.value)[0]
            if (random2(0, 100) <= pro) {
                this.target.addLaunch(data.id, target, true)
            }
        }
    }

    checkDistance (hitter: ActorBase, type: SKILLTYPE, hurt: number) {
        let d = this.specialList.get(SPECIALTYPE.distance)
        if (d.length == 0) { return 0 }
        if (type != SKILLTYPE.normal) { return 0 }
        
        let newHurt: number = 0
        for (let i = 0; i < d.length; i++) {
            let pos1 = cc.v2(hitter.node.x, hitter.node.y)
            let pos2 = cc.v2(this.target.node.x, this.target.node.y)
            let num = JSON.parse(d[i].data.value)[0]
            let dis = pos1.sub(pos2).mag()
            let h = Math.floor(dis / 100) * num / 100 * hurt 
            newHurt = newHurt + h
        }

        return newHurt
    }

    checkCampAtk (hitter: ActorBase) {
        let d = this.specialList.get(SPECIALTYPE.campAtk)
        if (d.length == 0) { return 0 }

        if (hitter.campType == this.target.campType) {
            for (let i = 0; i < d.length; i++) {
                let buffs = JSON.parse(d[i].data.value)
                this.target._buffs.addBuffs(buffs, this.target._realValue.realFight)
            }
        }
    }
    
    checkMonsterAppear (hitter: ActorBase) {
        let d = this.specialList.get(SPECIALTYPE.appear)
        if (d.length == 0) { return 0 }

        for (let i = 0; i < d.length; i++) {
            let id = JSON.parse(d[i].data.value)[0]
            this.target.addLaunch(id, hitter, true)
        }
    }

    checkSkillNormal (data: BULLETDATA, target: ActorBase | cc.Vec2) {
        if (data.skillType != SKILLTYPE.normal) { return }

        let d = this.specialList.get(SPECIALTYPE.skill_normal)
        for (let i = 0; i < d.length; i++) {
            this.target.addLaunch(data.id, target, true)
        }
    }

    checkCrit (): number {
        let d = this.specialList.get(SPECIALTYPE.crit)
        if (d.length == 0) { return 1 }

        let num: number = 1
        for (let i = 0; i < d.length; i++) {
            num = num + JSON.parse(d[i].data.value)[0]
        }
        return num 
    }

    checkCritHurt (): number {
        let d = this.specialList.get(SPECIALTYPE.critHurt)
        if (d.length == 0) { return 1 }

        let num: number = 1
        for (let i = 0; i < d.length; i++) {
            num = num + JSON.parse(d[i].data.value)[0]
        }
        return num 
    }
    
    // 全体加攻击
    checkRage2Atk (rage: number) {
        let d = this.specialList.get(SPECIALTYPE.rage2Atk)
        if (d.length == 0) { return }
        
        let heros = this.target.fm.getHeros()
        for (let i = 0; i < d.length; i++) {
            let pro = JSON.parse(d[i].data.value)[0]
            let num = Math.floor(rage * pro / 100)
            for (let j = 0; j < heros.length; j++) {
                heros[j]._realValue.setOtherAddAttr({
                    uid: "-1",
                    key: "attack",
                    value: num,
                    per: false,
                })
            }
        }
    }

    // 主动技能释放加buff
    checkActiveSkill (hitter: ActorBase) {
        let d = this.specialList.get(SPECIALTYPE.activeSkill)
        if (d.length == 0) { return 0 }

        for (let i = 0; i < d.length; i++) {
            let data = JSON.parse(d[i].data.value)
            if (data && data != 0) {
                // 加buff
                this.target._buffs.addBuffs(data, this.target._realValue.realFight)
            }   
        }
    }

    // 主动技能释放技能
    checkActiveHurt (hitter: ActorBase) {
        let d = this.specialList.get(SPECIALTYPE.activeHurt)
        if (d.length == 0) { return 0 }

        for (let i = 0; i < d.length; i++) {
            let data = JSON.parse(d[i].data.value)[0]
            if (data && data != 0) {
                // 释放技能
                this.target.addLaunch(data, hitter, true)
            }
        }
    }

    // 等级转化为攻击力
    checkLv2Atk () {
        let d = this.specialList.get(SPECIALTYPE.lv2Atk)
        if (d.length == 0) { return 0 }

        for (let i = 0; i < d.length; i++) {
            let data = JSON.parse(d[i].data.value)[0]
            let num: number = DS(this.target._level) * data
            this.target._realValue.setOtherAddAttr({
                uid: "-1",
                key: "attack",
                value: num,
                per: false,
            })
        }
    }

    // 技能距离增伤
    checkSkillDistance (hitter: ActorBase, type: SKILLTYPE, hurt: number) {
        let d = this.specialList.get(SPECIALTYPE.skillDistance)
        if (d.length == 0) { return 0 }
        if (type == SKILLTYPE.normal) { return 0 }
        
        let newHurt: number = 0
        for (let i = 0; i < d.length; i++) {
            let pos1 = cc.v2(hitter.node.x, hitter.node.y)
            let pos2 = cc.v2(this.target.node.x, this.target.node.y)
            let num = JSON.parse(d[i].data.value)[0]
            let dis = pos1.sub(pos2).mag()
            let h = Math.floor(dis / 100) * num / 100 * hurt 
            newHurt = newHurt + h
        }
        
        return newHurt
    }
    
    // 检测super
    addSuper () { this.specialSignSuper = true }
    checkSuper (): boolean {
        if (this.specialSignSuper) { return false }

        let d = this.specialList.get(SPECIALTYPE.super)
        if (d.length == 0) { return false }

        return true
    }

    // 斩杀
    checkKill (hitter: ActorBase, hurt: number) {
        let d = this.specialList.get(SPECIALTYPE.kill)
        if (d.length == 0) { return hurt }

        let data = JSON.parse(d[0].data.value)[0]
        let pro = hitter._realValue.getUseAttr(ATTRTYPE.hp) / hitter._realValue.getUseAttr(ATTRTYPE.maxHp) * 100
        if (data && data >= pro) {
            let nh: number = hitter._realValue.getUseAttr(ATTRTYPE.hp) + 1
            if (nh > hurt) { return nh }
        }
        return hurt
    }

    /**
     * 存在特性17
     * @returns 
     */
    checkS2Nor (): boolean {
        let d = this.specialList.get(SPECIALTYPE.s2nor)
        if (d.length == 0) { return false }

        return true
    }

    /**
     * 特性18 攻速倍率
     * @returns 
     */
    checkAtkSpeed (): number {
        let d = this.specialList.get(SPECIALTYPE.atkSpeed)
        if (d.length == 0) { return 1 }

        let num: number = 1
        for (let i = 0; i < d.length; i++) {
            num = num + JSON.parse(d[i].data.value)[0]
        }
        return num 
    }

    /**
     * 转化比例
     */
    checkHurt2Normal (hurt: number): number {
        let d = this.specialList.get(SPECIALTYPE.hurt2Normal)
        if (d.length == 0) { return 0 }

        let num: number = 0
        for (let i = 0; i < d.length; i++) {
            num = num + JSON.parse(d[i].data.value)[0] * hurt / 100
        }
        return num 
    }

    // 等级提升暴击伤害
    checkLvAddCritHurt () {
        let d = this.specialList.get(SPECIALTYPE.lvAddCritHurt)
        if (d.length == 0) { return 0 }

        for (let i = 0; i < d.length; i++) {
            let num = JSON.parse(d[i].data.value)[0]
            this.target._realValue.setOtherAddAttr({
                uid: "-1",
                key: "critHurt",
                value: num,
                per: false,
            })
        }
    }

}