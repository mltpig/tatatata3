import CCAnimation from "../../../framework/creator/CCAnimation";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Loading extends GameView {
    private load: CCAnimation;

    onLoad () {
        super.onLoad()
        this.load = this.getCpByType("load", CCAnimation)
    }

    start () {
        this.load.play("other/", "load", cc.WrapMode.Loop)
    }

}