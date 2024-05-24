import LayerManager from "../manager/LayerManager";
import { RUNESELECTTYPE } from "../other/FightEnum";
import GameUtils from "../other/GameUtils";
import { PATHS } from "../other/Paths";
import FightManager from "./FightManager";

/**
 * 特殊模式：自选符文战
 */
class SelectFightManager extends FightManager {
    private static cinstance_: SelectFightManager
    static getInstance (): SelectFightManager {
        if (!this.cinstance_) {
            this.cinstance_ = new SelectFightManager()
        }
        return SelectFightManager.cinstance_
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

export default SelectFightManager