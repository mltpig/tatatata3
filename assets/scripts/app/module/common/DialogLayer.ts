import { TIPSTYPE } from "../../other/Enum";
import GameView from "../GameView";

const { ccclass, property } = cc._decorator;

/**
 * 通用弹出tips框
 */
@ccclass
export default class DialogLayer extends GameView {
    private okBtn: cc.Node;
    private cancelBtn: cc.Node;
    private callback: Function;
    private strTxt: cc.Label;

    onLoad () {
        super.onLoad()

        this.okBtn = this.getNode("okBtn")
        this.cancelBtn = this.getNode("cancelBtn")
        this.strTxt = this.getCpByType("strTxt", cc.Label)
    }

    // 回调
    setCallback (callback: Function) {
        this.callback = callback
    }

    /**
     * 显示： 确定 取消 关闭
     */
    showTips1 () {
    }

    /**
     * 显示: 确定
     */
    showTips2 () {
        this.cancelBtn.active = false
        this.okBtn.setPosition(0, this.okBtn.position.y)
    }

    showComplete_ () {
        this.setCallback(this.cusData_.callback)
        this.strTxt.string = this.cusData_.word

        switch (this.cusData_.type) {
            case TIPSTYPE.ok:
                this.showTips2()
                break;
            case TIPSTYPE.all:
                this.showTips1()
                break;
            default:
                break;
        }
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "okBtn":
                // 确定
                if (this.callback) {
                    this.callback(true)
                }
                this.close_()
                break;
            case "cancelBtn":
                // 取消
                if (this.callback) {
                    this.callback(false)
                }
                this.close_()
                break;
            default:
                break;
        }
    }
}