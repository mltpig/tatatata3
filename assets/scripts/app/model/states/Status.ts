import { STATUSTYPE } from "../../other/FightEnum";
import ActorBase from "../ActorBase";

/**
 * 角色状态管理类
 */
export default class Status {
    private target: ActorBase;
    private statusList: Array<STATUSDATA> = [];

    constructor (target) {
        this.target = target
    }

    addStatus (data: STATUSDATA) {
        this.statusList.push(data)
    }

    delStatus (uid: string) {
        for (let i = 0; i < this.statusList.length; i++) {
            if (this.statusList[i].uid == uid) {
                this.statusList.splice(i,1)
                i--
            }
        }
    }

    // 检测是否存在移动状态受阻的状态
    effectMove (): boolean {
        for (let i = 0; i < this.statusList.length; i++) {
            if (this.statusList[i].type == STATUSTYPE.fixed) {
                return true
            }
        }

        return false
    }

    // 检测buff免疫
    effectBuff (type: number) {
        if (type != 0) { return false }
        
        for (let i = 0; i < this.statusList.length; i++) {
            if (this.statusList[i].type == STATUSTYPE.immune) {
                return true
            }
        }

        return false
    }
}