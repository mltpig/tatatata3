import { STATETYPE } from "../../other/FightEnum";
import BuffBase from "./BuffBase";

export default class BuffState extends BuffBase {
    private stateUidList: Array<string> = [];
    private stateIdlist: Array<string>;

    setData (data: BUFFDATA) {
        super.setData(data)
        this.stateIdlist = JSON.parse(this.data.extra)
    }

    trigger () {
        let list = this.target.addStates(this.stateIdlist)
        this.stateUidList = this.stateUidList.concat(list)
    }
                
    clear () {
        if (this.state == STATETYPE.finish) { return }
        super.clear()

        this.target.delStates(this.stateUidList)
    }
}