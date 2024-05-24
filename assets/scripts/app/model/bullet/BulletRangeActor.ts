import { getMoveVector } from "../../../framework/utils/MoveUtil";
import { CAMPTYPE, STATETYPE } from "../../other/FightEnum";
import ActorBase from "../ActorBase";
import BulletBase from "./BulletBase";

/**
 * 范围伤害(直接出现在目标点)
 */
const {ccclass, menu, property} = cc._decorator;

@ccclass
export default class BulletRangeActor extends BulletBase {
    
    bulletStart () {
        super.bulletStart()
        this.bulletEnd()
    }

    bulletEnd () {
        this.hited = true
        this.state = STATETYPE.finish
        this.checkHurtRect(this.targetPos)
    }
}