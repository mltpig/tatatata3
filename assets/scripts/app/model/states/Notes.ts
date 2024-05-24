import { CONDITIONTYPE } from "../../other/FightEnum";
import ActorBase from "../ActorBase";

interface NOTETIME {
    uid: string,
    type: CONDITIONTYPE,
    num: number,
    data: Array<any>;
}

/**
 * 其他相关条件记录类
 */
export default class Notes {
    private target: ActorBase;

    private timeNotes: Array<NOTETIME> = [];

    constructor (target) {
        this.target = target
    }

    addTimeNotes (uid: string, type: CONDITIONTYPE, condi: Array<any>) {
        let bid = uid.toString()
        this.timeNotes.push({
            uid: uid.toString(),
            type: type,
            num: 0,
            data: condi,
        })
    }

    updateTimeNotes (dt : number) {
        for (const key in this.timeNotes) {
            switch (this.timeNotes[key].type) {
                case CONDITIONTYPE.cd:
                case CONDITIONTYPE.atkSpeed:
                case CONDITIONTYPE.timer:
                    this.timeNotes[key].num = this.timeNotes[key].num + dt
                    break;
                default:
                    break;
            }
        }
    }

    getTimeNotes (uid: string, type: CONDITIONTYPE): number {
        for (const v of this.timeNotes) {
            if (v.uid == uid.toString() && v.type == type) {
                return v.num
            }
        }
        return 0
    }

    clearTimeNotes (uid: string) {
        for (let i = 0; i < this.timeNotes.length; i++) {
            if (this.timeNotes[i].uid == uid.toString()) {
                this.timeNotes[i].num = 0
            }
        }
    }

    update2 (dt : number) {
        this.updateTimeNotes(dt)
    }

    clearNotes (uid: string) {
        this.clearTimeNotes(uid)
    }

    // 击杀记录
    addKillNotes (bullet?: BULLETDATA) {
        this.checkAddSuccess(CONDITIONTYPE.kill, [])
    }

    // 技能记录
    addSkillNotes (bullet: BULLETDATA) {
        let skillType = bullet.skillType
        this.checkAddSuccess(CONDITIONTYPE.skill, [skillType])
    }

    addAttackNotes () {
        this.checkAddSuccess(CONDITIONTYPE.atkNum, [])
    }
    
    // 检测条件符合
    checkAddSuccess (type: CONDITIONTYPE, data: Array<any>) {
        for (let i = 0; i < this.timeNotes.length; i++) {
            let note = this.timeNotes[i]
            if (note.type == type) {
                let can = true
                for (let j = 0; j < note.data.length; j++) {
                    if (note.data[j] != data[j]) {
                        can = false
                        break
                    }
                }
                if (can) {
                    this.timeNotes[i].num = this.timeNotes[i].num + 1
                }
            }
        }
    }
}