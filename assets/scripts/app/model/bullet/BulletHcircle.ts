import { getMoveAngle } from "../../../framework/utils/MoveUtil";
import { STATETYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { spliceByValue } from "../../other/Global";
import ActorBase from "../ActorBase";
import BulletBase from "./BulletBase";

const {ccclass, menu, property} = cc._decorator;

/**
 * 扇形伤害 角度 
 */
@ccclass
export default class BulletHcircle extends BulletBase {
    private hurtTime: Array<number>;
    private timer: number = 0;
    private actors: Array<ActorBase> = [];
    private dragAngle: number;

    setData (data: BULLETDATA) {
        super.setData(data)
        this.hurtTime = JSON.parse(this.data.hurtTime)
        this.dragAngle = JSON.parse(this.data.dragData)[1] / 2
    }

    update2 (dt: number) {
        super.update2(dt)

        if (this.state == STATETYPE.finish) { return }

        for (let i = 0; i < this.hurtTime.length; i++) {
            const element = this.hurtTime[i];
            if (this.timer > element) {
                this.bulletEnd()
                this.hurtTime.splice(i,1)
                i--;
            }
        }

        this.timer = this.timer + dt
        if (this.hurtTime.length == 0) {
            this.state = STATETYPE.finish
        }
    }

    onCollisionEnter (other, self) {
        if (this.state == STATETYPE.finish) { return }
        let unit: ActorBase = other.node.getComponent(ActorBase)

         if (GameUtils.checkTargetAttack(this.data, unit)) {
            this.actors.push(unit)
        }
    }

    onCollisionExit (other, self) {
        if (this.state == STATETYPE.finish) { return }

        let unit: ActorBase = other.node.getComponent(ActorBase)
        spliceByValue(this.actors, unit)
    }

    bulletStart () {
        super.bulletStart()
        let degree = getMoveAngle(this.node.x, this.node.y, this.targetPos.x, this.targetPos.y)
        this.setAngle(degree)
    }
    
    bulletEnd () {
        let degree = getMoveAngle(this.node.x, this.node.y, this.targetPos.x, this.targetPos.y)

        for (let i = 0; i < this.actors.length; i++) {
            const act = this.actors[i];

            // 符合条件
            let angle = getMoveAngle(this.node.x, this.node.y, act.node.x, act.node.y)
            let angleBtw = Math.abs(angle - degree)
            if (angleBtw > 180) {
                angleBtw = 360 - angleBtw
            }
            if (angleBtw <= this.dragAngle) {
                act._hurtDeal.addHurt(this.data, this.realFight)
            }
        }
    }
}