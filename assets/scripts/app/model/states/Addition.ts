import StaticManager from "../../manager/StaticManager";
import { ADDITIONTYPE, CALCULATIONTYPE, SKILLTYPE } from "../../other/FightEnum";
import ActorBase from "../ActorBase";

/**
 * 强化类型
 */
interface ADDDATA {
    uid: string,
    data: ADDITIONDATA,
    type: ADDITIONTYPE,
}

export default class Addition {
    private target: ActorBase;
    private addList: Array<ADDDATA> = [];
    
    // 技能强化
    private skillMap: Map<string, BULLETDATA> = new Map();      

    constructor (target) {
        this.target = target
    }

    // 根据id添加强化
    // merge 合并
    addAddition (ids: Array<string>, merge: boolean): Array<string> {
        let bids: Array<string> = []
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i]
            let def = StaticManager.getStaticValue("static_strength", id.toString()) as ADDITIONDATA
            
            // 合并 / 非合并
            if (merge) {
                let key: number
                for (let p = 0; p < this.addList.length; p++) {
                    if (this.addList[p].data.id == def.id) {
                        key = p
                        break
                    }
                }
                
                if (key != undefined) {
                    // 存在
                    let vd = JSON.parse(this.addList[key].data.value)
                    let vd2 = JSON.parse(def.value)

                    for (let qq = 0; qq < vd.length; qq++) {
                        vd[qq] = vd[qq] + vd2[qq]
                    }
                    this.addList[key].data.value = JSON.stringify(vd)
                } else {
                    // 不存在
                    let uid = this.target.fm.uniqueId.toString()
                    bids.push(uid)
                    this.addList.push({
                        uid: uid,
                        data: def,
                        type: def.type,
                    })
                }

            } else {
                let uid = this.target.fm.uniqueId.toString()
                bids.push(uid)
                this.addList.push({
                    uid: uid,
                    data: def,
                    type: def.type,
                })
            }

            this.checkChangeUpdate(def.type)
        }
        return bids
    }

    // 根据唯一id删除强化
    delAddition (uids: Array<string>) {
        for (let i = 0; i < this.addList.length; i++) {
            for (let j = 0; j < uids.length; j++) {
                if (this.addList[i].uid == uids[j]) {
                    this.checkChangeUpdate(this.addList[i].type)
                    this.addList.splice(i,1)
                    i--
                }
            }
        }
    }
    
    // 技能类型强化
    getAdditionSkill (def: BULLETDATA, add: ADDDATA): BULLETDATA {
        // 计算
        let key = JSON.parse(add.data.key)
        let nt: any = JSON.parse(def[key[0]])
        let dt: any
        if (key[2]) {
            dt = nt[key[1]][key[2]]
        } else if (key[1]) {
            dt = nt[key[1]]
        } else {
            dt = nt
        }
        
        let v = JSON.parse(add.data.value)
        switch (add.data.ctype) {
            case CALCULATIONTYPE.add:
                if (typeof dt == "number") {
                    dt = dt + v[0]
                }
                break;
            case CALCULATIONTYPE.minus:
                if (typeof dt == "number") {
                    dt = dt - v[0]
                }
                break;
            case CALCULATIONTYPE.ride:
                if (typeof dt == "number") {
                    dt = dt * v[0]
                }
                break;
            case CALCULATIONTYPE.except:
                if (typeof dt == "number") {
                    dt = dt / v[0]
                }
                break;
            case CALCULATIONTYPE.replace:
                dt = add.data.value
                break;
            case CALCULATIONTYPE.arr:
                for (let i = 0; i < v.length; i++) {
                    dt.push(v[i])
                }
                break;
            default:
                break;
        }

        if (key[2]) {
            nt[key[1]][key[2]] = dt
        } else if (key[1]) {
            nt[key[1]] = dt
        } else {
            nt = dt
        }
        def[key[0]] = JSON.stringify(nt)
        return def
    }   

    checkChangeUpdate (type: ADDITIONTYPE) {
        switch (type) {
            case ADDITIONTYPE.skillType:
            case ADDITIONTYPE.normalSkill:
            case ADDITIONTYPE.skillLaunch:
                this.skillMap.clear()
                break;
            default:
                break;
        }
    }

    // 获取强化数据
    getSkillData (id: string): BULLETDATA {
        id = id.toString()
        let def = StaticManager.getStaticValue("static_skill", id) as BULLETDATA
        if (!def) { return }

        let self = this
        let newDef = function (): BULLETDATA {
            for (let i = 0; i < self.addList.length; i++) {
                let data = self.addList[i];
                switch (data.type) {
                    case ADDITIONTYPE.skillType:
                        def = self.getAdditionSkill(def, data)
                        break;
                    case ADDITIONTYPE.normalSkill:
                        if (def.skillType == SKILLTYPE.normal) {
                            def = self.getAdditionSkill(def, data)
                        }
                        break;
                    case ADDITIONTYPE.skillLaunch:
                        let extra = JSON.parse(data.data.extra)[0]
                        if (def.id.toString() == extra.toString()) {
                            def = self.getAdditionSkill(def, data)
                        }
                        break;
                    case ADDITIONTYPE.activeSkill:
                        if (def.skillType != SKILLTYPE.normal) {
                            def = self.getAdditionSkill(def, data)
                        }
                        break;
                    default:
                        break;
                }
            }

            self.skillMap.set(id, def)
            return def
        }

        if (this.skillMap.get(id) == null) {
            newDef()
        }

        return this.skillMap.get(id)
    }
}