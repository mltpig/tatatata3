import DisUtils from "../../../framework/utils/DisUtils";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BookMonsterDetail extends GameView {
    private monsterData: MONSTERINFO;
    
    private headIcon: cc.Node;
    private nameTxt: cc.Label;
    private desTxt: cc.Label;

    onLoad () {
        super.onLoad()

        this.headIcon = this.getNode("headIcon")
        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
        this.desTxt = this.getCpByType("desTxt", cc.Label)
    }

    showComplete_ () {
        this.monsterData = this.cusData_

        this.initView()
    }

    initView () {
        DisUtils.replaceSprite(PATHS.monster + "/" + this.monsterData.res, this.headIcon)
        this.nameTxt.string = this.monsterData.name
        this.desTxt.string = this.monsterData.des
    }
}