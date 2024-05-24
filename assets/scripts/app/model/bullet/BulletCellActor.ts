import { getMoveVector } from "../../../framework/utils/MoveUtil";
import { CAMPTYPE, STATETYPE } from "../../other/FightEnum";
import ActorBase from "../ActorBase";
import BulletBase from "./BulletBase";

/**
 * 范围伤害
 */
const {ccclass, menu, property} = cc._decorator;

@ccclass
export default class BulletCellActor extends BulletBase {
    
    update2 (dt: number) {
        super.update2(dt)

        if (this.state == STATETYPE.finish) { return }

        let newPos = cc.v2(this.targetPos.x, this.targetPos.y)
        let d = getMoveVector(cc.v2(this.node.x, this.node.y), newPos, this.data.speed * dt)
        this.node.setPosition(d.movePoint)
        this.setAngle(d.angle)

        if (d.ended) {
            this.bulletEnd()
        }
    }

    bulletEnd () {
        this.hited = true
        this.state = STATETYPE.finish
        this.checkHurtRect(this.targetPos)
    }
}