import { ES } from "../other/Global";
import FightManager from "./FightManager";

/**
 * 特殊模式：多人战斗(6)
 */
class MoreFightManager extends FightManager {
    private static cinstance_: MoreFightManager
    static getInstance (): MoreFightManager {
        if (!this.cinstance_) {
            this.cinstance_ = new MoreFightManager()
        }
        return MoreFightManager.cinstance_
    }
    
    initModel () {
        this.maxUp = ES(6)
    }

}

export default MoreFightManager