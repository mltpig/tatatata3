import HeroActor from "../hero/HeroActor";

/**
 * 自动施法
 */
export default class AutoSkill {
    private target: HeroActor;
    private _auto: boolean = false;

    constructor (target) {
        this.target = target
    }

    set auto (auto) {
        this._auto = auto
    }
    get auto (): boolean {
        return this._auto
    }

    updateAuto () {
        if (!this._auto) { return }
        if (!this.target._skill.isFull()) { return }

        let def = this.target._skill.getSkillData() as BULLETDATA
        let target = this.target.checkTarget(def)
        if (!target) { return }
        
        // 主动添加内置cd
        if (!this.target.getCd(def.id)) { return }
        this.target.addHandSkill(target)
        this.target.clearCd(def.id)
    }
}