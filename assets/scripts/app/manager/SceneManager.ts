import PveScene from "../module/pve/PveScene"
import PveCampScene from "../module/pveCamp/PveCampScene"
import PveCloneScene from "../module/pveClone/PveCloneScene"
import pveCommonScene from "../module/pveCommon/pveCommonScene"
import PveDefendScene from "../module/pveDefend/PveDefendScene"
import PveLordScene from "../module/pveLord/PveLordScene"
import PveMoreScene from "../module/pveMore/PveMoreScene"
import PvePossessScene from "../module/pvePossess/PvePossessScene"
import PveRepeatScene from "../module/pveRepeat/PveRepeatScene"
import PveSelectScene from "../module/pveSelect/PveSelectScene"
import PveSuperScene from "../module/pveSuper/PveSuperScene"
import { SCENETYPE } from "../other/FightEnum"
import { TSCENE } from "../other/Tool"
import GameManager from "./GameManager"

/**
 * 战斗场景管理类
 */
class SceneManager {
    
    /**
     * 切换战斗scene
     * @param name 
     */
    static loadPveScene (data: SCENEDATA, callback: Function): Function {
        let cb2 = function () {
            let node = TSCENE()
            switch (data.type) {
                case SCENETYPE.pveDefend:
                    node.addComponent(PveDefendScene)
                    break;
                case SCENETYPE.common:
                    node.addComponent(pveCommonScene)
                    break;
                case SCENETYPE.clone:
                    node.addComponent(PveCloneScene)
                    break;
                case SCENETYPE.select:
                    node.addComponent(PveSelectScene)
                    break;
                case SCENETYPE.camp:
                    node.addComponent(PveCampScene)
                    break;
                case SCENETYPE.more:
                    node.addComponent(PveMoreScene)
                    break;
                case SCENETYPE.possess:
                    node.addComponent(PvePossessScene)
                    break;
                case SCENETYPE.lord:
                    node.addComponent(PveLordScene)
                    break;
                case SCENETYPE.super:
                    node.addComponent(PveSuperScene)
                    break;
                case SCENETYPE.repeat:
                    node.addComponent(PveRepeatScene)
                    break;
                default:
                    node.addComponent(PveScene)
                    break;
            }
        }

        let cb1 = function () {
            GameManager.setFM(data.type)
            let fm = GameManager.getFM()
            fm.initData(data)
            fm.loadPrefabs(callback)
        }

        // load
        cc.director.loadScene("load", cb1)

        return cb2
    }
}

export default SceneManager