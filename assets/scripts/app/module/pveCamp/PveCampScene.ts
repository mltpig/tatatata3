import { UIACT } from "../../../framework/utils/Enumer";
import LayerManager from "../../manager/LayerManager";
import CampFightManager from "../../model/CampFightManager";
import { DS } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import PveScene from "../pve/PveScene";

const {ccclass, property} = cc._decorator;

/**
 * 特殊关卡：旅行者营地
 */
@ccclass
export default class PveCampScene extends PveScene {
    public fm: CampFightManager;
    public campDelayTime: number = 0

    initWaveDataModel () {
        this.fm.campTimeLimit = this.waveData.time_limit
    }

    updateRefreshModel () {}
    
    // 出怪
    updateMonster (dt) {
        // 间隔
        this.campDelayTime = this.campDelayTime - dt
        if (this.campDelayTime <= 0) {
            this.campDelayTime = 0.1
        } else {
            return 
        }
        
        // 超上限
        if (this.monsters.length >= 20) { return }

        // 下一波
        if (this.outMonsters.length == 0) {
            // 结束
            if (this.isStageEnd) { return }

            this.refreshStageData()
        }
        
        let item = this.outMonsters.shift();
        // 出怪物
        this.createMonster(item)
        
        this.isOutEnd = this.outMonsters.length == 0
    }
    
    checkFightEnd (): boolean {
        // 达到时间
        if (DS(this.fm.timer) > DS(this.fm.campTimeLimit)) {
            this.fm.isWin = this.fm.pveLose
            this.showFightEnd()
            return true
        }   
        
        // 强制结束
        if (this.fm.forceEnd) {
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
        
    showEndView (isWin: boolean) {
        LayerManager.pop({
            script: "PveCommonResult",
            prefab: PATHS.fight + "/pveCommonResult",
            data: isWin,
            type: UIACT.drop_down,
        })   
    }

}