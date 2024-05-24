import DragBase from "./DragBase";

const {ccclass, property} = cc._decorator;

/**
 * 只能对自己施法
 */
@ccclass
export default class DragSelf extends DragBase {
    private skillNode1: cc.Node;

    init () {
        super.init()

        this.skillNode1 = new cc.Node()
		this.skillNode1.setPosition(this.pos)
        this.node.addChild(this.skillNode1)
        let spriteFrame = this.fm.getSpriteAtlasByName("skillDrag").getSpriteFrame("skillDragRange")
        let sp = this.skillNode1.addComponent(cc.Sprite)
        sp.spriteFrame = spriteFrame
        sp.sizeMode = cc.Sprite.SizeMode.CUSTOM
        this.skillNode1.setContentSize(cc.size(80,80))

        this.circleCollider = this.node.addComponent(cc.CircleCollider)
        this.circleCollider.radius = 20
		this.circleCollider.offset = this.pos

        if (!this.target) {
            this.target = this.attacker
            this.upZoder(this.target)
        }
    }

    onTouchMove (pos: cc.Vec2) {
    }
}