import { UI_ZORDER } from "../../../framework/utils/Enumer";
import ActorBase from "../../model/ActorBase";
import HeroActor from "../../model/hero/HeroActor";
import Contants from "../../other/Contants";
import { DRAGTARGETTYPE, DRAGTYPE } from "../../other/FightEnum";
import { TSCENE } from "../../other/Tool";
import DragBase from "./skillDrag/DragBase";
import DragCircle from "./skillDrag/DragCircle";
import DragFan from "./skillDrag/DragFan";
import DragFull from "./skillDrag/DragFull";
import DragLine from "./skillDrag/DragLine";
import DragOne from "./skillDrag/DragOne";
import DragRect from "./skillDrag/DragRect";
import DragSelf from "./skillDrag/DragSelf";

/**
 * 拖动施法
 */
export default class SkillDrag {
    private data: DRAGDATA;
    private dragScript: DragBase;
    public dragNode: cc.Node;

    constructor (data: DRAGDATA) {
        this.data = data

        this.dragNode = cc.instantiate(data.prefab)
        TSCENE().addChild(this.dragNode, UI_ZORDER.dragZoder)

        switch (this.data.bAttr.dragType) {
            case DRAGTYPE.one:
                this.dragScript = this.dragNode.addComponent(DragOne)
                break;
            case DRAGTYPE.circle:
                this.dragScript = this.dragNode.addComponent(DragCircle)
                break;
            case DRAGTYPE.fan:
                this.dragScript = this.dragNode.addComponent(DragFan)
                break;
            case DRAGTYPE.full:
                this.dragScript = this.dragNode.addComponent(DragFull)
                break;
            case DRAGTYPE.line:
                this.dragScript = this.dragNode.addComponent(DragLine)
                break;
            case DRAGTYPE.rect:
                this.dragScript = this.dragNode.addComponent(DragRect)
                break;
            case DRAGTYPE.self:
                this.dragScript = this.dragNode.addComponent(DragSelf)
                break;
            default:
                console.log("error dragType")
                break;
        }
        this.dragScript.setData(this.data)
        this.dragScript.init()
    }

    onTouchMove (pos: cc.Vec2) {
        this.dragScript.onTouchMove(pos)
    }

    onTouchEnds (pos: cc.Vec2, cancel: boolean) {
        if (!cancel) {
            this.castSkill()
        }
        this.clear()
    }

    onTouchCancel (pos: cc.Vec2) {
        this.clear()
    }

    // 执行技能
    castSkill () {
        if (this.dragScript.cancel) {
            // 取消施法
            return
        }

        switch (this.data.type) {
            case DRAGTARGETTYPE.hero:
                let attacker = <HeroActor>this.data.attacker
                let t = this.dragScript.target ? this.dragScript.target : this.dragScript.targetPos
                attacker.addHandSkill(t)
                break;
            default:
                break;
        }
    }
    
    // 清除
    clear () {
        this.dragScript.clear()
    }
}