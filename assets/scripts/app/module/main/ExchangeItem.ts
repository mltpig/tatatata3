import ListItem from "../../../framework/creator/ListItem";
import DisUtils from "../../../framework/utils/DisUtils";
import PlayerManager from "../../manager/PlayerManager";
import Contants from "../../other/Contants";
import GameUtils from "../../other/GameUtils";
import { DS } from "../../other/Global";
import { PATHS } from "../../other/Paths";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ExchangeItem extends ListItem {
    public headIcon: cc.Node;
    public callback: Function;
    public data: HEROINFO;
    public heroData: HEROLOCALDATA;
    public isMax: boolean;
    public selectNum: cc.Label;

    onLoad () {
        super.onLoad()

        this.headIcon = this.getNode("headIcon")
        this.selectNum = this.getCpByType("selectNum", cc.Label)

        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this)
    }

    setData (data: HEROINFO, callback: Function, num: number) {
        this.data = data
        this.heroData = PlayerManager.getHeroData(data.id)
        if (this.heroData) {
            this.isMax = DS(this.heroData.level) >= DS(Contants.MAXSTAGE)
        } else {
            this.isMax = false
        }
        DisUtils.replaceSprite(PATHS.hero + "/" + data.res, this.headIcon)
        this.callback = callback

        this.selectNum.node.active = !this.isMax
        if (!this.isMax) {
            this.selectNum.string = num.toString()
        }
    }

    setNum (num: number) {
        this.selectNum.string = num.toString()
    }

    onTouchEnd (name: string) { 
        if (this.isMax) {
            GameUtils.messageHint("该英雄已满阶")  
            return
        }

        if (this.callback) {
            this.callback(this)
        }
    }

}