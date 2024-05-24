import SelectButton from "../../../framework/creator/SelectButton";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RankTab extends GameView {
    private data: MAPDATA;
    private tabTxt: cc.Label;
    private selectBtn: SelectButton;

    onLoad () {
        super.onLoad()

        this.tabTxt = this.getCpByType("tabTxt", cc.Label)
        this.selectBtn = this.getCpByType("tabBtn", SelectButton)
        this.selectBtn.showSelect(false)
    }

    showSelect (select: boolean) {
        this.selectBtn.showSelect(select)
    }

    setData (data: MAPDATA, index: number) {
        this.data = data
        this.tabTxt.string = data.name
        this.selectBtn.type = index
    }

    setCallBack (callback: Function) {
        this.selectBtn.selectCallback = callback
    }

}