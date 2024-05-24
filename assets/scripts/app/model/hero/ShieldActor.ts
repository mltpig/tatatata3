import Contants from "../../other/Contants";
import { CAMPTYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import ActorBase from "../ActorBase";
import DefendMonsterActor from "../monster/DefendMonsterActor";
import { extraState } from "../states/StateBase";

/**
 * 特殊模式：防守类
 * 盾牌守卫者
 */
 const {ccclass, menu, property} = cc._decorator;

 @ccclass
 export default class ShieldActor extends ActorBase {
    private data: SHIELDDATA;
    
    setData (data: SHIELDDATA) {
        this.data = data

        let size = JSON.parse(this.data.size)
        this.nsize = cc.size(size[0], size[1])
        this.bodyCollider.size = this.nsize

        this.bloodItem = this.addBloodItem()
        this.bloodItem.hpActive = true
        this.bloodItem.hpProgress = 1
        this.bloodItem.hpColor = cc.Color.CYAN

        this._realValue.initBaseData(this.data)

        this.states = this.fm.getStates(extraState)
        this.checkWinkStates()

        this.campType = CAMPTYPE.shield
    }

    setIndex (index: number) {
        let pos = this.fm.getCachPos(index)
        this.node.setPosition(pos)
    }

    beHit () {
        this._hurtDeal.addLordHurt()
    }

    update2 (dt: number) {
        super.update2(dt)
        this.updateState()
        this.updateWinkStates()
    }
    
    onCollisionEnter (other, self) {
        let node = other.node as cc.Node
        switch (node.group) {
            case Contants.GROUP.monster:
                let script = node.getComponent(DefendMonsterActor)
                script.hitLord()
                this.beHit()
                break;
            default:
                break;
        }
    }
 }