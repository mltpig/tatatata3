import GameUtils from "../../other/GameUtils";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 奖励飘出窗
 */
@ccclass
export default class FlyAward extends GameView {
    private data: Array<AWARDDATA>;
    private awardNode: cc.Node;

    onLoad () {
        super.onLoad()
        this.awardNode = this.getNode("awardNode")
    }

    setData (data: Array<AWARDDATA>) {
        this.data = data
        GameUtils.addAward(this.data, this.awardNode)
    }

    show () {
        cc.tween(this.node)
            .by(0.5, {y: 60})
            .by(0.5, {y: 60, opacity: 0})
            .removeSelf()
            .start()
    }
}