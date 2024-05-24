import GameManager from "../../manager/GameManager";
import { FLYTYPE, NODEPOOLTYPE } from "../../other/FightEnum";
import { random2 } from "../../other/Global";
import GameView from "../GameView";

/**
 * 飘血
 */
 const {ccclass, property} = cc._decorator;

 @ccclass
export default class FlyItem extends GameView {
    private numTxt: cc.Label;
    private animation: cc.Animation;

    @property(cc.Font)
    hurtFont = null
    @property(cc.Font)
    critFont = null

    onLoad () {
        super.onLoad()
        this.numTxt = this.getCpByType("numTxt", cc.Label)
        this.animation = this.node.getComponent(cc.Animation)
    }

    showFly (str: string, type: FLYTYPE) {
        this.numTxt.string = str
        switch (type) {
            case FLYTYPE.hurt:
            default:
                this.numTxt.font = this.hurtFont
                this.showHurt()
                break;
            case FLYTYPE.treat:
                this.showHurt()
                break;
            case FLYTYPE.crit:
                this.numTxt.font = this.critFont
                this.showHurt()
                break;
        }
    }

    showHurt () {
        // 随机位置
        let p = cc.v2(this.node.x, this.node.y)
        let num = 10
        this.node.setPosition(cc.v2(p.x + random2(-num,num), p.y + random2(-num,num)))

        let self = this
        this.animation.play("flyItemAnimation", 0)

        let callback = function () {
            let fm = GameManager.getFM()
            fm.flyNumber = fm.flyNumber - 1
            fm.putPool(NODEPOOLTYPE.fly, self.node)
        }
        
        // cc.tween(self.node)
        //     .to(0, {opacity: 0})
        //     .by(0.28, {y: 20, opacity: 255}, {easing: "backOut"})
        //     .delay(0.3)
        //     .by(0.02, {y: 20, opacity: 0}, {easing: "backIn"})
        //     .call(callback)
        //     .start()

        cc.tween(self.node)
            .delay(1)
            .call(callback)
            .start()
    }
}