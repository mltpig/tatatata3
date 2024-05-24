import { ATTRTYPE, STATETYPE } from "../../other/FightEnum";
import { DS } from "../../other/Global";
import BuffBase from "./BuffBase";

/**
 * 刷新型 = 属性
 */
enum refreshType {
    monster = 1,
    atkMax = 2,
    crit2Hurt = 3,
    crit2Rage = 4,  
    as2Rage = 5,           // 攻速增加能量回复
}

export default class BuffRefresh extends BuffBase {
    private record_: number = 0;
    private hasTrigger_: boolean = false;
    private _refreshTime: number = 0
    private _refreshInterval: number = 0.1  // 间隔刷新
    
    update2 (dt: number) {
        super.update2(dt)

        this._refreshTime = this._refreshTime + dt
        if (this._refreshTime < this._refreshInterval) { return }

        this._refreshTime = 0
        this.checkUpdate()
    }

    getMaxAtk (): number {
        let atk: number = 0
        let heros = this.target.fm.getHeros()
        for (let i = 0; i < heros.length; i++) {
            if (heros[i].uid != this.target.uid) {
                let m = DS(heros[i]._realValue.realFight.attack)
                if (atk < m) {
                    atk = m
                }
            }
        }
        return atk / 100
    }

    checkUpdate () {
        let num: number = 0
        switch (this.data.harmType) {
            case refreshType.monster:
                num = this.fm.getMonsters().length
                break;
            case refreshType.atkMax:
                num = this.getMaxAtk()
                break;
            case refreshType.crit2Hurt:
                num = this.target._realValue.getUseAttr(ATTRTYPE.crit)
                break;
            case refreshType.crit2Rage:
                let d = JSON.parse(this.data.extra)
                let crit: number = this.target._realValue.getUseAttr(ATTRTYPE.crit)
                if (crit > 100) {
                    num = Math.floor((crit - 100) / d[0])
                } else {
                    num = 0
                }
                break;
            case refreshType.as2Rage:
                let d2 = JSON.parse(this.data.extra)
                let atkSpeed: number = this.target._realValue.getAtkSpeed()
                num = Math.floor(atkSpeed / d2[0])
                break;
            default:
                break;
        }
        
        if (num != this.record_) {
            this.trigger2(num)
        }
    }

    trigger2 (num: number) {
        if (!this.hasTrigger_) {
            return
        }
        
        this.record_ = num
        this.target._realValue.updateBuffAdd(this.uid, Math.floor(this.data.value * num))
    }

    trigger () {
        let item: BUFFADD = {
            uid: this.uid,
            key: this.data.key,
            value: 0,
            per: this.data.percent == 1,
        }
        this.target._realValue.setBuffAdd(item)
        this.hasTrigger_ = true
    }
    
    clear () {
        if (this.state == STATETYPE.finish) { return }
        super.clear()

        this.target._realValue.clearBuffAdd(this.uid)
    }
}