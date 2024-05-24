import DisUtils from "../../../framework/utils/DisUtils";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BookRuneDetail extends GameView {
    private runeData: RUNEDATA;

    private nameTxt: cc.Label;
    private desTxt: cc.Label;
    private machineTxt: cc.Label;
    private runeIcon: cc.Node;

    onLoad () {
        super.onLoad()

        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
        this.desTxt = this.getCpByType("desTxt", cc.Label)
        this.machineTxt = this.getCpByType("machineTxt", cc.Label)
        this.runeIcon = this.getNode("runeIcon")
    }

    showComplete_ () {
        this.runeData = this.cusData_

        this.initView()
    }

    initView () {
        this.nameTxt.string = this.runeData.name
        this.desTxt.string = this.runeData.des
        this.machineTxt.string = this.runeData.des2

        DisUtils.replaceSprite(PATHS.rune + "/" + this.runeData.img, this.runeIcon)
    }
}