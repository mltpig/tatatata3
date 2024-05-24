import ListItem from "../../../framework/creator/ListItem";
import DisUtils from "../../../framework/utils/DisUtils";
import { PATHS } from "../../other/Paths";

const {ccclass, property} = cc._decorator;

/**
 * 符文自选item
 */
@ccclass
export default class RuneSelectItem extends ListItem {
    public data: RUNEDATA;

    private headIcon: cc.Node;
    private nameTxt: cc.Label;

    onLoad () {
        super.onLoad()

        this.headIcon = this.getNode("headIcon")
        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
    }

    setData (data: RUNEDATA) {
        this.data = data

        DisUtils.replaceSprite(PATHS.rune + "/" + data.img, this.headIcon)
        this.nameTxt.string = data.name
    }

}