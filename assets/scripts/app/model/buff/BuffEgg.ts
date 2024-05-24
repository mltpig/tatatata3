import { random2 } from "../../other/Global";
import BuffBase from "./BuffBase";

/**
 * 金蛋
 */
export default class BuffEgg extends BuffBase {

    trigger () {
        let can = random2(0,10000) < this.data.value * 100
        if (can) {
            this.fm.addRandom()
        }
    }
}