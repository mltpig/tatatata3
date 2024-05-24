import DisUtils from "../../../framework/utils/DisUtils";
import EventDispatcher from "../../../framework/utils/EventDispatcher";
import GameManager from "../../manager/GameManager";
import StaticManager from "../../manager/StaticManager";
import { COMMONLOGICTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { RUNETYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { checkArrayIn, checkArrayInKey, DS, ES, random1 } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 随机符文 / 神器
 */
@ccclass
export default class RandomLayer extends GameView {
    private numTxt: cc.Label;
    private refreshTxt: cc.Label;
    private failTxt: cc.Node;
    private failBtn: cc.Node;
    private runeDatas: Array<RUNEDATA> = [];
    private runeList: Array<RUNEDATA> = [];

    private fm = GameManager.getFM();
    private hasClick: boolean = false;

    onLoad () {
        super.onLoad()

        this.numTxt = this.getCpByType("numTxt", cc.Label)
        this.refreshTxt = this.getCpByType("refreshTxt", cc.Label)
        this.failTxt = this.getNode("failTxt")
        this.failBtn = this.getNode("failBtn")
        this.numTxt.string = "";
        this.refreshTxt.string = "";
    }

    showComplete_ () {
        this.numTxt.string = DS(this.fm.curRandom).toString()

        this.runeDatas = StaticManager.getRune()
        // 去重
        let full: boolean = this.fm.isRuneFull()
        for (let i = 0; i < this.runeDatas.length; i++) {
            if (this.runeDatas[i].type == RUNETYPE.rune) {
                let skip = full || checkArrayIn(this.fm.gainEquips, this.runeDatas[i].id)
                if (skip) {
                    this.runeDatas.splice(i,1)
                    i--
                }
            }
        }
        // 随机
        for (let i = 0; i < 3; i++) {
            let index = random1(0, this.runeDatas.length)
            let runeData = this.runeDatas[index]
            if (runeData) {
                this.runeList.push(runeData)
                this.runeDatas.splice(index,1)
                
                let j = i + 1
                DisUtils.replaceSprite(PATHS.rune + "/" + runeData.img, this.getNode("runeIcon_" + j))
                this.getNode("typeTxt_" + j).getComponent(cc.Label).string = runeData.type == RUNETYPE.rune ? "符文" : "神器"
                this.getNode("typeTxt_" + j).color = runeData.type == RUNETYPE.rune ? cc.Color.GREEN : cc.Color.YELLOW
                this.getNode("nameTxt_" + j).getComponent(cc.Label).string = runeData.name
                this.getNode("runeDes_" + j).getComponent(cc.Label).string = runeData.des
            }
        }
        
        this.showRefresh()
    }

    // 刷新相关显示
    showRefresh () {
        this.hasClick = false
        this.refreshTxt.string = "刷新次数: " + DS(this.fm.runeRefresh)
    }

    // 再次显示
    showAgain () {
        this.runeDatas = []
        this.runeList = []
        this.showComplete_()
    }

    // 检测下一符文
    checkRune () {
        if (this.fm.canRandom()) {
            this.showAgain()
        }else {
            this.dispatchEvent_(Events.fight_resumeGame_event)
            this.close_()
        }
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "runeBg_1":
            case "runeBg_2":
            case "runeBg_3":
                if (this.hasClick) { return }

                let arr = name.split("_")
                let index = parseInt(arr[1]) - 1
                if (!this.runeList[index]) { return }
                
                this.fm.costRandom()

                // 实例化
                this.runeList[index].uid = this.fm.uniqueId.toString()
                this.fm.addEquip(this.runeList[index])
                this.hasClick = true

                EventDispatcher.dispatchEvent(Events.game_logic_event, {
                    type: COMMONLOGICTYPE.rune
                })

                this.checkRune()
                break;
            case "refreshBtn":
                // 刷新
                if (DS(this.fm.runeRefresh) > 0) {
                    this.fm.runeRefresh = ES(DS(this.fm.runeRefresh) - 1)
                    this.showAgain()
                } else {
                    GameUtils.messageHint("刷新次数不足!")
                }
                break;
            case "failBtn":
                // 放弃
                this.fm.costRandom()
                this.fm.runeRefresh = ES(DS(this.fm.runeRefresh) + 3)
                GameUtils.messageHint("放弃成功!")
                this.checkRune()
                break;
            default:
                break;
        }
    }
}