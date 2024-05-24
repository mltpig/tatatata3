import { STATETYPE } from "../../other/FightEnum";
import BuffBase from "./BuffBase";

export default class BuffSpecial extends BuffBase {
    private specialUidList: Array<string> = [];
    private specialIdlist: Array<string>;

    setData (data: BUFFDATA) {
        super.setData(data)
        this.specialIdlist = JSON.parse(this.data.extra)
    }

    trigger () {
        let list = this.target._special.addSpecial(this.specialIdlist)
        this.specialUidList = this.specialUidList.concat(list)
    }
                
    clear () {
        if (this.state == STATETYPE.finish) { return }
        super.clear()

        this.target._special.delSpecial(this.specialUidList)
    }
}