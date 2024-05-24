import ListItem from "../../../framework/creator/ListItem";
import DisUtils from "../../../framework/utils/DisUtils";
import { PATHS } from "../../other/Paths";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AdHeroItem extends ListItem {
    private headIcon: cc.Node;

    onLoad () {
        super.onLoad()

        this.headIcon = this.getNode("headIcon")
    }

    setData (data: HEROINFO) {
        DisUtils.replaceSprite(PATHS.hero + "/" + data.res, this.headIcon)
    }

}