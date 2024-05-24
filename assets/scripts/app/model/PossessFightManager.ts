import PvePossessScene from "../module/pvePossess/PvePossessScene";
import GameUtils from "../other/GameUtils";
import FightManager from "./FightManager";
import PossessHeroActor from "./hero/PossessHeroActor";

/**
 * 特殊模式：附身战斗
 */
class PossessFightManager extends FightManager {
    private static cinstance_: PossessFightManager
    static getInstance (): PossessFightManager {
        if (!this.cinstance_) {
            this.cinstance_ = new PossessFightManager()
        }
        return PossessFightManager.cinstance_
    }

    checkDown () {
        let heros = this.pveScene.heros
        if (heros.length <= 0) {
            GameUtils.messageHint("至少上阵一位角色")
            return true
        }
        
        // 检测附身
        let deputyHeros = (this.pveScene as PvePossessScene).deputyHeros
        for (let i = 0; i < heros.length; i++) {
            let has: boolean = false
            for (let j = 0; j < deputyHeros.length; j++) {
                let index: number = Math.abs(deputyHeros[j].IdeIndex - 1)
                if (index == i) {
                    has = true
                    break
                }
            }
            if (!has) {
                GameUtils.messageHint("上阵角色必须全部附身")
                return true
            }
        }

        return false
    }

    startFightModel (list: Array<BATTLEHEROLOCALDATA>) { 
        let heros = this.pveScene.heros
        let deputyHeros = (this.pveScene as PvePossessScene).deputyHeros
        for (let i = 0; i < deputyHeros.length; i++) {
            list.push({
                index: deputyHeros[i].towerIndex,
                pos: deputyHeros[i].startPos,
                heroId: deputyHeros[i].pid,
            })

            // 附身英雄
            let pi = deputyHeros[i].IdeIndex - 1
            if (heros[pi]) {
                (heros[pi] as PossessHeroActor).setDeputyId(deputyHeros[i].pid)
            }
            deputyHeros[i].clear()
        }
        deputyHeros = [];
    }
}

export default PossessFightManager