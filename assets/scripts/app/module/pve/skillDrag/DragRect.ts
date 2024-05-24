import UnitBase from "../../../model/UnitBase";
import Contants from "../../../other/Contants";
import DragBase from "./DragBase";

const {ccclass, property} = cc._decorator;

@ccclass
/**
 *  dragData 长 宽 横向/竖向 1
 */
export default class DragRect extends DragBase {
    private skillNode1: cc.Node;
    private isAcross: boolean;

    init () {
        super.init()

        this.isAcross = this.dragData[2] != 1

        let size = cc.size(this.dragData[0], this.dragData[1])
        this.skillNode1 = new cc.Node()
        this.node.addChild(this.skillNode1)

        let spriteFrame = this.fm.getSpriteAtlasByName("skillDrag").getSpriteFrame("skillDragRect")
        let sprite = this.skillNode1.addComponent(cc.Sprite)
        sprite.spriteFrame = spriteFrame
        sprite.type = cc.Sprite.Type.SLICED
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM
        this.skillNode1.setContentSize(size)

        let newP = this.isAcross ? cc.v2(- Contants.MAP_CW_OFFSET, this.pos.y) : cc.v2(this.pos.x, 0)
        this.skillNode1.setPosition(newP)
        this.boxCollider = this.node.addComponent(cc.BoxCollider)
        this.boxCollider.size = size
        this.boxCollider.offset = newP
    }

    onTouchMove (pos: cc.Vec2) {
        this.moveDrag(pos)
    }

    moveDrag (pos: cc.Vec2) {
        let newP = this.isAcross ? cc.v2(- Contants.MAP_CW_OFFSET, pos.y) : cc.v2(pos.x, 0)
        this.skillNode1.setPosition(newP)
        this.boxCollider.offset = newP

        this.targetPos = newP
    }

    onCollision (unit: UnitBase) {
        this.upZoder(unit)
    }
}