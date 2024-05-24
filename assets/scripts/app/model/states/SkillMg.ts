import { DS, ES } from "../../other/Global";
import HeroActor from "../hero/HeroActor";
import PossessHeroActor from "../hero/PossessHeroActor";

/**
 * 主动技能管理者
 */
export default class SkillMg {
    private target: HeroActor;
    private rage: string = ES(0);
    private maxRage: string = ES(0);
    private recoveryRage: string = ES(0);
    private full: boolean = false;
    private skillId: string;

    constructor (target) {
        this.target = target
    }
    
    getRage (): string {
        return this.rage
    }

    setSkillId (skillId: string) { 
        this.skillId = skillId
    }

    getSkillData (): BULLETDATA {
        let skillId = this.target.initiativeSkill
        let def = this.target._addition.getSkillData(skillId)
        return def
    }

    setRecoveryRage (rage: number) {
        this.recoveryRage = ES(rage)
    }

    setMaxRage (rage: number) {
        this.maxRage = ES(rage)
    }

    getMaxRage (): number {
        return DS(this.maxRage)
    }
    
    update2 (dt: number) {
        this.changeRage(DS(this.recoveryRage) * dt)
    }

    changeRage (change: number) {
        if (this.full) { return }

        let m = DS(this.rage) + change
        if (m > DS(this.maxRage)) { 
            m = DS(this.maxRage)
            this.full = true
            this.target.showCanCastSkill(true)
        }
        this.rage = ES(m)
        this.target.bloodItem.rageProgress = m / DS(this.maxRage)
    }
    
    fullRage () {
        this.changeRage(DS(this.maxRage))
    }

    costRage () {
        // 消耗能量
        this.target._special.checkRage2Atk(DS(this.rage))

        this.rage = ES(0)
        this.full = false
        this.target.showCanCastSkill(false)
        this.target.bloodItem.rageProgress = 0
    }
    
    isFull () {
        return this.full
    }

}