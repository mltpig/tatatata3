import LayerManager from "../manager/LayerManager";
import { RUNESELECTTYPE } from "../other/FightEnum";
import GameUtils from "../other/GameUtils";
import { PATHS } from "../other/Paths";
import FightManager from "./FightManager";

/**
 * 特殊模式：重复符文
 * 
 * 1.单个符文最多可以出现四次
 * 2.同英雄不可以带相同的符文
 * 3.符文大师不给转
 * 
 */
class RepeatFightManager extends FightManager {
    private static cinstance_: RepeatFightManager
    static getInstance (): RepeatFightManager {
        if (!this.cinstance_) {
            this.cinstance_ = new RepeatFightManager()
        }
        return RepeatFightManager.cinstance_
    }
    
    // 选择符文
    selectRune () {
        if (!this.canRandom()) { return }
        this.pauseGame()

        LayerManager.pop({
            script: "RuneSelectLayer",
            prefab: PATHS.fight + "/runeSelectLayer",
            opacity: 180,
            data: RUNESELECTTYPE.more,
        })
    }

    // 选择钢铁符文
    selectMachine () {
        if (this.canMachine()) {
            this.pauseGame()
            LayerManager.pop({
                script: "MachineSelectLayer",
                prefab: PATHS.fight + "/machineSelectLayer",
                opacity: 180,
            })
        } else {
            GameUtils.messageHint("英雄未机械化符文超过4个方可开启")
        }
    }
}

export default RepeatFightManager