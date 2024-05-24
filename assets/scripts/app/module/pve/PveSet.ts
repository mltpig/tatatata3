import DisUtils from "../../../framework/utils/DisUtils";
import { UIACT } from "../../../framework/utils/Enumer";
import GameManager from "../../manager/GameManager";
import LayerManager from "../../manager/LayerManager";
import PlayerManager from "../../manager/PlayerManager";
import { TIPSTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import GameUtils from "../../other/GameUtils";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 战斗设置
 */
@ccclass
export default class PveSet extends GameView {
    private effectNode: cc.Toggle;
    private numberNode: cc.Toggle;
    private fastNode: cc.Toggle;
    private enemyNode: cc.Toggle;

    private heroItem: cc.Node;
    private heroNode: cc.Node;

    private fm = GameManager.getFM()

    onLoad () {
        super.onLoad()

        this.effectNode = this.getCpByType("effectNode", cc.Toggle)
        this.numberNode = this.getCpByType("numberNode", cc.Toggle)
        this.fastNode = this.getCpByType("fastNode", cc.Toggle)
        this.enemyNode = this.getCpByType("enemyNode", cc.Toggle)

        this.heroItem = this.getNode("heroItem")
        this.heroNode = this.getNode("heroNode")

        this.effectNode.isChecked = !PlayerManager.isForbidEffect;
        this.numberNode.isChecked = !PlayerManager.isForbidNumber;
        this.fastNode.isChecked = PlayerManager.isForbidFast;
        this.enemyNode.isChecked = PlayerManager.isForbidEnemy;

        this.effectNode.node.on('toggle', this.changeShowEffect, this);
        this.numberNode.node.on('toggle', this.changeShowNumber, this);
        this.fastNode.node.on('toggle', this.changeShowFast, this);
        this.enemyNode.node.on('toggle', this.changeShowEnemy, this);

        let heros = this.fm.getHeros()
        for (let i = 0; i < heros.length; i++) {
            let node: cc.Node;
            if (i == 0) {
                node = this.heroItem
            } else {
                node = cc.instantiate(this.heroItem)
                this.heroNode.addChild(node)
            }

            DisUtils.replaceSprite(PATHS.hero + "/" + heros[i].data.res, node.getChildByName("heroIcon"))
            node.name = heros[i].data.id
            node.on(cc.Node.EventType.TOUCH_END, this.onTouchClick, this)
        }

    }

    changeShowEffect () {
        PlayerManager.resetShowEffect(!this.effectNode.isChecked)
    }

    changeShowNumber () {
        PlayerManager.resetShowNumber(!this.numberNode.isChecked)
    }

    changeShowFast () {
        PlayerManager.resetShowFast(this.fastNode.isChecked)
    }

    changeShowEnemy () {
        PlayerManager.resetShowEnemy(this.enemyNode.isChecked)
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "exitBtn":
                let cb = function (confirm) {
                    if (confirm) {
                        this.fm.forceEnd = true
                        this.close_()
                        this.dispatchEvent_(Events.fight_resumeGame_event)
                    }
                }.bind(this)
                GameUtils.addTips("是否立即结束战斗并结算?", cb, TIPSTYPE.all, 0)
            break;
            case "fightBtn":
                this.close_()
                this.dispatchEvent_(Events.fight_resumeGame_event)
            break;
            default:
                break;
        }
    }

    onTouchClick (event) {
        let id = event.target.name

        LayerManager.pop({
            script: "FightHero",
            prefab: PATHS.common + "/fightHero",
            data: id,
            backClick: true,
            type: UIACT.drop_down,
        }) 
    }

}