import DisUtils from "../../../framework/utils/DisUtils";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 道具icon
 */
@ccclass
export default class PropItem extends GameView {
    private data: RUNEDATA;
    
    private skillIcon: cc.Node;
    private nameTxt: cc.Label;

    onLoad () {
        super.onLoad()

        this.skillIcon = this.getNode("skillIcon")
        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
    }

    setData (data: RUNEDATA) {
        this.data = data

        DisUtils.replaceSprite(PATHS.rune + "/" + this.data.img, this.skillIcon)
        this.nameTxt.string = data.name
    }
}