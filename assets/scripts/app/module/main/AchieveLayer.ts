import List from "../../../framework/creator/List";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import { DS } from "../../other/Global";
import GameView from "../GameView";
import AchieveItem from "./AchieveItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AchieveLayer extends GameView {
    private achieveList: List;
    private achieveData: Array<ACHIEVELOCALDATA>;

    onLoad () {
        super.onLoad()

        this.achieveList = this.getCpByType("listNode", List)
        this.achieveData = PlayerManager.achieveData
        this.achieveList.customCallBack = this.refreshView.bind(this)
        this.refreshView()
    }

    onListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(AchieveItem)
        cell.setData(this.achieveData[idx])
    }

    refreshView () {
        let sort = (a, b)=> {
            let num1 = 0
            if (!a.get) {
                num1 = DS(a.num) >= DS(a.maxNum) ? 2 : 1
            }

            let num2 = 0
            if (!b.get) {
                num2 = DS(b.num) >= DS(b.maxNum) ? 2 : 1
            }

            return num2 - num1
        }
        this.achieveData.sort(sort)
        this.achieveList.numItems = this.achieveData.length
    }

}