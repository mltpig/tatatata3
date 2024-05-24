import { UIACT } from "../../../framework/utils/Enumer";
import LayerManager from "../../manager/LayerManager";
import PossessHeroActor from "../../model/hero/PossessHeroActor";
import PossessFightManager from "../../model/PossessFightManager";
import UnitManager from "../../model/UnitManager";
import Contants from "../../other/Contants";
import { DS, splice } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import PveScene from "../pve/PveScene";

const {ccclass, property} = cc._decorator;

/**
 * 特殊关卡：附身战斗
 */
@ccclass
export default class PvePossessScene extends PveScene {
    public fm: PossessFightManager;
    public possessNode: cc.Node;
    public deputyHeros: Array<PossessHeroActor> = [];

    onLoad () {
        super.onLoad()

        this.possessNode = this.getNode("possessNode");
        this.possessNode.active = true
    }

    startModel () {
        this.fightScript.startFight()
        this.possessNode.active = false
    }

    initModelData () {
        // 附身位置
        for (let i = 1; i <= 4; i++) {
            var pos = new cc.Vec2(-42 + (i - 1) * 90, 251);
            this.towers.push({
                index: -i,
                pos: pos,
                node: null,
                rect: cc.rect(pos.x - Contants.MAP_CLEN, pos.y - Contants.MAP_CLEN, Contants.MAP_LEN, Contants.MAP_LEN)
            })
        }
    }

    createHero (data: HEROINFO, pos: cc.Vec2, index: number) {
        if (index > 0 && this.fm.checkUp()) {
            return
        }
        
        let hero = UnitManager.createPossessHero(this.heroItem, data, pos)
        hero.script.setTowerIndex(index)

        if (index < 0) {
            // 附身
            this.deputyHeros.push(hero.script)
            // 重设ide
            for (let i = 0; i < this.deputyHeros.length; i++) {
                let h = this.deputyHeros[i]
                h.setIde(Math.abs(h.towerIndex))
                h.showRange(false)
            }
        } else {
            // 上场
            this.heros.push(hero.script)
            // 重设ide
            for (let i = 0; i < this.heros.length; i++) {
                this.heros[i].setIde(i+1)
            }
            this.heroNum.string = this.heros.length + "/" + DS(this.fm.maxUp)
        }
        
        this.fm.addBattleIndex(index, data.id)
        this.changeHeroTower(index, true, hero.node)
    }

    deleteHero (hero: PossessHeroActor) {
        let heros = hero.towerIndex > 0 ? this.heros : this.deputyHeros

        splice(heros, function (script: PossessHeroActor) {
            return script.towerIndex == hero.towerIndex
        }.bind(this))

        if (hero.towerIndex > 0) {
            // 重设ide
            for (let i = 0; i < this.heros.length; i++) {
                this.heros[i].setIde(i+1)
            }
        } 
        
        this.fm.delBattleIndex(hero.data.id)
        this.changeHeroTower(hero.towerIndex, false)
        hero.clear()
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