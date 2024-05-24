import EventDispatcher from "../../../framework/utils/EventDispatcher";
import { REFRESHINFOTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { random1 } from "../../other/Global";
import BuffBase from "./BuffBase";

interface RANDEQUIPS {
    heroId: string,
    index: number,
}

/**
 * 隐藏随机英雄随机一件装备
 */
export default class BuffRandHide extends BuffBase {

    trigger () {
        let equips: Array<RANDEQUIPS> = [];
        let equipProp = this.fm.equipProp
            
        equipProp.forEach((value, key) => {
            value.forEach((value1, key1) => {
                equips.push({
                    heroId: key,
                    index: key1,
                })
            })
        });

        let num = random1(0, equips.length)
        let id: string = equips[num].heroId
        let pos: number = equips[num].index
        this.fm.equipProp.get(id).delete(pos)
        EventDispatcher.dispatchEvent(Events.fight_hero_change_event, {
            id: id,
            type: REFRESHINFOTYPE.skill
        })
    }
}