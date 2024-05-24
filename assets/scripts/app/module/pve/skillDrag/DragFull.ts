import UnitBase from "../../../model/UnitBase";
import DragBase from "./DragBase";

const {ccclass, property} = cc._decorator;

/**
 * 全屏施法
 */
@ccclass
export default class DragFull extends DragBase {

    init () {
        super.init()

        this.node.setPosition(0,0)
        let collider = this.node.addComponent(cc.BoxCollider)
        collider.size = cc.winSize
        
        let spriteFrame = this.fm.getSpriteAtlasByName("skillDrag").getSpriteFrame("skillDragFull")
        let sprite = this.node.addComponent(cc.Sprite)
        sprite.spriteFrame = spriteFrame
        sprite.type = cc.Sprite.Type.SLICED
        sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM
        this.node.setContentSize(cc.winSize)
    }

    onCollision (unit: UnitBase) {
        this.upZoder(unit)
    }

}