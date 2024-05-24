import { ES } from "../other/Global";
import FightManager from "./FightManager";

/**
 * 特殊模式：旅行者营地
 */
class CampFightManager extends FightManager {
    private static cinstance_: CampFightManager
    static getInstance (): CampFightManager {
        if (!this.cinstance_) {
            this.cinstance_ = new CampFightManager()
        }
        return CampFightManager.cinstance_
    }
    
    // 达到限制时间
    public campTimeLimit: string;

    // 剩余击杀数
    getCampLastNum (): number {
        return this.pveScene.outMonsters.length
    }
}

export default CampFightManager