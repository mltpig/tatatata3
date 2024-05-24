import GameManager from "../../manager/GameManager";
import Contants from "../../other/Contants";
import { ATTRTYPE, FLYTYPE, NODEPOOLTYPE } from "../../other/FightEnum";
import { random2 } from "../../other/Global";
import GameView from "../GameView";

/**
 * 属性提升/下降
 */
 const {ccclass, property} = cc._decorator;

 @ccclass
export default class FlyAttr extends GameView {
    private desTxt: cc.Label;

    onLoad () {
        super.onLoad()
        this.desTxt = this.getCpByType("desTxt", cc.Label)
    }

    showFly (type: string, num: number) {
        let str = Contants.ATTRLABEL[type]
        
        if (num > 0) {
            this.desTxt.string = str + "+" + num
            this.desTxt.node.color = cc.Color.GREEN
        } else {
            this.desTxt.string = str + num
            this.desTxt.node.color = cc.Color.RED
        }

        this.showAttr()
    }
    
    showAttr () {
        let p = cc.v2(this.node.x, this.node.y)
        let num = 10
        this.node.setPosition(cc.v2(p.x + random2(-num,num), p.y + random2(-num,num)))

        let self = this
        let callback = function () {
            GameManager.getFM().putPool(NODEPOOLTYPE.attr, self.node)
        }
        
        cc.tween(self.node)
            .to(0, {opacity: 0})
            .by(0.28, {y: 20, opacity: 255}, {easing: "backOut"})
            .delay(0.3)
            .by(0.02, {y: 20, opacity: 0}, {easing: "backIn"})
            .call(callback)
            .start()
    }
}