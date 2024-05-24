import { getMoveAngle, getMoveVector, getPosByAngle } from "../../../framework/utils/MoveUtil";
import { STATETYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import ActorBase from "../ActorBase";
import BulletBase from "./BulletBase";

const {ccclass, menu, property} = cc._decorator;

/**
 * 直线
 */
@ccclass
export default class BulletGunActor extends BulletBase {
    private distance: number = null;

    setData (data: BULLETDATA) {
        super.setData(data)

        let extra = JSON.parse(data.extra)
        if (extra[0]) {
            this.distance = extra[0]
        } else {
            this.distance = 2000
        }
    }
    
    setTargetPos (pos: cc.Vec2) {
        super.setTargetPos(pos)

        if (this.distance) {
            let angle = getMoveAngle(this.node.x, this.node.y, this.targetPos.x, this.targetPos.y)
            let p = getPosByAngle(this.node.x, this.node.y, angle, this.distance)
            this.targetPos = p 
            this.setAngle(angle)
        }
    }
    
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
    }

    onCollisionEnter (other, self) {
        if (this.hited) { return }
        let unit: ActorBase = other.node.getComponent(ActorBase)

         if (GameUtils.checkTargetAttack(this.data, unit)) {
            unit._hurtDeal.addHurt(this.data, this.realFight)
        }
    }
}