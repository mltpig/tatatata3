import { UIACT } from "../../../framework/utils/Enumer";
import LayerManager from "../../manager/LayerManager";
import SelectFightManager from "../../model/SelectFightManager";
import { PATHS } from "../../other/Paths";
import PveScene from "../pve/PveScene";

const {ccclass, property} = cc._decorator;

/**
 * 特殊关卡：自选符文战
 */
@ccclass
export default class PveSelectScene extends PveScene {
    public fm: SelectFightManager;

    showEndView (isWin: boolean) {
        LayerManager.pop({
            script: "PveCommonResult",
            prefab: PATHS.fight + "/pveCommonResult",
            data: isWin,
            type: UIACT.drop_down,
        })   
    }

}