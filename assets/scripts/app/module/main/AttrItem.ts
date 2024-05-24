import Contants from "../../other/Contants";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AttrItem extends GameView {
    private attrDesTxt: cc.Label;
    private attrTxt: cc.Label;
    private newTxt: cc.Label;
    
    onLoad () {
        super.onLoad()

        this.attrDesTxt = this.getCpByType("attrDesTxt", cc.Label)
        this.attrTxt = this.getCpByType("attrTxt", cc.Label)
        this.newTxt = this.getCpByType("newTxt", cc.Label)
    }
    
    setData (key: string, value: number, addValue: number) {
        this.attrDesTxt.string = Contants.ATTRLABEL[key]
        let extra = ""
        if (key == "crit" || key == "critHurt") {
            extra = "%"
        }
        this.attrTxt.string = value.toString() + extra
        if (addValue && addValue > 0) {
            this.newTxt.node.active = true
            this.attrTxt["_forceUpdateRenderData"]()
            this.newTxt.string = "+" + addValue.toString() + extra
            this.newTxt.node.setPosition(this.attrTxt.node.width + 10, this.newTxt.node.y)
        } else {
            this.newTxt.node.active = false
        }
    }
}