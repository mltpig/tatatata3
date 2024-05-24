import { ES } from "../other/Global";
import FightManager from "./FightManager";

/**
 * 特殊模式：克隆大作战
 */
class CloneFightManager extends FightManager {
    private static cinstance_: CloneFightManager
    static getInstance (): CloneFightManager {
        if (!this.cinstance_) {
            this.cinstance_ = new CloneFightManager()
        }
        return CloneFightManager.cinstance_
    }

    // 克隆角色
    public cloneData: HEROINFO;
    // 映射关卡数据
    public stageCloneDatas: Array<WAVESTAGEDATA>;

    initModel () {
        this.curRandom = ES(2)
    }   

    addBattleIndex (index: number, id: string) {}
    delBattleIndex (id: string) {}
}

export default CloneFightManager