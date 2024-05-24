import DisUtils from "../../../framework/utils/DisUtils";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import GameUtils from "../../other/GameUtils";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AwardItem extends GameView {
    private data: AWARDDATA;
    private icon: cc.Node;
    private numTxt: cc.Label;
    private cost: boolean = false;

    onLoad () {
        super.onLoad()

        this.icon = this.getNode("icon")
        this.numTxt = this.getCpByType("numTxt", cc.Label)
    }

    setData (data: AWARDDATA, cost: boolean = false) {
        this.data = data
        this.cost = cost
        this.initView()
    }
    
    initView () {
        let def = StaticManager.getStaticValue("static_item", this.data.bid.toString()) as PROPDATA
        DisUtils.replaceSprite(PATHS.prop + "/" + def.img, this.icon)

        this.numTxt.node.color = cc.Color.WHITE
        if (this.cost) {
            let num = PlayerManager.getAwardNum(this.data)
            let color = num >= this.data.num ? cc.Color.WHITE : cc.Color.RED
            this.numTxt.node.color = color
            this.numTxt.string = num + "/" + this.data.num
        } else {
            this.numTxt.string = this.data.num.toString()
        }
    }
    
    onTouchEnd (name: string) {
        switch (name) {
            case "clickBtn":
                GameUtils.addDetaile(this.data, this.node)
                break;
            default:
                break;
        }
    }

}