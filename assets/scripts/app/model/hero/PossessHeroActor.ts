import HeroManager from "../../manager/HeroManager";
import { SKILLTYPE, STATETYPE } from "../../other/FightEnum";
import { mergeArray } from "../../other/Global";
import ActorBase from "../ActorBase";
import HeroActor from "./HeroActor";

/**
 * 特殊模式：附身战斗
 * 怪物
 */
 const {ccclass, menu, property} = cc._decorator;

 @ccclass
 export default class PossessHeroActor extends HeroActor {
    // 附身数据
    public deputyId: string;
    public deputyData: HEROINFO;
    public deputyNormalId: string;
    public deputySkillId: string;

    // 本身id
    public curNormalId: string;
    public curSkillId: string;
    public possessChange: boolean = false;

    setDeputyId (id: string) {
        this.deputyId = id
        this.deputyData = HeroManager.getHeroDataById(id)

        this.deputyNormalId = this.deputyData.normalSkill.toString()
        this.deputySkillId = this.deputyData.initiativeSkill.toString()

        this.curNormalId = this.normalSkill
        this.curSkillId = this.initiativeSkill
        
        if (this.curNormalId != "0" && this.deputyNormalId != "0") {
            this.possessChange = true
        }

        if (this.curNormalId != "0") {
            this.normalSkill = this.curNormalId
        } else if (this.deputyNormalId != "0") {
            this.normalSkill = this.deputyNormalId
        }
        this.initiativeSkill = this.curSkillId

        if (this.deputyNormalId != "0" || this.curNormalId != "0") {
            if (this._normalStates.length > 0) {
                for (let i = 0; i < this._normalStates.length; i++) {
                    this._normalStates[i].skillId = this.normalSkill
                    this.states.push(this._normalStates[i])
                }
            }
        }
        
        // 附身被动
        let extraStates = this.fm.getStatesByIds(this.deputyData.extraStates)
        this.states = mergeArray(this.states, extraStates)
        this.checkWinkStates()
    }

    setNormalPossess () {
        if (this.normalSkill == this.curNormalId) {
            this.normalSkill = this.deputyNormalId
        } else {
            this.normalSkill = this.curNormalId
        }
    }

    setSkillPossess () {
        if (this.initiativeSkill == this.curSkillId) {
            this.initiativeSkill = this.deputySkillId
        } else {
            this.initiativeSkill = this.curSkillId
        }
    }

    // 发射子弹
    addLaunch (id: string, arg: ActorBase | cc.Vec2, speical: boolean = false) {
        super.addLaunch(id, arg, speical)

        if (speical) { return }

        let def = this._addition.getSkillData(id) as BULLETDATA
        if (def.skillType == SKILLTYPE.normal) {
            if (this.possessChange) {
                this.setNormalPossess()
                for (let i = 0; i < this.states.length; i++) {
                    const v = this.states[i];
                    if (v.pid == STATETYPE.skill && v.pos == SKILLTYPE.normal) {
                        this.states[i].skillId = this.normalSkill
                    }
                }
            }
        } else if (def.skillType == SKILLTYPE.major) {
            this.setSkillPossess()
        }
    }
}