import { getMoveAngle, getMoveDegree, getMovePosInDis } from "../../../../framework/utils/MoveUtil";
import ActorBase from "../../../model/ActorBase";
import DragBase from "./DragBase";

const {ccclass, property} = cc._decorator;

/**
 * 单体施法
 * dragData 施法范围 
 */
@ccclass
export default class DragOne extends DragBase {
    private skillNode1: cc.Node;
	private skillNode2: cc.Node;
	private skillNode3: cc.Node;

    init () {
        super.init()

		this.cancel = true
		// 自身
        // if (checkArrayIn(this.camps, this.attacker.campType)) {
		// 	this.cancel = false
		// 	this.target = this.attacker
        // }

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
		this.skillNode2.setAnchorPoint(0,0.5)
        this.node.addChild(this.skillNode2)
        let spriteFrame2 = this.fm.getSpriteAtlasByName("skillDrag").getSpriteFrame("SkillDragSinger")
        let sp2 = this.skillNode2.addComponent(cc.Sprite)
        sp2.spriteFrame = spriteFrame2
        sp2.sizeMode = cc.Sprite.SizeMode.CUSTOM
		sp2.type = cc.Sprite.Type.SLICED
		this.skillNode2.opacity = 0

        this.skillNode3 = new cc.Node()
		this.skillNode3.setPosition(this.pos)
        this.node.addChild(this.skillNode3)
        let spriteFrame3 = this.fm.getSpriteAtlasByName("skillDrag").getSpriteFrame("skillDragRange")
        let sp3 = this.skillNode3.addComponent(cc.Sprite)
        sp3.spriteFrame = spriteFrame3
        sp3.sizeMode = cc.Sprite.SizeMode.CUSTOM
        this.skillNode3.setContentSize(cc.size(120,120))

        this.circleCollider = this.node.addComponent(cc.CircleCollider)
        this.circleCollider.radius = 20
		this.circleCollider.offset = this.pos
    }

    onTouchMove (pos: cc.Vec2) {
        this.moveDrag(pos)
    }

    moveDrag (pos: cc.Vec2) {
		// 检测
		if (this.target) { 
			this.downZoder(this.target)
		}

		let dragRage = this.dragData[0]
		this.target = null
		let nearDis: number = 50
		let longDir: number = 50
		for (let i = 0; i < this.actors.length; i++) {
			let act = <ActorBase>this.actors[i]
			let np = cc.v2(act.node.x, act.node.y)

			let dis = np.sub(pos).mag()
			let dis2 = this.pos.sub(np).mag()

			if (dis < longDir && dis < nearDis && dis2 <= dragRage) {
				nearDis = dis
				this.target = act
			}
		}

		this.cancel = this.target == null
		let newPos = getMovePosInDis(this.pos.x, this.pos.y, pos.x, pos.y, dragRage)
		this.skillNode3.setPosition(newPos)
		this.circleCollider.offset = newPos

		if (!this.target) {
			// 无目标
			this.skillNode2.opacity = 0
			return
		}

		// 有目标
		this.upZoder(this.target)
		this.skillNode2.opacity = 255
		let npp: cc.Vec2 = cc.v2(this.target.node.x, this.target.node.y)

		let dis = this.pos.sub(npp).mag() + + 80
		this.skillNode2.setAnchorPoint(55/dis,0.5)
		this.skillNode2.setContentSize(dis, 100)
		let degree = getMoveAngle(this.pos.x, this.pos.y, npp.x, npp.y)
        this.skillNode2.angle = degree
    }
}