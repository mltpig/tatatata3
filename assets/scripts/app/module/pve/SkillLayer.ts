import DisUtils from "../../../framework/utils/DisUtils";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 技能详情
 */
@ccclass
export default class SkillLayer extends GameView {
    private headSp: cc.Node;
    private nameTxt: cc.Label;
    private desTxt: cc.Label;
    private machineTxt: cc.Label;
    private data: RUNEDATA;

    onLoad () {
        super.onLoad()

        this.headSp = this.getNode("headSp")
        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
        this.desTxt = this.getCpByType("desTxt", cc.Label)
        this.machineTxt = this.getCpByType("machineTxt", cc.Label)
    }

    setData (data: RUNEDATA) {
        this.data = data
        
        DisUtils.replaceSprite(PATHS.rune + "/" + data.img, this.headSp)

        this.nameTxt.string = data.name
        this.desTxt.string = data.des
        this.machineTxt.string = data.machine ? data.des2 : ""
    }
}