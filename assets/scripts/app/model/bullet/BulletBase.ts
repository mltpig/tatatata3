import CCAnimation from "../../../framework/creator/CCAnimation";
import { getMoveVector } from "../../../framework/utils/MoveUtil";
import { CAMPTYPE, NODEPOOLTYPE, STATETYPE } from "../../other/FightEnum";
import ActorBase from "../ActorBase";
import UnitBase from "../UnitBase";

/**
 * base
 */
const {ccclass, menu, property} = cc._decorator;

@ccclass
export default class BulletBase extends UnitBase {
    public data: BULLETDATA;
    public target: ActorBase;
    public targetPos: cc.Vec2;
    public realFight: ATTRDATA;
    public hited: boolean = false;
    public attacker: ActorBase;

    public aniNode: cc.Node;

    onLoad () {
        super.onLoad()
        this.aniNode = this.getNode("aniNode")
        this.dealNodePool()
    }

    // 处理对象池的节点
    dealNodePool () {
        this.node.angle = 0
        this.node.scale = 1

        // 子弹碰撞块
        this.node.removeComponent(cc.BoxCollider)
        this.node.removeComponent(cc.CircleCollider)
    }

    setData (data: BULLETDATA) {
        this.data = data
        
        let size = JSON.parse(data.size)
        
        // 设置最小子弹大小，减少穿透概率
        if (size[1]) {
            size[0] = size[0] < 30 ? 30 : size[0]
            size[1] = size[1] < 30 ? 30 : size[1]
            let collider: cc.BoxCollider = this.node.addComponent(cc.BoxCollider)
            collider.size = cc.size(size[0], size[1])
        } else {
            size[0] = size[0] < 15 ? 15 : size[0]
            let collider: cc.CircleCollider = this.node.addComponent(cc.CircleCollider)
            collider.radius = size[0]
        }

        // 子弹样式
        this.aniNode.angle = 180 * this.data.res_dir
        if (parseInt(this.data.res) != 0) {
            let effect = this.aniNode.getComponent(CCAnimation)
            this.fm.playEffect(effect, "bullet/", this.data.res, cc.WrapMode.Loop)
        }
    }
    
    // 设置角度
    setAngle (angle: number) {
        this.node.angle = -angle

        let scaley = Math.abs(angle) >= 90 && Math.abs(angle) <= 270 ? -1 : 1
        this.aniNode.scaleY = scaley
    }

    setAttacker (attacker: ActorBase) {
        this.attacker = attacker
    }
    
    setStartPos (pos: cc.Vec2) {
        this.node.setPosition(pos)
    }

    setTarget (target: ActorBase) {
        this.target = target
        this.setTargetPos(cc.v2(target.node.x, target.node.y))
    }
    
    setTargetPos (pos: cc.Vec2) {
        this.targetPos = pos
    }

    setRealFight (realFight: ATTRDATA) {
        this.realFight = realFight
    }

    bulletStart () {
    }

    bulletEnd () {
    }

    // 检测存在范围伤害
    checkHurtRect (pos: cc.Vec2) {
        let size: Array<number> = JSON.parse(this.data.hurtRect)
        if (size.length == 0) { return }

        this.fm.pveScene.createHurtRects({
            pos: pos,
            fight: this.realFight,
            bAttr: this.data,
        })
    }
    
    onCollisionEnter (other, self) {
    }

    pauseEffect () {
        this.aniNode.getComponent(CCAnimation).pause()
    }

    resumeEffect () {
        this.aniNode.getComponent(CCAnimation).resume()
    }

    clear () {
        this.aniNode.getComponent(CCAnimation).clear()
        this.node.removeComponent(this)
        this.fm.putPool(NODEPOOLTYPE.bullet, this.node)
    }
}