import CCAnimation from "../../../framework/creator/CCAnimation";
import { UI_ZORDER } from "../../../framework/utils/Enumer";
import Contants from "../../other/Contants";
import { HURTBUFFTYPE, STATETYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { spliceByValue } from "../../other/Global";
import { TSCENE } from "../../other/Tool";
import ActorBase from "../ActorBase";
import UnitBase from "../UnitBase";

/**
 * 范围伤害
 * todo 对象池
 */
 const {ccclass, menu, property} = cc._decorator;

 @ccclass
 export default class HurtRect extends UnitBase {
    public fight: ATTRDATA;
    public bAttr: BULLETDATA;
    private list: Array<ActorBase> = [];
    private hurtTime: Array<number>;
    private timer: number = 0;
    private hurtBuff: Array<number> = [];
    private attacker: ActorBase;
    private downEffect: cc.Node;
    private upEffect: cc.Node;
    private endTimer: number;   // 结束时间

    setData (data: HURTRECTDATA) {
      this.fight = data.fight
      this.bAttr = data.bAttr
      this.hurtTime = JSON.parse(this.bAttr.hurtTime)
      this.hurtBuff = JSON.parse(this.bAttr.hurtBuff)
      this.endTimer = this.bAttr.effectDelay + this.hurtTime[this.hurtTime.length-1]
      this.endTimer = this.endTimer > 0.1 ? this.endTimer : 0.1
      this.attacker = this.fm.getHeroByid(this.fight.uid);

      let size = JSON.parse(this.bAttr.hurtRect)
      let collider;
      if (size[1]) {
         collider = this.node.addComponent(cc.BoxCollider)
         collider.size = cc.size(size[0], size[1])
      } else {
         collider = this.node.addComponent(cc.CircleCollider)
         collider.radius = size[0]
      }
      
      this.addhitUpEffect(this.bAttr.hitUpEffect)
      this.addHitDownEffect(this.bAttr.hitDownEffect)
    }

    // 上层特效
    addhitUpEffect (res: string) {
      if (parseInt(res) == 0) { return }

      this.upEffect = new cc.Node()
      this.upEffect.setPosition(this.node.x, this.node.y)
      TSCENE().addChild(this.upEffect, UI_ZORDER.hitUpZoder)

      let effect = this.upEffect.addComponent(CCAnimation)
      this.fm.playEffect(effect, "hitEffect/", res, cc.WrapMode.Loop)
    }

    // 下层特效
    addHitDownEffect (res: string) {
      if (parseInt(res) == 0) { return }

      this.downEffect = new cc.Node()
      this.downEffect.setPosition(this.node.x, this.node.y)
      TSCENE().addChild(this.downEffect, UI_ZORDER.hitDownZoder)

      let effect = this.downEffect.addComponent(CCAnimation)
      this.fm.playEffect(effect, "hitEffect/", res, cc.WrapMode.Loop)
    }

    update2 (dt: number) {
      super.update2(dt)

      for (let i = 0; i < this.hurtTime.length; i++) {
          const element = this.hurtTime[i];
          if (this.timer > element) {
              this.addHurt()
              this.hurtTime.splice(i,1)
              i--;
          }
      }

      if (this.timer > this.endTimer) {
          this.state = STATETYPE.finish
      }
      this.timer = this.timer + dt
    }

    onCollisionEnter (other, self) {
      let unit: ActorBase = other.node.getComponent(ActorBase)
      this.list.push(unit)
    }

    onCollisionExit (other, self) {
      let unit: ActorBase = other.node.getComponent(ActorBase)
      spliceByValue(this.list, unit)
    }

    addHurt () {
      let targets: Array<ActorBase> = []
      for (let i = 0; i < this.list.length; i++) {
         if (GameUtils.checkTargetAttack(this.bAttr, this.list[i])) {
            targets.push(this.list[i])
            this.list[i]._hurtDeal.addHurt(this.bAttr, this.fight)
         }
      }
      this.checkHurtBuff(targets)
    }

    checkHurtBuff (targets: Array<ActorBase>) {
      if (!this.attacker) { return }

      if (this.hurtBuff[0]) {
        switch (this.hurtBuff[0]) {
          case HURTBUFFTYPE.num:
            if (this.hurtBuff[2] <= targets.length) {
              this.attacker._buffs.addBuff(this.hurtBuff[1].toString(), this.fight, this.bAttr)
            }
            break;
          default:
            break;
        }
      }
    }
    
    pauseEffect () {
        if (this.upEffect && this.upEffect.isValid) {
            this.upEffect.getComponent(CCAnimation).pause()
        }
        if (this.downEffect && this.downEffect.isValid) {
            this.downEffect.getComponent(CCAnimation).pause()
        }
    }

    resumeEffect () {
        if (this.upEffect && this.upEffect.isValid) {
            this.upEffect.getComponent(CCAnimation).resume()
        }
        if (this.downEffect && this.downEffect.isValid) {
            this.downEffect.getComponent(CCAnimation).resume()
        }
    }

    clear () {
        this.node.destroy()
        if (this.upEffect && this.upEffect.isValid) {
            this.upEffect.destroy()
        }
        if (this.downEffect && this.downEffect.isValid) {
            this.downEffect.destroy()
        }
    }
 }