import { getMoveAngle, getMovePosInDis } from "../../../../framework/utils/MoveUtil";
import UnitBase from "../../../model/UnitBase";
import Contants from "../../../other/Contants";
import DragBase from "./DragBase";
import DragHit from "./DragHit";

const {ccclass, property} = cc._decorator;

/**
 * 直线施法
 * dragData 长 宽
 */
@ccclass
export default class DragLine extends DragBase {
    private skillNode1: cc.Node;
    private skillNode2: cc.Node;

    init () {
        super.init()

        let size = cc.size(this.dragData[0], this.dragData[1])
        this.skillNode1 = new cc.Node()
        this.skillNode1.group = Contants.GROUP.drag
        this.skillNode1.setAnchorPoint(0,0.5)
        this.skillNode1.setPosition(this.pos)
        this.node.addChild(this.skillNode1)

        let spriteFrame = this.fm.getSpriteAtlasByName("skillDrag").getSpriteFrame("skillDragRect")
        let sprite = this.skillNode1.addComponent(cc.Sprite)
        sprite.spriteFrame = spriteFrame
        sprite.type = cc.Sprite.Type.SLICED
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM
        this.skillNode1.setContentSize(size)
        
        this.skillNode2 = new cc.Node()
        this.skillNode2.setAnchorPoint(0,0.5)
        this.skillNode2.setPosition(this.pos)
        this.node.addChild(this.skillNode2)
        let spriteFrame2 = this.fm.getSpriteAtlasByName("skillDrag").getSpriteFrame("skillDragArrow2")
        let sprite2 = this.skillNode2.addComponent(cc.Sprite)
        sprite2.spriteFrame = spriteFrame2
        sprite2.type = cc.Sprite.Type.SLICED
        sprite2.sizeMode = cc.Sprite.SizeMode.CUSTOM
        this.skillNode2.setContentSize(cc.size(107, this.dragData[1]))

        let hitDrag = this.skillNode1.addComponent(DragHit)
        hitDrag.collisionEnter = this.onCollisionEnter.bind(this)
        hitDrag.collisionExit = this.onCollisionExit.bind(this)
        this.boxCollider = this.skillNode1.addComponent(cc.BoxCollider)
        this.boxCollider.size = size
        this.boxCollider.offset = cc.v2(size.width/2, 0)
    }

    onTouchMove (pos: cc.Vec2) {
        this.moveDrag(pos)
    }

    moveDrag (pos: cc.Vec2) {
        let degree = getMoveAngle(this.pos.x, this.pos.y, pos.x, pos.y)
        this.skillNode1.angle = degree
        this.skillNode2.angle = degree

        let p = getMovePosInDis(this.pos.x, this.pos.y, pos.x, pos.y, this.dragData[0] - 100)
        this.skillNode2.setPosition(p)

        let newP = getMovePosInDis(this.pos.x, this.pos.y, pos.x, pos.y, this.dragData[0])
        this.targetPos = newP
    }

    onCollision (unit: UnitBase) {
        this.upZoder(unit)
    }
}