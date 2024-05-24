import { STATETYPE } from "../../other/FightEnum";
import BuffBase from "./BuffBase";

/**
 * 实时刷新条件性buff
 */
export default class BuffCondition extends BuffBase {
    private _confirm: boolean = false;
    private _refreshTime: number = 0
    private _refreshInterval: number = 0.1  // 间隔刷新
    private _conditionLimit: any[];

    setData (data: BUFFDATA) {
        super.setData(data)
        this._conditionLimit = JSON.parse(this.data.extra)
    }

    update2 (dt: number) {
        super.update2(dt)

        this._refreshTime = this._refreshTime + dt
        if (this._refreshTime < this._refreshInterval) { return }

        this._refreshTime = 0
        let confirm = this.target._condition.checkCurrent(this._conditionLimit)
        if (confirm == this._confirm) { return }

        if (confirm) {
            this.trigger()
        } else {
            this.delTrigger()
        }
    }
    
    trigger () {
        this._confirm = true
        let item: BUFFADD = {
            uid: this.uid,
            key: this.data.key,
            value: this.data.value,
            per: this.data.percent == 1,
        }
        
        this.target._realValue.setBuffAdd(item)
    }

    delTrigger () {
        this._confirm = false
        this.target._realValue.clearBuffAdd(this.uid)
    }

    clear () {
        if (this.state == STATETYPE.finish) { return }
        super.clear()

        this.target._realValue.clearBuffAdd(this.uid)
    }
}