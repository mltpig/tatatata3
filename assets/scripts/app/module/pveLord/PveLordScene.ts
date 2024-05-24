import { UIACT } from "../../../framework/utils/Enumer";
import GameManager from "../../manager/GameManager";
import LayerManager from "../../manager/LayerManager";
import LordActor from "../../model/lord/LordActor";
import LordFightManager from "../../model/LordFightManager";
import UnitManager from "../../model/UnitManager";
import { ATTRTYPE } from "../../other/FightEnum";
import { ES } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import PveScene from "../pve/PveScene";

const {ccclass, property} = cc._decorator;

/**
 * 特殊关卡：领主守卫
 */
@ccclass
export default class PveLordScene extends PveScene {
    public fm: LordFightManager;
    public lord: LordActor;

    private lordItem: cc.Prefab;

    onLoad () {
        super.onLoad()

        this.lordItem = this.fm.getPrefabByName("lordItem")
    }

    initModelData () {
        // lord
        this.createLord({
            hp: ES(20),
            size: cc.size(10,10),
            index: 133,
        })
    }

    showEndView (isWin: boolean) {
        LayerManager.pop({
            script: "PveCommonResult",
            prefab: PATHS.fight + "/pveCommonResult",
            data: isWin,
            type: UIACT.drop_down,
        })   
    }

    // 提升波次 增加领主血量
    initStageDataModel () {
        if (this.fm.isBoss && this.lord) {
            this.lord.addHp(1)
        }
    }
    
    createLord (data: LORDINFO) {
        let script = UnitManager.createLord(this.lordItem, data)
        this.lord = script
    }

    checkFightEnd (): boolean {
        // 强制结束
        if (this.fm.forceEnd) {
            this.fm.isWin = this.fm.pveLose
            this.showFightEnd()
            return true
        }

        // 领主死亡 失败
        if (this.lord._realValue.getUseAttr(ATTRTYPE.hp) <= 0) {
            this.fm.isWin = this.fm.pveLose
            this.showFightEnd()
            return true
        }

        // 胜利 最后一波 所有怪物出完 清场
        if (this.isStageEnd && this.isOutEnd && this.monsters.length == 0) {
            this.fm.isWin = this.fm.pveWin
            this.showFightEnd()
            return true
        }
        
        return false
    }

}