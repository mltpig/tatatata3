import StaticManager from "../../manager/StaticManager";
import { BUFFTYPE, CAMPTYPE, STATETYPE } from "../../other/FightEnum";
import ActorBase from "../ActorBase";
import BuffAddition from "./BuffAddition";
import BuffAttr from "./BuffAttr";
import BuffBase from "./BuffBase";
import BuffBlood from "./BuffBlood";
import BuffGrow from "./BuffGrow";
import BuffStatus from "./BuffStatus";
import BuffRage from "./BuffRage";
import BuffState from "./BuffState";
import BuffUnselect from "./BuffUnselect";
import BuffSpecial from "./BuffSpecial";
import CCAnimation from "../../../framework/creator/CCAnimation";
import { checkArrayIn } from "../../other/Global";
import BuffRefresh from "./BuffRefresh";
import GameManager from "../../manager/GameManager";
import BuffRune from "./BuffRune";
import BuffCondition from "./BuffCondition";
import BuffEgg from "./BuffEgg";
import BuffHide from "./BuffHide";
import BuffRandHide from "./BuffRandHide";

interface buffEffect {
    floor: number,      // 层数
    node: cc.Node,      // 显示节
}

/**
 * buff管理类
 */
export default class BuffOwner {
    public target: ActorBase;
    public buffList: Array<BuffBase> = [];
    private effects: Map<string, buffEffect> = new Map();
    private specialBuffs: Map<string, number> = new Map();
    
    constructor (target) {
        this.target = target
    }

    // 添加buff
    addBuffs (ids: Array<string>, fight: ATTRDATA, bAttr: BULLETDATA = null, floor: number = null) {
        if (ids.length == 0) { return }

        for (let i = 0; i < ids.length; i++) {
            this.addBuff(ids[i], fight, bAttr, floor)
        }        
    }
    
    // 清除buff
    delBuffs (ids: Array<string>) {
        for (let i = 0; i < ids.length; i++) {
            let vi = ids[i];
            for (let j = 0; j < this.buffList.length; j++) {
                let vj = this.buffList[j];
                if (vi.toString() == vj.id) {
                    this.delBuff(j)
                    break
                }
            }
        }
    }
    
    addBuff (id: string, fight: ATTRDATA, bAttr: BULLETDATA = null, floor: number = null) {
        id = id.toString()
        let def: BUFFDATA = StaticManager.getStaticValue("static_buff", id)
        if (!def) { return }

        // 免疫
        if (this.target._status.effectBuff(def.profit)) {
            return
        }
        
        // 英雄无效化
        if (this.checkHeroInvalid(def)) {
            return
        }
        
        // 检测condition
        let condi = JSON.parse(def.condition)
        if (condi.length > 0) {
            if (!this.target._condition.checkCurrent(condi)) {
                return
            }
        }

        // 检测上限
        this.checkLimit(id, def.maxNum)
        
        let script;
        switch (def.type) {
            case BUFFTYPE.attr:
                script = new BuffAttr()
                break;
            case BUFFTYPE.grow:
                script = new BuffGrow()
                break;
            case BUFFTYPE.rage:
                script = new BuffRage()
                break;
            case BUFFTYPE.unselect:
                script = new BuffUnselect()
                break;
            case BUFFTYPE.state:
                script = new BuffState()
                break;
            case BUFFTYPE.blood:
                script = new BuffBlood()
                break;
            case BUFFTYPE.status:
                script = new BuffStatus()
                break;
            case BUFFTYPE.addition:
                script = new BuffAddition()
                break;
            case BUFFTYPE.special:
                script = new BuffSpecial()
                break;
            case BUFFTYPE.refresh:
                script = new BuffRefresh()
                break;
            case BUFFTYPE.rune:
                script = new BuffRune()
                break;
            case BUFFTYPE.condi:
                script = new BuffCondition()
                break;
            case BUFFTYPE.egg:
                script = new BuffEgg()
                break;
            case BUFFTYPE.hide:
                script = new BuffHide()
                break;
            case BUFFTYPE.randHide:
                script = new BuffRandHide()
                break;
            default:
                break;
        }

        // 多层
        if (floor) { def.value = def.value * floor }

        script.setData(def)

        // deal
        if (script.specialType) {
            if (this.checkLimit2(id, def.maxNum)) {
                script = null
                return
            } else {
                this.addLimit(id)
            }
        }   
        
        script.setTarget(this.target)
        script.setFight(fight)
        script.setBAttr(bAttr)

        this.addBuffEffect(def.effect, def.wrapMode)

        this.buffList.push(script)
    }

    // 针对英雄无效化的buff
    checkHeroInvalid (def: BUFFDATA): boolean {
        if (this.target.campType != CAMPTYPE.hero) {
            return false
        }

        switch (def.type) {
            case BUFFTYPE.attr:
                if (def.key == "speed") {
                    return true
                }
                break;
            case BUFFTYPE.blood:
                return true
            default:
                break;
        }

        return false
    }

    // 非清除型buff达到叠加上限
    checkLimit (id: string, limit: number) {
        // 无穷
        if (limit == -1) { return }

        let index = 0
        for (let i = 0; i < this.buffList.length; i++) {
            let v = this.buffList[i]
            if (v.id == id) {
                index = index + 1
                if (index >= limit) {
                    this.delBuff(i)
                    i--
                }
            }
        }
    }

    // 清除型buff达到叠加上限 + add
    checkLimit2 (id: string, limit: number): boolean {
        // 无穷
        if (limit == -1) { return false }

        let num = this.specialBuffs.get(id) 
        num = num ? num : 0

        if (num >= limit) {
            return true
        } else {
            return false
        }
    }
    addLimit (id: string) {
        let num = this.specialBuffs.get(id) 
        if (num) {
            this.specialBuffs.set(id, num + 1)
        } else {
            this.specialBuffs.set(id, 1)
        }
    }

    update2 (dt: number) {
        for (let i = 0; i < this.buffList.length; i++) {
            let v = this.buffList[i]
            if (v.onState(STATETYPE.finish)) {
                this.delBuff(i)
                i--
            } else {
                v.update2(dt)
            }
        }
    }

    // 清除buff
    delBuff (index) {
        this.delBuffEffect(this.buffList[index].data.effect)
        this.buffList[index].clear()
        this.buffList.splice(index, 1)
    }

    // 添加特效
    addBuffEffect (res: string, wrapMode: number) {
        if (parseInt(res) == 0) { return }

        let wrap = wrapMode == 1 ? cc.WrapMode.Normal : cc.WrapMode.Loop
        let e = this.effects.get(res) as buffEffect
        if (e) {
            this.effects.set(res, {
                floor: e.floor + 1,
                node: e.node,
            })
            if (wrap == cc.WrapMode.Normal) {
                let effectAni = this.effects.get(res).node.getComponent(CCAnimation)
                GameManager.getFM().playEffect(effectAni, "buff/", res, wrap)
            }
        } else {
            let node = new cc.Node()
            node.setPosition(0,0)
            this.target.buffNode.addChild(node)

            let effect = node.addComponent(CCAnimation)
            GameManager.getFM().playEffect(effect, "buff/", res, wrap)
            this.effects.set(res, {
                floor: 1,
                node: node,
            })
        }
    }

    delBuffEffect (res: string) {
        if (parseInt(res) == 0) { return }

        let e = this.effects.get(res) as buffEffect
        if (e) {
            if (e.floor <= 1) {
                e.node.getComponent(CCAnimation).clear()
                e.node.destroy()
                this.effects.delete(res)
            } else {
                this.effects.set(res, {
                    floor: e.floor - 1,
                    node: e.node,
                })
            }
        }
    }

    pauseEffect () {
        this.effects.forEach((value, key) => {
            value.node.getComponent(CCAnimation).pause()
        });
    }
    
    resumeEffect () {
        this.effects.forEach((value, key) => {
            value.node.getComponent(CCAnimation).resume()
        });
    }
    
    clear () {
    }
}