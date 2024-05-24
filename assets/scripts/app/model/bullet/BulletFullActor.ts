import { STATETYPE } from "../../other/FightEnum";
import BulletBase from "./BulletBase";

const {ccclass, menu, property} = cc._decorator;

/**
 * 全图
 */
@ccclass
export default class BulletFullActor extends BulletBase {
    bulletStart () {
        this.bulletEnd()
    }

    bulletEnd () {
        this.hited = true
        this.state = STATETYPE.finish
        this.checkHurtRect(cc.v2(0,0))
    }

}