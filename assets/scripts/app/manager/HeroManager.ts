import StaticManager from "./StaticManager";
import { checkArrayInKey, clone, DS, ES, sortByKey } from "../other/Global"
import PlayerManager from "./PlayerManager";
import Contants from "../other/Contants";

/**
 * 英雄数据
 */
class HeroManager {
    private static instance_: HeroManager
    static getInstance (): HeroManager {
        if (!this.instance_) {
            this.instance_ = new HeroManager()
        }
        return HeroManager.instance_
    }

    private heroData_: Array<HEROINFO> = [];

    init () {
        let heros = StaticManager.getStaticValues("static_hero")
        for (let i = 0; i < heros.length; i++) {
            const e = heros[i];
            let m1 = JSON.parse(e.size)
            let item = {
                id: e.id.toString(),
                name: e.name,
                des: e.des,
                attack: e.attack,
                atkGrow: e.atkGrow,
                crit: e.crit,
                critHurt: e.critHurt,
                rage: e.rage,
                maxRage: e.maxRage,
                upExp: e.upExp,
                atkSpeed: e.atkSpeed,
                size: cc.size(m1[0],m1[1]),
                normalSkill: e.normalSkill,
                initiativeSkill: e.initiativeSkill,
                extraStates: JSON.parse(e.extraStates),
                res: e.res,
                atkRange: e.atkRange,
            }
            this.heroData_.push(item)
        }
    }
    
    // 获取所有英雄
    get heroData (): Array<HEROINFO> {
        return this.heroData_
    }

    getHeroDataById (id: string): HEROINFO {
        id = id.toString()
        for (let i = 0; i < this.heroData_.length; i++) {
            if (this.heroData_[i].id == id) {
                return this.heroData_[i]
            }
        }
        return
    }

    // 获取已解锁的英雄
    get openHeroData (): Array<HEROINFO> {
        let heros: Array<HEROINFO> = [];
        let d: Array<BOOKLOCALDATA> = PlayerManager.bookData

        // 排序 等阶=>等级=>id
        let newD: Array<SORTDATA> = []
        for (let i = 0; i < d.length; i++) {
            let hd = PlayerManager.getHeroData(d[i].id)
            newD.push({
                id: parseInt(d[i].id),
                level: DS(hd.level),
                exp: DS(hd.exp),
                patch: DS(hd.patch),
            })
        }

        // 排序
        let sort = (a: SORTDATA, b: SORTDATA) => {
            if (a.level == b.level) {
                if (a.exp == b.exp) {
                    if (a.patch == b.patch) {
                        return a.id - b.id
                    } else {
                        return b.patch - a.patch
                    }
                } else {
                    return b.exp - a.exp
                }
            } else {
                return b.level - a.level   
            }
        }
        newD.sort(sort)

        for (let i = 0; i < newD.length; i++) {
            let heroInfo = this.getHeroDataById(newD[i].id.toString())
            heros.push(heroInfo)
        }
        
        return heros
    }

    // 获取等阶养成数据
    getCurHeroData (id: string): HEROATTR {
        id = id.toString()
        let heroData: HEROINFO = StaticManager.getStaticValue("static_hero", id)
        let heroLocalData: HEROLOCALDATA = PlayerManager.getHeroData(id)

        // 基础
        let data: HEROATTR = {
            attack: DS(heroData.attack),
            atkSpeed: DS(heroData.atkSpeed),
            atkGrow: DS(heroData.atkGrow),
            crit: DS(heroData.crit),
            critHurt: DS(heroData.critHurt),
            rage: DS(heroData.rage),
            maxRage: DS(heroData.maxRage),
        }

        // 等阶养成
        if (heroLocalData) {

            let upData = StaticManager.heroUpData.get(id)
            sortByKey(upData, "level", "up")
            for (let i = 0; i < upData.length; i++) {
                let v = upData[i]
                if (v.level <= DS(heroLocalData.level)) {
                    for (let j = 0; j < Contants.SHOWATTR.length; j++) {
                        let key = Contants.SHOWATTR[j]
                        if (v[key]) {
                            data[key] = data[key] + DS(v[key])
                        }
                    }
                } else {
                    break
                }
            }
            
        }

        return data
    }

    // 获取等级养成数据
    getCurHeroExpData (id: string): number {
        id = id.toString()
        let heroLocalData: HEROLOCALDATA = PlayerManager.getHeroData(id)
        let curExpData = StaticManager.getHeroExpData(id, DS(heroLocalData.exp))
        if (curExpData) {
            return DS(curExpData.fight_exp)
        }
        return 0
    }

}

export default HeroManager.getInstance()