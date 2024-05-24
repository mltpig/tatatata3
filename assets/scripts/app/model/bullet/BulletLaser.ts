import CCAnimation from "../../../framework/creator/CCAnimation";
import { getMoveAngle } from "../../../framework/utils/MoveUtil";
import { CAMPTYPE, STATETYPE } from "../../other/FightEnum";
import ActorBase from "../ActorBase";
import BulletBase from "./BulletBase";

/**
 * 激光 持续性攻击
 * 攻击次数 -1 无限
 * 间隔
 * 宽度
 */
const {ccclass, menu, property} = cc._decorator;

@ccclass
export default class BulletLaser extends BulletBase {
    // 持续性 普通攻击 持续 其他 持续数秒
    private sustainNum: number = 0;
    private intervalNum: number = 0;
    private recordTime: number = 0;
    private wide: number = 0;   
    private curSustain: number = 0;

    setData (data: BULLETDATA) {
        this.data = data
        let extra = JSON.parse(this.data.extra)
        this.intervalNum = extra[1]         // 间隔
        this.wide = extra[2]                // 宽度

        this.sustainNum = extra[0]
        if (this.sustainNum == 0) { this.sustainNum = 1 }
        if (this.sustainNum == -1) { this.sustainNum = Infinity }

        // 激光子弹移除碰撞块 提示性能
        this.node.removeComponent(cc.BoxCollider)
        this.node.removeComponent(cc.CircleCollider)

        // 子弹样式
        if (parseInt(this.data.res) != 0) {
            this.aniNode.setAnchorPoint(0, 0.5)
            let sprite = this.aniNode.getComponent(cc.Sprite)
            sprite.type = cc.Sprite.Type.SLICED
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM

            let effect = this.aniNode.getComponent(CCAnimation)
            this.fm.playEffect(effect, "bullet/", this.data.res, cc.WrapMode.Loop)
        }
    }

    setTarget (target: ActorBase) {
        super.setTarget(target)

        let dis = cc.v2(this.node.x, this.node.y).sub(this.targetPos).mag()
        this.aniNode.setContentSize(cc.size(dis, this.wide))
        let degree = getMoveAngle(this.node.x, this.node.y, this.targetPos.x, this.targetPos.y)
        this.aniNode.angle = degree
    }

    update2 (dt: number) {
        super.update2(dt)

        if (this.state == STATETYPE.finish) { return }

        if (this.target == null || this.target.onState(STATETYPE.finish)) {
            this.recordTime = 0
            if (this.sustainNum != Infinity) {
                this.state = STATETYPE.finish
            }
            return
        }

        let targetPos = cc.v2(this.target.node.x, this.target.node.y)
        let degree = getMoveAngle(this.node.x, this.node.y, targetPos.x, targetPos.y)
        this.aniNode.angle = degree
        
        this.recordTime = this.recordTime + dt
        if (this.recordTime >= this.intervalNum) {
            this.recordTime = 0
            this.hitTarget()
        }
    }

    // 攻击
    hitTarget () {
        if (this.target == null || this.target.onState(STATETYPE.finish)) { return }
        this.target._hurtDeal.addHurt(this.data, this.realFight)
        this.curSustain = this.curSustain + 1
        
        if (this.curSustain == this.sustainNum) {
            this.state = STATETYPE.finish
        }
    }
    
    // 移除 不放入对象池
    clear () {
        this.node.destroy()
    }
}