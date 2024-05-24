import ListItem from "../../../framework/creator/ListItem";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import { ACHIEVETYPE } from "../../other/Enum";
import GameUtils from "../../other/GameUtils";
import { DS } from "../../other/Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AchieveItem extends ListItem {
    private data: ACHIEVELOCALDATA;
    private achieveData: ACHIEVEDATA;

    private awardNode: cc.Node;
    private desTxt: cc.Label;
    private nameTxt: cc.Label;
    private numTxt: cc.Label;
    private clickTxt: cc.Label;
    private clickbtn: cc.Button;
    
    private canGet: boolean;

    onLoad () {
        super.onLoad()

        this.awardNode = this.getNode("awardNode")
        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
        this.desTxt = this.getCpByType("desTxt", cc.Label)
        this.numTxt = this.getCpByType("numTxt", cc.Label)
        this.clickTxt = this.getCpByType("clickTxt", cc.Label)
        this.clickbtn = this.getCpByType("clickbtn", cc.Button)
    }

    setData (data: ACHIEVELOCALDATA) {
        this.data = data
        this.achieveData = StaticManager.getStaticValue("static_achieve_data", data.id)

        this.nameTxt.string = this.achieveData.name
        this.desTxt.string = this.achieveData.des
        let nowNum = DS(data.num)
        let maxNum = this.achieveData.num
        this.numTxt.string = nowNum + "/" + maxNum

        this.showWave()

        this.canGet = !data.get && nowNum >= maxNum
        this.clickbtn.interactable = this.canGet

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
        GameUtils.addAward(JSON.parse(this.achieveData.prop), this.awardNode)
    }

    showWave () {
        if (this.data.type != ACHIEVETYPE.diff) { return }

        let oldWave: WAVEDATA = StaticManager.getWaveData(DS(this.data.num).toString())
        let upWave: WAVEDATA = StaticManager.getWaveData(this.achieveData.num.toString())
        let str = oldWave ? oldWave.name : "无"

        this.numTxt.string = str + "/" + upWave.name
    }
    
    onTouchEnd (name: string) {
        switch (name) {
            case "clickbtn":
                // 领取奖励
                if (this.canGet) {
                    let data = PlayerManager.achieveCommand(this.achieveData.id)
                    PlayerManager.addProp(JSON.parse(this.achieveData.prop), true)
                    this.setData(data)

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