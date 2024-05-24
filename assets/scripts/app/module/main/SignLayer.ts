import EventDispatcher from "../../../framework/utils/EventDispatcher";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import { COMMONLOGICTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import GameUtils from "../../other/GameUtils";
import { DS } from "../../other/Global";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SignLayer extends GameView {
    private signDatas: Array<SIGNDATA>;
    private clickIndex: number = -1;
    private curDay: number = -1;

    start () {
        this.signDatas = StaticManager.getStaticValues("static_sign_data")
        this.initView()
    }

    initView () {
        let isAward = PlayerManager.signData.get       // 已领取？
        let day = DS(PlayerManager.signData.day)
        this.curDay = day
        this.clickIndex = isAward ? -1 : day
        
        for (let i = 1; i <= this.signDatas.length; i++) {
            let v = this.signDatas[i-1];

            let dayTxt = this.getNode("dayTxt_" + i)
            let propSp = this.getNode("awardNode_" + i)
            let nameTxt = this.getNode("nameTxt_" + i)
            let dailyGet = this.getNode("dailyGet_" + i)
            let dailyBtn = this.getNode("dailyBtn_" + i)

            dayTxt.getComponent(cc.Label).string = v.name
            nameTxt.getComponent(cc.Label).string = v.des
            
            // 奖励显示
            GameUtils.addAward(JSON.parse(v.prop), propSp)

            let str = ""
            let can = false
            if (this.curDay > i) {
                str = "已领取"
                can = false
            } else if (this.curDay == i) {
                str = isAward ? "已领取" : "领取"
                can = isAward ? false : true
            }
            else {
                str = "未达到"
                can = false
            }
            dailyGet.getComponent(cc.Label).string = str
            dailyBtn.getComponent(cc.Button).interactable = can
        }
    }

    // 领取
    onTouchEnd (name: string) {
        switch (name) {
            case "dailyBtn_1":
            case "dailyBtn_2":
            case "dailyBtn_3":
            case "dailyBtn_4":
            case "dailyBtn_5":
            case "dailyBtn_6":
            case "dailyBtn_7":
                let arr = name.split("_")
                if (parseInt(arr[1]) == this.clickIndex) {
                    PlayerManager.signCommand(this.curDay - 1)
                    this.initView()
                }
                break;
            default:
                break;
        }
    }
}