import EventDispatcher from "../../../framework/utils/EventDispatcher";
import Events from "../../other/Events";
import { STATETYPE } from "../../other/FightEnum";
import MonsterActor from "./MonsterActor";

/**
 * 特殊模式：防守类
 * 怪物
 */
 const {ccclass, menu, property} = cc._decorator;

 @ccclass
 export default class DefendMonsterActor extends MonsterActor {

    dodead (state: STATEDATA) {
        super.dodead(state)
        
        EventDispatcher.dispatchEvent(Events.defend_soul_event)
    }

}