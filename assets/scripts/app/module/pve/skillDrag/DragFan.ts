import { getMoveAngle } from "../../../../framework/utils/MoveUtil";
import DragBase from "./DragBase";

const {ccclass, property} = cc._decorator;

/**
 * 扇形施法
 * dragData 半径 角度
 */
@ccclass
export default class DragFan extends DragBase {
    private skillNode1: cc.Node;
    private dragAngle: number;

    init () {
        super.init()
        
        this.skillNode1 = new cc.Node()
        this.skillNode1.setPosition(this.pos)
        this.node.addChild(this.skillNode1)
        let spriteFrame = this.fm.getSpriteAtlasByName("skillDrag").getSpriteFrame("skillDragHitRange")
        let sp = this.skillNode1.addComponent(cc.Sprite)
        sp.spriteFrame = spriteFrame
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM
        sp.type = cc.Sprite.Type.FILLED
        sp.fillType = cc.Sprite.FillType.RADIAL
        sp.fillCenter = cc.v2(0.5, 0.5)
        sp.fillStart = 0
        sp.fillRange = this.dragData[1] / 360
        this.dragAngle = this.dragData[1] / 2
        this.skillNode1.setContentSize(cc.size(this.dragData[0]*2, this.dragData[0]*2))

        this.circleCollider = this.node.addComponent(cc.CircleCollider)
        this.circleCollider.radius = this.dragData[0]
        this.circleCollider.offset = this.pos
    }
    
    onTouchMove (pos: cc.Vec2) {
        this.moveDrag(pos)
    }

    moveDrag (pos: cc.Vec2) {
        let degree = getMoveAngle(this.pos.x, this.pos.y, pos.x, pos.y)
        this.skillNode1.angle = degree - this.dragAngle

        // 刷新
        for (let i = 0; i < this.actors.length; i++) {
            let act = this.actors[i]
            let angle = getMoveAngle(this.pos.x, this.pos.y, act.node.x, act.node.y) - this.dragAngle
            let angleBtw = Math.abs(angle - this.skillNode1.angle)
            if (angleBtw > 180) {
                angleBtw = 360 - angleBtw
            }
            if (angleBtw <= this.dragAngle) {
                this.upZoder(act)
            } else {
                this.downZoder(act)
            }
        }
        
        this.targetPos = pos
    }
}