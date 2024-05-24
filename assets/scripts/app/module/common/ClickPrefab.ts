import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ClickPrefab extends GameView {
    start () {
        cc.tween(this.node)
            .delay(0.5)
            .removeSelf()
            .start()
    }
}