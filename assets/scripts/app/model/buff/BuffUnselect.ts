import { STATETYPE, STATUSTYPE } from "../../other/FightEnum";
import BuffBase from "./BuffBase";

export default class BuffUnselect extends BuffBase {

    trigger () {
        this.target._status.addStatus({
            uid: this.uid,
            type: STATUSTYPE.unselect,
        })
    }
                
    clear () {
        if (this.state == STATETYPE.finish) { return }
        super.clear()

        this.target._status.delStatus(this.uid)
    }
}