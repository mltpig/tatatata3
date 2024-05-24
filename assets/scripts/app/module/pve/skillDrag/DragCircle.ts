import { getMovePosInDis } from "../../../../framework/utils/MoveUtil";
import UnitBase from "../../../model/UnitBase";
import DragBase from "./DragBase";

const {ccclass, property} = cc._decorator;

/**
 * 圆形施法
 * dragData 施法范围 施法半径
 */
@ccclass
export default class DragCircle extends DragBase {
    private skillNode1: cc.Node;
    private skillNode2: cc.Node;

    init () {
        super.init()

        this.skillNode1 = new cc.Node()
		this.skillNode1.setPosition(this.pos)
        this.node.addChild(this.skillNode1)
        let spriteFrame = this.fm.getSpriteAtlasByName("skillDrag").getSpriteFrame("skillDragHitRange")
        let sp = this.skillNode1.addComponent(cc.Sprite)
        sp.spriteFrame = spriteFrame
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM
        this.skillNode1.setContentSize(cc.size(this.dragData[0]*2, this.dragData[0]*2))

        this.skillNode2 = new cc.Node()
		this.skillNode2.setPosition(this.pos)
        this.node.addChild(this.skillNode2)
        let spriteFrame2 = this.fm.getSpriteAtlasByName("skillDrag").getSpriteFrame("skillDragRange")
        let sp2 = this.skillNode2.addComponent(cc.Sprite)
        sp2.spriteFrame = spriteFrame2
        sp2.sizeMode = cc.Sprite.SizeMode.CUSTOM
        this.skillNode2.setContentSize(cc.size(this.dragData[1]*2, this.dragData[1]*2))

        this.circleCollider = this.node.addComponent(cc.CircleCollider)
        this.circleCollider.radius = this.dragData[1]
        this.circleCollider.offset = this.pos
    }

    onTouchMove (pos: cc.Vec2) {
        this.moveDrag(pos)
    }

    moveDrag (pos: cc.Vec2) {
        let p = getMovePosInDis(this.pos.x, this.pos.y, pos.x, pos.y, this.dragData[0])
        this.skillNode2.setPosition(p)
        this.circleCollider.offset = p
        
        this.targetPos = p
    }

    onCollision (unit: UnitBase) {
        this.upZoder(unit)
    }
}