import Contants from "../../other/Contants";
import { ATTRTYPE, CAMPTYPE, MONSTERTYPE } from "../../other/FightEnum";
import ActorBase from "../ActorBase";
import MonsterActor from "../monster/MonsterActor";

/**
 * 发射器
 */
const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("model/LordActor")
export default class LordActor extends ActorBase {
    private data: LORDINFO;
    private lordBlood: cc.Label;
    
    setData (data: LORDINFO) {
        this.data = data

        this.nsize = data.size
        this.bodyCollider.size = this.nsize
        
        let pos = this.fm.getCachPos(data.index)
        this.node.setPosition(pos)

        this.addLordBloodItem()
        this._realValue.initBaseData(this.data)

        this.refreshBlood()
        this.campType = CAMPTYPE.lord
    }

    addHp (hp: number) {
        this._realValue.changeHp(this._realValue.getUseAttr(ATTRTYPE.hp) + hp)
        this.refreshBlood()
    }
    
    addLordBloodItem () {
        let node = new cc.Node()
        this.lordBlood = node.addComponent(cc.Label)
        this.lordBlood.fontSize = 24
        node.color = cc.Color.YELLOW
        node.setPosition(cc.v2(0, 22))
        this.node.addChild(node)
    }

    refreshBlood () {
        this.lordBlood.string = this._realValue.getUseAttr(ATTRTYPE.hp).toString()
    }

    beHit () {
        this._hurtDeal.addLordHurt()
    }

    onCollisionEnter (other, self) {
        let node = other.node as cc.Node
        switch (node.group) {
            case Contants.GROUP.monster:
                let script = node.getComponent(MonsterActor)
                if (script.data.type == MONSTERTYPE.normal || script.data.type == MONSTERTYPE.boss) {
                    script.hitLord()
                    this.beHit()
                }
                break;
            default:
                break;
        }
    }

    clear () {
        this.node.destroy()
    }
}