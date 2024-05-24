import DisUtils from "../../framework/utils/DisUtils"
import { UIACT, UI_ZORDER } from "../../framework/utils/Enumer"
import ResUtils from "../../framework/utils/ResUtils"
import AssetManager from "../manager/AssetManager"
import AudioManager from "../manager/AudioManager"
import GameManager from "../manager/GameManager"
import LayerManager from "../manager/LayerManager"
import SceneManager from "../manager/SceneManager"
import ActorBase from "../model/ActorBase"
import AwardPanel from "../module/common/AwardPanel"
import DetaileLayer from "../module/common/DetaileLayer"
import DialogueLayer from "../module/common/DialogueLayer"
import FlyAward from "../module/common/FlyAward"
import MessageHint from "../module/common/MessageHint"
import FlyAttr from "../module/pve/FlyAttr"
import FlyItem from "../module/pve/FlyItem"
import { MESSAGETYPE, TIPSTYPE } from "./Enum"
import { FLYTYPE, NODEPOOLTYPE, SCENETYPE, STATETYPE } from "./FightEnum"
import { checkArrayIn } from "./Global"
import { PATHS } from "./Paths"
import { TSCENE } from "./Tool"

/**
 * 基础游戏工具类
 */
export default class GameUtils {

    /**
     * 飘字
     * @param str   字符串
     * @param type  飘字类型
     */
    static messageHint(str: string, type: MESSAGETYPE = MESSAGETYPE.client) {
        ResUtils.loadPreb("prefab/common/messageHint", (node: cc.Node) => {
            node.setPosition(0,100)
            TSCENE().addChild(node, UI_ZORDER.popupMessageHint);
            var nodeTs = node.getComponent(MessageHint);
            nodeTs.show(str, type);
        })
    }

    /**
     * 检测目标是否可被子弹攻击
     * @param bullet 检测
     * @param unit 
     */
    static checkTargetAttack (bullet: BULLETDATA, unit: ActorBase): boolean {
        if (!unit || unit.onState(STATETYPE.finish)) {
            return false
        }
        
        let camps = JSON.parse(bullet.campType)
        if (!checkArrayIn(camps, unit.campType)) {
            return false
        }

        return true
    }

    /**
     * 提示框
     * @param word 内容
     * @param callback 回调
     * @param type 类型
     */
    static addTips (word: string, callback: Function, type: TIPSTYPE, opacity: number = 180) {
        LayerManager.pop({
            script: "DialogLayer",
            prefab: PATHS.common + "/dialogLayer",
            type: UIACT.drop_down,
            opacity: opacity,
            data: {
                word: word,
                callback: callback,
                type: type,
            }
        })        
    }

    /**
     * 详情弹出界面
     */
    static detaileList: Array<DetaileLayer> = [];
    static clearDetaile () {
        if (this.detaileList.length == 0) { return }
        
        for (const v of this.detaileList) {
            v.node.destroy()
        }
        this.detaileList = []
    }
    static addDetaile (data: AWARDDATA, node: cc.Node) {
        let startPos: cc.Vec2 = DisUtils.getPositionInNode(node, cc.v2(0, 0), TSCENE())
        let wx = startPos.x > 0 ? -200 : 200
        let wy = startPos.y > 0 ? -150 : 150
        let rx = startPos.x + wx
        let ry = startPos.y + wy

        let self = this
        ResUtils.loadPreb(PATHS.common + "/detaileLayer", (node: cc.Node) => {
            node.setPosition(rx, ry)
            TSCENE().addChild(node, UI_ZORDER.popupDesTips);
            var script = node.getComponent(DetaileLayer);
            script.setData(data)
            self.detaileList.push(script)
        })
    }

    // 飘血
    static fly (word: string, type: FLYTYPE = FLYTYPE.hurt, pos: cc.Vec2) {   
        let prefab = GameManager.getFM().getPrefabByName("flyItem")
        let node = GameManager.getFM().getPool(NODEPOOLTYPE.fly, prefab)
        node.setPosition(pos)
        TSCENE().addChild(node, UI_ZORDER.flyZoder);
        
        var script = node.getComponent(FlyItem);
        script.showFly(word, type)
    }

    // 属性
    static flyUp (type: string, num: number, pos: cc.Vec2) {   
        let prefab = GameManager.getFM().getPrefabByName("flyAttr")
        let node = GameManager.getFM().getPool(NODEPOOLTYPE.attr, prefab)
        node.setPosition(pos)
        TSCENE().addChild(node, UI_ZORDER.flyZoder);
        
        var script = node.getComponent(FlyAttr);
        script.showFly(type, num)
    }

    // 说话
    static talk (word: string, pos: cc.Vec2) {
        ResUtils.loadPreb(PATHS.common + "/dialogueLayer", (node: cc.Node) => {
            node.setPosition(pos)
            TSCENE().addChild(node, UI_ZORDER.dialog);
            var script = node.getComponent(DialogueLayer);
            script.talk(word)  
        })
    }

    // 通用奖励显示列
    static addAward (data: Array<AWARDDATA>, parent: cc.Node, cost: boolean = false) {
        let prefab = AssetManager.getPrefab("awardPanel")
        let node = cc.instantiate(prefab)
        node.setPosition(0,0)
        parent.addChild(node);
        var script = node.getComponent(AwardPanel);
        script.setData(data, cost)
    }

    // 通用奖励弹出窗
    static flyAward (data: Array<AWARDDATA>) {
        ResUtils.loadPreb(PATHS.common + "/flyAward", (node: cc.Node) => {
            node.setPosition(0, 100)
            TSCENE().addChild(node, UI_ZORDER.awardShower);
            var script = node.getComponent(FlyAward);
            script.setData(data)
            script.show()
        })
    }

    // 宝箱奖励弹出效果
    static flyBox (data: AWARDDATA) {
        ResUtils.loadPreb(PATHS.common + "/flyBox", (node: cc.Node) => {
            node.setPosition(0, 100)
            TSCENE().addChild(node, UI_ZORDER.awardShower);
        })
    }

    /**
     * 获取新英雄
     * @param id 
     */
    static inNewHero: boolean = false;
    static newHeroList: Array<string> = [];
    static addHero (id: string) {
        this.newHeroList.push(id.toString())
        if (this.inNewHero) { return }

        this.inNewHero = true
        LayerManager.pop({
            script: "NewHero",
            prefab: PATHS.common + "/newHero",
            data: id,
            backClick: true,
        }) 
    }

    /**
     * 切换scene
     * @param data 
     */
    static loadScene (data: SCENEDATA) {
        let backCb;
        let self = this
        let back = function () {
            let callback = function () {
                AudioManager.playMusic("battle")
                TSCENE().on(cc.Node.EventType.TOUCH_START, self.onTouchStart, self, true)
                if (backCb) { backCb() }
            }
            AssetManager.clearAll()
            cc.director.loadScene(data.name, callback)
        }

        if (data.type == SCENETYPE.none) {
            back()
        } else {
            backCb = SceneManager.loadPveScene(data, back)
        }
    }

    /**
     * 切换scene时监听
     * 经测试 可添加多个点击回调
     */
    static onTouchStart (event) {
        AudioManager.playEffect("click")
        // this.addClickEffect(event.getLocation())
        this.clearDetaile()
    }

    // 点击界面的特效
    // static addClickEffect (pos: cc.Vec2) {
    //     ResUtils.loadPreb(PATHS.common + "/clickPrefab", (node: cc.Node) => {
    //         node.setPosition(pos)
    //         cc.director.getScene().addChild(node, UI_ZORDER.max);
    //     })
    // }
    
    /**
     * 游戏退出清理
     */
    static gameClear () {
    }

}