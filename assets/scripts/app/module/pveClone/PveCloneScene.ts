import { UIACT } from "../../../framework/utils/Enumer";
import LayerManager from "../../manager/LayerManager";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import CloneFightManager from "../../model/CloneFightManager";
import HeroActor from "../../model/hero/HeroActor";
import UnitManager from "../../model/UnitManager";
import { DS } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import PveScene from "../pve/PveScene";

const {ccclass, property} = cc._decorator;

interface CLONEHERODATA {
    data: HEROINFO,
    pos: cc.Vec2,
    index: number,
    heroActor: HeroActor,
}

/**
 * 特殊关卡：克隆大作战
 */
@ccclass
export default class PveCloneScene extends PveScene {
    public fm: CloneFightManager;
    public waveCloneData: WAVEDATA;
    public cloneIndex: number = 0;

    initWaveDataModel () {
        this.cloneIndex = PlayerManager.getCloneModel()
        this.waveCloneData = StaticManager.getWaveCloneData(this.cloneIndex, this.waveData.difficulty)
        this.waveData.map = this.waveCloneData.map
        this.fm.stageCloneDatas = StaticManager.getPveStages(this.waveCloneData.stage_id.toString())
    } 

    initStageDataModel () {
        let stageData: WAVESTAGEDATA = this.fm.stageCloneDatas[DS(this.stageIndex)]
        this.stageData.monsters = stageData.monsters
        this.stageData.route = stageData.route
    }

    createHero (data: HEROINFO, pos: cc.Vec2, index: number, refresh: boolean = true) {
        if (this.fm.checkUp()) {
            return
        }

        let hero = UnitManager.createHero(this.heroItem, data, pos)
        hero.script.setTowerIndex(index)
        this.heros.push(hero.script)
        this.fm.cloneData = data

        // 重设ide
        for (let i = 0; i < this.heros.length; i++) {
            this.heros[i].setIde(i+1)
        }
        
        this.changeHeroTower(index, true, hero.node)
        if (refresh) {
            this.checkCloneHero()
        }
    }

    // 刷新克隆英雄
    checkCloneHero () {
        let list: Array<CLONEHERODATA> = []
        for (let i = 0; i < this.heros.length; i++) {
            let v = this.heros[i]
            if (v.pid != this.fm.cloneData.id) {
                list.push({
                    data: this.fm.cloneData,
                    pos: v.startPos,
                    index: v.towerIndex,
                    heroActor: v,
                })
            }            
        }

        for (let i = 0; i < list.length; i++) {
            this.deleteHero(list[i].heroActor)
            this.createHero(list[i].data, list[i].pos, list[i].index, false)
        }
    }

    createMonster (data: MONSTERQUEUE) {
        let script = UnitManager.createCloneMonster(this.monsterItem, data.id)
        script.setRate(data.rate, data.level)
        script.setPath(data.pathId)
        this.monsters.push(script)
        this.addMonsterSeason(script)
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