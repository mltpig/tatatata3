import BuffBase from "./BuffBase";

export default class BuffBlood extends BuffBase {

    trigger () {
        this.target._hurtDeal.addBuffHurt(this.data, this.bAttr, this.fight)
    }
}