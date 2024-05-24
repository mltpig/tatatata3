import GameView from "../GameView";

const { ccclass, property } = cc._decorator;

/**
 * 提示界面
 */
@ccclass
export default class TipsLayer extends GameView {
    private desTxt: cc.RichText;
    private bg: cc.Node;
    
    onLoad () {
        super.onLoad()

        this.bg = this.getNode("bg")
        this.desTxt = this.getCpByType("desTxt", cc.RichText)
        this.node.active = false
    }

    showComplete_ () {
        this.bg.setContentSize(cc.size(this.bg.getContentSize().width, this.cusData_.hign))
        this.desTxt.string = this.cusData_.txt.toString()
        this.node.active = true
    }

}