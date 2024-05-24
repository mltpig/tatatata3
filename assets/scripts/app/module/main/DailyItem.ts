import ListItem from "../../../framework/creator/ListItem";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import GameUtils from "../../other/GameUtils";
import { DS } from "../../other/Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DailyItem extends ListItem {
    private data: DAILYLOCALDATA;
    private dailyData: DAILYDATA;

    private awardNode: cc.Node;
    private nameTxt: cc.Label;
    private desTxt: cc.Label;
    private numTxt: cc.Label;
    private clickTxt: cc.Label;
    private clickBtn: cc.Button;

    private canGet: boolean;

    onLoad () {
        super.onLoad()

        this.awardNode = this.getNode("awardNode")
        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
        this.desTxt = this.getCpByType("desTxt", cc.Label)
        this.numTxt = this.getCpByType("numTxt", cc.Label)
        this.clickTxt = this.getCpByType("clickTxt", cc.Label)
        this.clickBtn = this.getCpByType("clickBtn", cc.Button)
    }

    setData (data: DAILYLOCALDATA) {
        this.data = data
        this.dailyData = StaticManager.getStaticValue("static_daily_data", data.id.toString())

        this.nameTxt.string = this.dailyData.name
        this.desTxt.string = this.dailyData.des
        let nowNum = DS(data.num)
        let maxNum = this.dailyData.num
        this.numTxt.string = nowNum + "/" + maxNum

        this.canGet = !data.get && nowNum >= maxNum
        this.clickBtn.interactable = this.canGet

        let str = ""
        if (data.get) {
            str = "已领取"
        } else {
            if (nowNum < maxNum) {
                str = "未达成"
            } else {
                str = "领取"
            }
        }
        this.clickTxt.string = str
        this.awardNode.destroyAllChildren()
        GameUtils.addAward(JSON.parse(this.dailyData.prop), this.awardNode)
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "clickBtn":
                // 领取奖励
                if (this.canGet) {
                    PlayerManager.dailyCommand(this.dailyData.id)
                    PlayerManager.addProp(JSON.parse(this.dailyData.prop), true)
                    this.setData(this.data)
                    
                    if (this.list.customCallBack) {
                        this.list.customCallBack(this)
                    }
                }
                break;
            default:
                break;
        }
    }
}