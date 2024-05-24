const {ccclass, property} = cc._decorator;

import ListItem from "../../../framework/creator/ListItem"
import DisUtils from "../../../framework/utils/DisUtils";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import { DS } from "../../other/Global";
import { PATHS } from "../../other/Paths";

@ccclass
export default class HeroIcon extends ListItem {
    public data: HEROINFO;
    private headIcon: cc.Node;
    private txtName: cc.Label;
    public rangeNode: cc.Node;

    onLoad () {
        super.onLoad()
        this.headIcon = this.getNode("headIcon")
        this.txtName = this.getCpByType("txtName", cc.Label)
    }
    
    setData (data: HEROINFO) {
        this.data = data
        DisUtils.replaceSprite(PATHS.hero + "/" + data.res, this.headIcon)

        // 几阶几级
        let heroLocalData = PlayerManager.getHeroData(this.data.id)
        let str = DS(heroLocalData.level) + "阶" + DS(heroLocalData.exp) + "级"
        this.txtName.string = str
    }

    // 普攻范围
    showRange (show: boolean) {
        if (!this.rangeNode) {
            this.rangeNode = DisUtils.newSprite2("icon/big/range")
            this.rangeNode.scale = this.data.atkRange / 50
            this.rangeNode.zIndex = -1
            this.node.addChild(this.rangeNode)
        }
        this.rangeNode.active = show
    }
}