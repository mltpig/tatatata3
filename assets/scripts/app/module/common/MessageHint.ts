const {ccclass, menu, property} = cc._decorator;

import GameView from "../GameView"
import { MESSAGETYPE } from "../../other/Enum"

@ccclass
export default class MessageHint extends GameView {
    private txt: cc.Label = null;

    onLoad () {
        super.onLoad()
        this.txt = this.getCpByType("txt", cc.Label)
    }

    show (str: string, type: MESSAGETYPE = MESSAGETYPE.client) {
        this.txt.string = str;

        switch (type) {
            case MESSAGETYPE.client:
                this.txt.node.color = cc.Color.WHITE;
                break;
            case MESSAGETYPE.server:
                this.txt.node.color = cc.Color.RED;
                break;
            default:
                break;
        }

        let t = cc.tween;
        t(this.node)
            .to(0.2, { scale: 0.8 }, { easing: "backOut"})
            .delay(0.3)
            .to(0.1, { scale: 1 })
            .parallel(
                t().by(1, { y: 200 }),
                t().to(0.8, { opacity: 80 })
            )
            .removeSelf()
            .start();
    }
}