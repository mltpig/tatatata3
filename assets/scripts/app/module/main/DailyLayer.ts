import List from "../../../framework/creator/List";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import { DS } from "../../other/Global";
import GameView from "../GameView";
import DailyItem from "./DailyItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DailyLayer extends GameView {
    private dailyList: List;
    private dailyData: Array<DAILYLOCALDATA>;

    onLoad () {
        super.onLoad()

        this.dailyList = this.getCpByType("listNode", List)

        this.dailyData = PlayerManager.dailyData
        this.dailyList.customCallBack = this.refreshView.bind(this)
        this.refreshView()
    }

    onListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(DailyItem)
        cell.setData(this.dailyData[idx])
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
        this.dailyData.sort(sort)
        this.dailyList.numItems = this.dailyData.length
    }
}