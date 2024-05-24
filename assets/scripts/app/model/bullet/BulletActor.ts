import CCAnimation from "../../../framework/creator/CCAnimation";
import { getMoveVector } from "../../../framework/utils/MoveUtil";
import { CAMPTYPE, STATETYPE } from "../../other/FightEnum";
import ActorBase from "../ActorBase";
import BulletBase from "./BulletBase";

/**
 * 普通子弹
 */
const {ccclass, menu, property} = cc._decorator;

@ccclass
export default class BulletActor extends BulletBase {

    setData (data: BULLETDATA) {
        this.data = data

        // 单体子弹移除碰撞块 提示性能
        this.node.removeComponent(cc.BoxCollider)
        this.node.removeComponent(cc.CircleCollider)

        // 子弹样式
        this.aniNode.angle = 180 * this.data.res_dir
        if (parseInt(this.data.res) != 0) {
            let effect = this.aniNode.getComponent(CCAnimation)
            this.fm.playEffect(effect, "bullet/", this.data.res, cc.WrapMode.Loop)
        }
    }

    update2 (dt: number) {
        super.update2(dt)

        this.checkTarget()
        if (this.state == STATETYPE.finish) { return }

        let newPos = cc.v2(this.target.node.x, this.target.node.y)
        let d = getMoveVector(cc.v2(this.node.x, this.node.y), newPos, this.data.speed * dt)
        this.node.setPosition(d.movePoint)
        this.setAngle(d.angle)

        // 部分攻击自己的子弹不会发生碰撞
        if (d.ended) {
            this.hitTarget(this.target)
        }
    }

    checkTarget () {
        if (!this.target || this.target.onState(STATETYPE.finish)) {
            this.hited = true
            this.state = STATETYPE.finish
        }
    }
    
    // onCollisionEnter (other, self) {
    //     if (this.hited) { return }
    //     let unit: ActorBase = other.node.getComponent(ActorBase)
    //     this.hitTarget(unit)
    // }
    
    // 攻击
    hitTarget (unit: ActorBase) {
        this.checkTarget()
        if (this.hited) { return }

        if (unit.uid == this.target.uid) {
            this.hited = true
            this.state = STATETYPE.finish
            unit._hurtDeal.addHurt(this.data, this.realFight)
            
            this.checkHurtRect(cc.v2(unit.node.x, unit.node.y))
        }
    }
}