import StaticManager from "../../manager/StaticManager";
import GameView from "../GameView";

const { ccclass, property } = cc._decorator;

/**
 * 通用详情界面
 */
@ccclass
export default class DetaileLayer extends GameView {
    private nameTxt: cc.Label;
    private desTxt: cc.Label;
    private data: AWARDDATA;
    private propData: PROPDATA;

    onLoad () {
        super.onLoad()

        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
        this.desTxt = this.getCpByType("desTxt", cc.Label)
    }

    setData (data: AWARDDATA) {
        this.data = data
        this.propData = StaticManager.getStaticValue("static_item", data.bid.toString())
        this.nameTxt.string = this.propData.name
        this.desTxt.string = this.propData.des   
    }

}