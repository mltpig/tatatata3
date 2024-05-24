import { STATETYPE } from "../../other/FightEnum";
import BuffBase from "./BuffBase";

export default class BuffStatus extends BuffBase {

    trigger () {
        this.target._status.addStatus({
            uid: this.uid,
            type: this.data.value
        })
    }

    clear () {
        if (this.state == STATETYPE.finish) { return }
        super.clear()

        this.target._status.delStatus(this.uid)
    }
}