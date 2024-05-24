const {ccclass, property} = cc._decorator;

import ListItem from "../../../framework/creator/ListItem"
import DisUtils from "../../../framework/utils/DisUtils";
import StaticManager from "../../manager/StaticManager";
import { PATHS } from "../../other/Paths";

@ccclass
export default class ShieldIcon extends ListItem {
    public shieldData: SHIELDDATA;
    public data: SHIELDDEFENDLIST;
    private headIcon: cc.Node;
    private txtName: cc.Label;
    private txtNum: cc.Label;

    onLoad () {
        super.onLoad()
        this.headIcon = this.getNode("headIcon")
        this.txtName = this.getCpByType("txtName", cc.Label)
        this.txtNum = this.getCpByType("txtNum", cc.Label)
    }
    
    setData (data: SHIELDDEFENDLIST) {
        let id = data.id
        this.data = data
        this.shieldData = StaticManager.getStaticValue("static_shield", id) as SHIELDDATA
        DisUtils.replaceSprite(PATHS.rune + "/" + this.shieldData.res, this.headIcon)
        this.txtName.string = this.shieldData.name
        this.txtNum.string = data.num.toString()
    }
}