import { ATTRTYPE, CAMPTYPE, CONDITIONTYPE, STATETYPE } from "../../other/FightEnum";
import { DS, random2, spliceArray } from "../../other/Global";
import ActorBase from "../ActorBase";
import MonsterActor from "../monster/MonsterActor";
import RealValue from "./RealValue";

/**
 * 条件判断类
 * 条件不可重复相同type
 */
export default class Condition {
    private target: ActorBase;
    private realValue: RealValue;

    constructor (target) {
        this.target = target
    }

    init (realValue: RealValue) {
        this.realValue = realValue
    }

    /**
     * 
     * @param type 0 <= 1 >=
     * @param n1 
     * @param n2 
     * @returns 
     */
    check1 (type: number, n1: number, n2: number) {
        switch (type) {
            case 0:
            default:
                return n1 == n2
            case 1:
                return n1 > n2
            case 2:
                return n1 < n2
            case 3:
                return n1 >= n2
            case 4:
                return n1 <= n2
        }
    }

    // 实时的条件判断
    checkCurrent (condition: Array<Array<any>>) {
        // 且 逻辑
        let can = true
        for (let i = 0; i < condition.length; i++) {
            const v = condition[i];
            switch (v[0]) {
                // 0 类型 1 计算方式 2 数量 3... 条件
                case CONDITIONTYPE.hp:
                    if (!this.check1(v[1], this.getHpPer(), v[2])) {
                        can = false
                    }
                    break;
                case CONDITIONTYPE.aim:
                    let ndef = this.target._addition.getSkillData(this.target.normalSkill)
                    let ntarget = this.target.checkTarget(ndef)
                    if (!ntarget) {
                        can = false
                    }
                    break;
                case CONDITIONTYPE.pro:
                    if (!this.check1(4, random2(0,100), v[2])) {
                        can = false
                    }
                    break;
                case CONDITIONTYPE.monsterType:
                    let hit: boolean = false
                    if (this.target.campType == CAMPTYPE.monster) {
                        let newt = this.target as MonsterActor
                        if (this.check1(v[1], newt.data.type, v[2])) {
                            hit = true
                        }
                    }
                    if (!hit) { can = false }
                    break;
                case CONDITIONTYPE.rangeMonster:
                    // 范围内不存在敌人
                    let range = v[2] 
                    let camp = v[3]
                    let actors = this.target.fm.getActorsByCamp(camp)
                    for (let i1 = 0; i1 < actors.length; i1++) {
                        let v1 = actors[i1]
                        let can1 = this.target.node.position.sub(v1.node.position).mag() <= range
                        if (can1) {
                            can = false
                            break
                        }
                    }
                    break;
                case CONDITIONTYPE.atkSpeed:
                case CONDITIONTYPE.cd:
                case CONDITIONTYPE.skill:
                case CONDITIONTYPE.kill:
                case CONDITIONTYPE.target:
                case CONDITIONTYPE.timer:
                case CONDITIONTYPE.atkNum:
                default:
                    can = false
                    break;
            }

            if (can == false) {
                break
            }
        }   
        
        return can
    }

    // condition 0 类型 1 计算方式 2 数量 3... 条件
    check (state: STATEDATA): boolean {
        let condition = state.condition

        // 启动
        if (!state.started) {
            state.started = true
            for (let i = 0; i < condition.length; i++) {
                const v = condition[i];

                switch (v[0]) {
                    case CONDITIONTYPE.cd:
                    case CONDITIONTYPE.atkSpeed:
                    case CONDITIONTYPE.skill:
                    case CONDITIONTYPE.kill:
                    case CONDITIONTYPE.atkNum:
                        let newData = spliceArray(v,0,3)
                        this.target._notes.addTimeNotes(state.uid, v[0], newData)
                        break;
                    default:
                        break;
                }
            }
        }

        // 且 逻辑
        let can = true
        for (let i = 0; i < condition.length; i++) {
            const v = condition[i];
            switch (v[0]) {
                // 0 类型 1 计算方式 2 数量 3... 条件
                case CONDITIONTYPE.hp:
                    if (!this.check1(v[1], this.getHpPer(), v[2])) {
                        can = false
                    }
                    break;
                case CONDITIONTYPE.aim:
                    let ndef = this.target._addition.getSkillData(this.target.normalSkill)
                    let ntarget = this.target.checkTarget(ndef)
                    if (!ntarget) {
                        can = false
                    }
                    break;
                case CONDITIONTYPE.target:
                    let def = this.target._addition.getSkillData(state.skillId)
                    let target = this.target.checkTarget(def)
                    if (!target) {
                        can = false
                    }
                    break;
                case CONDITIONTYPE.atkSpeed:
                    let curAtkSpeed = this.target._notes.getTimeNotes(state.uid, v[0])
                    let atkSpeed = this.target._realValue.getUseAttr(ATTRTYPE.atkSpeed)
                    if (!this.check1(v[1], curAtkSpeed, atkSpeed)) {
                        can = false
                    }
                    break;
                case CONDITIONTYPE.pro:
                    if (!this.check1(4, random2(0,100), v[2])) {
                        can = false
                        // 清除记录
                        this.target._notes.clearNotes(state.uid)
                    }
                    break;
                case CONDITIONTYPE.monsterType:
                    let hit: boolean = false
                    if (this.target.campType == CAMPTYPE.monster) {
                        let newt = this.target as MonsterActor
                        if (this.check1(v[1], newt.data.type, v[2])) {
                            hit = true
                        }
                    }
                    if (!hit) { can = false }
                    break;
                case CONDITIONTYPE.rangeMonster:
                    // 范围内不存在敌人
                    let range = v[2] 
                    let camp = v[3]
                    let actors = this.target.fm.getActorsByCamp(camp)
                    for (let i1 = 0; i1 < actors.length; i1++) {
                        let v1 = actors[i1]
                        let can1 = this.target.node.position.sub(v1.node.position).mag() <= range
                        if (can1) {
                            can = false
                            break
                        }
                    }
                    break;
                case CONDITIONTYPE.cd:
                case CONDITIONTYPE.skill:   //    技能类型
                case CONDITIONTYPE.kill:
                case CONDITIONTYPE.timer:
                case CONDITIONTYPE.atkNum:
                    let curNum = this.target._notes.getTimeNotes(state.uid, v[0])
                    if (!this.check1(v[1], curNum, v[2])) {
                        can = false
                    }
                    break;
                default:
                    break;
            }

            if (can == false) {
                break
            }
        }   

        return can
    }

    getHpPer (): number {
        let hp = this.realValue.getUseAttr(ATTRTYPE.hp)
        let maxHp = this.realValue.getUseAttr(ATTRTYPE.maxHp)
        return Math.floor(hp * 100 / maxHp)
    }
}