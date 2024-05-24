import EventDispatcher from "../../../framework/utils/EventDispatcher";
import { REFRESHINFOTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import BuffBase from "./BuffBase";

/**
 * 隐藏符文装备
 */
export default class BuffHide extends BuffBase {

    trigger () {
        let heroId = this.target.uid
        this.fm.equipProp.get(heroId).clear()
        EventDispatcher.dispatchEvent(Events.fight_hero_change_event, {
            id: heroId,
            type: REFRESHINFOTYPE.skill
        })
    }
}