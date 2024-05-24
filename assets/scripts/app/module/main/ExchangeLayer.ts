import List from "../../../framework/creator/List";
import HeroManager from "../../manager/HeroManager";
import PlayerManager from "../../manager/PlayerManager";
import Contants from "../../other/Contants";
import { TIPSTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import GameUtils from "../../other/GameUtils";
import { DS } from "../../other/Global";
import GameView from "../GameView";
import ExchangeItem from "./ExchangeItem";

const {ccclass, property} = cc._decorator;

/**
 * 兑换界面
 */
@ccclass
export default class ExchangeLayer extends GameView {
    private heroList: List;
    private numTxt: cc.Label;
    private costTxt: cc.Label;

    private heroData: Array<HEROINFO>;
    private heroExchange: Map<string, number> = new Map();

    private exNum: number = 1;

    onLoad () {
        super.onLoad()

        this.heroList = this.getCpByType("heroList", List)
        this.numTxt = this.getCpByType("numTxt", cc.Label)
        this.costTxt = this.getCpByType("costTxt", cc.Label)

        this.heroData = HeroManager.heroData
        this.heroList.numItems = this.heroData.length
        this.showSoul()
        this.costTxt.string = "消耗数量:0"
    }

    showSoul () {
        this.numTxt.string = "灵魂碎片:" + DS(PlayerManager.soulNumber).toString()
    }   

    onHeroListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(ExchangeItem)
        let num = this.heroExchange.get(this.heroData[idx].id)
        num = num ? num : 0
        cell.setData(this.heroData[idx], this.addPath.bind(this), num)    
    }

    addPath (item: ExchangeItem) {  
        let soul = PlayerManager.soulNumber
        let m: number = 0
        this.heroExchange.forEach((value, key) => {
            m = m + value
        });
        let cost: number = (m + this.exNum)* DS(Contants.S2P)
        if (cost > DS(soul)) {
            //灵魂碎片不足
            GameUtils.messageHint("灵魂碎片不足")
            return 
        }

        let id: string = item.data.id
        let num = this.heroExchange.get(id)
        num = num ? num + this.exNum : this.exNum
        this.heroExchange.set(id, num)
        item.setNum(num)

        this.costTxt.string = "消耗数量:" + cost.toString()
    }

    closeComplete_ () {
        super.closeComplete_()
        this.dispatchEvent_(Events.hero_update_event)
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "resolveBtn":
                // 一键分解(满阶英雄可分解)
                let soul = PlayerManager.getHeroSoul()
                if (soul == 0) {
                    GameUtils.messageHint("当前可转化灵魂碎片为0")
                    return
                }

                let refresh = ()=> {
                    this.showSoul()
                    GameUtils.messageHint("转化成功")
                }
                let des: string = "当前满阶英雄溢出的碎片，可兑换灵魂碎片的数量为：" + soul + ",是否兑换？"
                GameUtils.addTips(des, (confirm)=> {
                    if (confirm) {
                        PlayerManager.heroSoul()
                        refresh()
                    }
                }, TIPSTYPE.all)
                break;
            case "exchangeBtn":
                // 兑换（非满阶英雄可选）
                if (this.heroExchange.size == 0) {
                    GameUtils.messageHint("未选择英雄")
                    return
                }

                PlayerManager.heroSoul2Path(this.heroExchange)
                GameUtils.messageHint("转化成功")

                // 刷新
                this.heroExchange.clear()
                this.heroList.updateAll()
                this.showSoul()
                this.costTxt.string = "消耗数量:0"
                break;
            case "num1Btn":
                this.exNum = 1
                break;
            case "num2Btn":
                this.exNum = 10
                break;
            case "num3Btn":
                this.exNum = 100
                break;
            default:
                break;
        }
    }
}
