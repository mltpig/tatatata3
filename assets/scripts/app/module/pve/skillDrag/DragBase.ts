import DisUtils from "../../../../framework/utils/DisUtils";
import { UI_ZORDER } from "../../../../framework/utils/Enumer";
import GameManager from "../../../manager/GameManager";
import ActorBase from "../../../model/ActorBase";
import UnitBase from "../../../model/UnitBase";
import Contants from "../../../other/Contants";
import { CAMPTYPE } from "../../../other/FightEnum";
import { checkArrayIn, spliceByValue } from "../../../other/Global";
import { TSCENE } from "../../../other/Tool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class DragBase extends cc.Component {
    public data: DRAGDATA;
    public bAttr: BULLETDATA;
    public actors: Array<UnitBase> = [];
    public camps: Array<CAMPTYPE> = [];
    public dragData: Array<number> = [];
    public pos: cc.Vec2;
    public attacker: ActorBase;

    public target: ActorBase;
    public targetPos: cc.Vec2;
    public cancel: boolean = false
	public circleCollider: cc.CircleCollider;   
	public boxCollider: cc.BoxCollider;   
    public maskLayer: cc.Node;
    public initRefresh: boolean = true;        // 第一次碰撞刷新

    public fm = GameManager.getFM();

    setData (data: DRAGDATA) {
        this.data = data
        this.bAttr = data.bAttr
        this.camps = JSON.parse(this.bAttr.campType)
        this.dragData = JSON.parse(data.bAttr.dragData)
        this.pos = data.pos
        this.targetPos = data.pos
        this.attacker = this.data.attacker
    }

    init () {
        this.maskLayer = DisUtils.createMaskBg(null, null, 120)
        TSCENE().addChild(this.maskLayer, UI_ZORDER.dragZoder-1)

        if (this.attacker) {
            this.upZoder(this.attacker)
        }
    }

    onTouchMove (pos: cc.Vec2) {
    }

    upZoder (unit: UnitBase) {
        unit.node.zIndex = UI_ZORDER.dragUpZoder + unit.node.y
    }

    downZoder (unit: UnitBase) {
        unit.node.zIndex = UI_ZORDER.actorZoder + unit.node.y
    }

    lateUpdate (dt: number) {
        if (this.initRefresh) {
            this.initRefresh = false
            this.onTouchMove(this.pos)
        }
    }

    onCollision (unit: UnitBase) {
    }

    onCollisionEnter (other, self) {
        let unit = other.node.getComponent(UnitBase)
        if (checkArrayIn(this.camps, unit.campType)) {
            this.actors.push(unit)
            this.onCollision(unit)
        }
    }
    
    onCollisionExit (other, self) {
        let unit = other.node.getComponent(UnitBase)
        if (checkArrayIn(this.camps, unit.campType)) {
            spliceByValue(this.actors, unit)
            this.downZoder(unit)
        }
    }

    clear () {
        if (this.maskLayer) {
            this.maskLayer.destroy()
        }
        if (this.attacker) {
            this.attacker.node.zIndex = UI_ZORDER.heroZoder + this.attacker.node.y
        }
        this.node.destroy()
    }
}