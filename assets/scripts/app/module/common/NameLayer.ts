import PlayerManager from "../../manager/PlayerManager";
import GameUtils from "../../other/GameUtils";
import { checkTouchyWord } from "../../other/TouchyWord";
import GameView from "../GameView";

const { ccclass, property } = cc._decorator;

/**
 * 修改名称界面
 */
@ccclass
export default class NameLayer extends GameView {
    private callback: Function;
    private changeBox: cc.EditBox;
    private nameStr: string = "";

    onLoad () {
        super.onLoad()

        this.changeBox = this.getCpByType("changeBox", cc.EditBox)
        this.changeBox.node.on("editing-did-ended", this.editEnd, this);
    }

    // 回调
    setCallback (callback: Function) {
        this.callback = callback
    }

    editEnd () {
        this.nameStr = this.changeBox.textLabel.string
    }

    showComplete_ () {
        this.setCallback(this.cusData_.callback)
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "okBtn":
                // 确定
                if (this.nameStr != "") {
                    if (!checkTouchyWord(this.nameStr)) {
                        GameUtils.messageHint("用户名包含屏蔽字符!")
                        return
                    }

                    PlayerManager.changeName(this.nameStr)
                    if (this.callback) {
                        this.callback(true)
                    }
                }
                this.close_()
                break;
            case "cancelBtn":
                this.close_()
                break;
            default:
                break;
        }
    }
}