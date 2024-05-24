import { CAMPTYPE, STATETYPE } from "../../other/FightEnum";
import HeroActor from "../hero/HeroActor";
import BuffBase from "./BuffBase";

/**
 * 属性
 */
export default class BuffAttr extends BuffBase {
    
    trigger () {
        let item: BUFFADD = {
            uid: this.uid,
            key: this.data.key,
            value: this.data.value,
            per: this.data.percent == 1,
        }
        
        if (this.specialType) {
            this.target._realValue.setBuffAdd(item, true)
        } else {
            this.target._realValue.setBuffAdd(item)
        }
    }
    
    clear () {
        if (this.state == STATETYPE.finish) { return }
        super.clear()

        this.target._realValue.clearBuffAdd(this.uid)
    }
}