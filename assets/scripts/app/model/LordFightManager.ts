import PveLordScene from "../module/pveLord/PveLordScene";
import { ES } from "../other/Global";
import FightManager from "./FightManager";
import LordActor from "./lord/LordActor";

/**
 * 特殊模式：领主守卫
 */
class LordFightManager extends FightManager {
    private static cinstance_: LordFightManager
    static getInstance (): LordFightManager {
        if (!this.cinstance_) {
            this.cinstance_ = new LordFightManager()
        }
        return LordFightManager.cinstance_
    }

    speedLimit: string;

    initModel () {
        this.speedLimit = ES(10)
    }
    
    getLord (): LordActor {
        return (this.pveScene as PveLordScene).lord
    }

}

export default LordFightManager