import GameUtils from "../../other/GameUtils";
import ActorBase from "../ActorBase";
import BulletBase from "./BulletBase";

/**
 * 光环
 * 该子弹会一直存在
 */
const {ccclass, menu, property} = cc._decorator;

@ccclass
export default class BulletHalo extends BulletBase {
    private _haloBuffs: Array<string>;

    setData (data: BULLETDATA) {
        super.setData(data)

        this._haloBuffs = JSON.parse(this.data.buff)
    }

    bulletStart () {
        super.bulletStart()
        this.targetPos = cc.v2(this.attacker.node.x, this.attacker.node.y)
    }

    // 进入
    onCollisionEnter (other, self) {
        let unit: ActorBase = other.node.getComponent(ActorBase)
        if (GameUtils.checkTargetAttack(this.data, unit)) {
            unit._buffs.addBuffs(this._haloBuffs, this.attacker._realValue.realFight, this.data)
        }
    }

    // 离开
    onCollisionExit (other, self) {
        let unit: ActorBase = other.node.getComponent(ActorBase)
        if (GameUtils.checkTargetAttack(this.data, unit)) {
            unit._buffs.delBuffs(this._haloBuffs)
        }
    }
}