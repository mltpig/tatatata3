import { BUFFGROWTYPE, STATETYPE } from "../../other/FightEnum";
import { DS } from "../../other/Global";
import BuffBase from "./BuffBase";

/**
 * 属性
 */
export default class BuffGrow extends BuffBase {

    trigger () {
        let key: string = this.data.key
        let value: number = this.data.value
        let per: boolean = this.data.percent == 1

        // 特殊处理
        if (parseInt(this.data.key) == BUFFGROWTYPE.atkHurt) {
            key = "1",
            value = Math.floor(DS(this.fight.attack) * this.data.value / 100) 
            per = false
        }
        
        let item: BUFFADD = {
            uid: this.uid,
            key: key,
            value: value,
            per: per,
        }
        if (this.specialType) {
            this.target._realValue.setBuffList(item, true)
        } else {
            this.target._realValue.setBuffList(item)
        }
        this.target.refresh()
    }

    clear () {
        if (this.state == STATETYPE.finish) { return }
        super.clear()

        this.target._realValue.clearBuffList(this.uid)
        this.target.refresh()
    }
}