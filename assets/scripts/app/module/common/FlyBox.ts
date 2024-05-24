import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 开启宝箱的动画
 */
@ccclass
export default class FlyBox extends GameView {
    private data: Array<AWARDDATA>;

    setData (data: Array<AWARDDATA>) {
        this.data = data
    }

}