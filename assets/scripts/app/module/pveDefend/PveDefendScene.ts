import { UIACT, UI_ZORDER } from "../../../framework/utils/Enumer";
import GameManager from "../../manager/GameManager";
import LayerManager from "../../manager/LayerManager";
import DefendFightManager from "../../model/DefendFightManager";
import ShieldActor from "../../model/hero/ShieldActor";
import LordActor from "../../model/lord/LordActor";
import DefendMonsterActor from "../../model/monster/DefendMonsterActor";
import UnitManager from "../../model/UnitManager";
import Contants from "../../other/Contants";
import Events from "../../other/Events";
import { ATTRTYPE, PVESTATE, STATETYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { DS, ES } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import PveScene from "../pve/PveScene";
import DefendLayer from "./DefendLayer";
import ShieldIcon from "./ShieldIcon";

const {ccclass, property} = cc._decorator;

/**
 * 特殊关卡：防守
 */
@ccclass
export default class PveDefendScene extends PveScene {
    public fm: DefendFightManager;

    private lordItem: cc.Prefab;
    private shieldItem: cc.Prefab;
    private shieldIcon: cc.Prefab;

    private lord: LordActor;
    private shields: Array<ShieldActor> = [];
    public monsters: Array<DefendMonsterActor> = [];
    public roads: Array<TOWERDATA> = [];

    public defendLayer: cc.Prefab;
    public defendScript: DefendLayer;
    private shieldScript: ShieldIcon;

    onLoad () {
        super.onLoad()

        this.fm = GameManager.getFM() as DefendFightManager

        this.lordItem = this.fm.getPrefabByName("lordItem")
        this.shieldItem = this.fm.getPrefabByName("shieldItem")
        this.defendLayer = this.fm.getPrefabByName("defendLayer")
        this.shieldIcon = this.fm.getPrefabByName("shieldIcon")

        this.addEventListener_(Events.defend_soul_event, this.addSoul)
    }

    initModel () {
        // 显示界面
        let view = cc.instantiate(this.defendLayer)
        view.setPosition(0,0)
        this.canvas.addChild(view, UI_ZORDER.dragUpZoder)
        this.defendScript = view.getComponent(DefendLayer)
    }

    initModelData () {
        // lord
        this.createLord({
            hp: ES(3),
            size: cc.size(75,75),
            index: 133,
        })

        // road
        let roads = this.mapView.roads
        for (const v of roads) {
            let pos = this.fm.getCachPos(v)
            this.roads.push({
                index: v,
                pos: pos,
                node: null,
                rect: cc.rect(pos.x - Contants.MAP_CLEN, pos.y - Contants.MAP_CLEN, Contants.MAP_LEN, Contants.MAP_LEN)
            })
        }
    }

    setShieldItem (data: SHIELDDEFENDLIST) {
        let node = cc.instantiate(this.shieldIcon) as cc.Node
        this.shieldScript = node.getComponent(ShieldIcon)
        this.canvas.addChild(node, UI_ZORDER.selectZoder)
        this.shieldScript.setData(data)
    }

    /************************** 点击事件 **************************/

    onModelTouchStart (event) { 
        if (this.pveState != PVESTATE.battle) { return }
        let pos = this.canvas.convertToNodeSpaceAR(event.getLocation())

        let children = this.defendScript.shieldList.content.children
        for (let i = 0; i < children.length; i++) {
            const element = children[i];
            let rect: cc.Rect = element.getBoundingBoxToWorld()
            let newPos: cc.Vec2 = this.canvas.convertToNodeSpaceAR(cc.v2(rect.x, rect.y))
            let newRect: cc.Rect = new cc.Rect(newPos.x, newPos.y, rect.width, rect.height)
            if (newRect.contains(pos)) {
                let script = element.getComponent(ShieldIcon)
                this.setShieldItem(script.data)
                this.shieldScript.node.setPosition(pos)
                this.defendScript.showShieldList(false)
                return
            }
        }
    }

    onModelTouchMove (event) {
        if (this.pveState != PVESTATE.battle) { return }
        if (this.shieldScript) {
            let pos = this.canvas.convertToNodeSpaceAR(event.getLocation())
            this.shieldScript.node.setPosition(pos)
        }
    }

    onModelTouchEnds (event) { 
        if (this.pveState != PVESTATE.battle) { return }
        this.checkShieldPlace(event)
    }

    onModelTouchCancel (event) {
        if (this.pveState != PVESTATE.battle) { return }
        this.checkShieldPlace(event)
    }

    checkShieldPlace (event) {
        if (!this.shieldScript) { return }

        let pos = this.canvas.convertToNodeSpaceAR(event.getLocation())
        for (let i = 0; i < this.roads.length; i++) {
            const element = this.roads[i];
            if (element.rect.contains(pos)) {
                this.createShield(this.shieldScript.shieldData, element.pos)
                this.fm.delShiled(this.shieldScript.shieldData.id)
            }
        }
        
        if (this.shieldScript) {
            this.shieldScript.node.destroy()
            this.shieldScript = undefined
            this.defendScript.showShieldList(true)
        }
    }

    createMonster (data: MONSTERQUEUE) {
        let script = UnitManager.createDefendMonster(this.monsterItem, data.id)
        script.setRate(data.rate, data.level)
        script.setPath(data.pathId)
        this.monsters.push(script)
        this.addMonsterSeason(script)
    }

    createLord (data: LORDINFO) {
        let script = UnitManager.createLord(this.lordItem, data)
        this.lord = script
    }

    createShield (data: SHIELDDATA, pos: cc.Vec2) {
        let script = UnitManager.createShield(this.shieldItem, data, pos)
        this.shields.push(script)
    }

    addSoul (event) {
        this.fm.addSoul(1)
    }

    startModel () {
        this.defendScript.startFight()
    }

    updateModel (dt: number) {
        // shield
        for (let i = 0; i < this.shields.length; i++) {
            let v = this.shields[i]
            if (v.onState(STATETYPE.finish)) {
                v.clear()
                this.shields.splice(i,1)
                i--
            } else {
                v.update2(dt)
            }
        }

        this.defendScript.update(dt)
    }

    checkFightEnd (): boolean {
        // 领主死亡 失败
        if (this.lord._realValue.getUseAttr(ATTRTYPE.hp) <= 0) {
            this.fm.isWin = this.fm.pveLose
            this.showFightEnd()
            return true
        }

        // 达到时间 胜利
        if (DS(this.fm.timer) >= DS(this.fm.maxTime)) {
            this.fm.isWin = this.fm.pveWin
            this.showFightEnd()
            return true
        }

        return false
    }

    showEndView (isWin: boolean) {
        LayerManager.pop({
            script: "pveCommonResult",
            prefab: PATHS.fight + "/pveCommonResult",
            data: isWin,
            type: UIACT.drop_down,
        })   
    }

}