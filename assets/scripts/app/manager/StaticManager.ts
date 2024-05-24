import { JOBTYPE, SEASONTYPE } from "../other/FightEnum";
import { clone, random2, sortByKey } from "../other/Global";
import { PATHS } from "../other/Paths";
import GameManager from "./GameManager";
import SecretManager from "./SecretManager";
// 静态数据表格

class StaticManager {
    private static instance_: StaticManager
    static getInstance (): StaticManager {
        if (!this.instance_) {
            this.instance_ = new StaticManager()
        }
        return StaticManager.instance_
    }

    // 表格
    private file = {};
    
    loadFile (callback) {
        let self = this
        cc.resources.loadDir(PATHS.json, function (err, jsonAsset) {
            for (const key in jsonAsset) {
                const element = <any>jsonAsset[key];
                // 加密处理
                let newData = SecretManager.secret(element.name, element.json)
                self.file[element.name] = newData
            }
            callback()
        });
    };

    // 获取静态表数据
    getStaticValue (name: string, key: string) {
        key = key.toString()
        let table = this.file[name]
        if (table) {
            for (let i = 0; i < table.length; i++) {
                if (table[i].id.toString() == key.toString()) {
                    return clone(table[i])
                }
            }
        }
        return null
    }
    
    getStaticValues (name: string) {
        let table = this.file[name]
        return clone(table)
    }

    private boxList: Map<string, Map<number, Array<BOXDATA>>> = new Map()
    // 宝箱随机处理
    getBoxRandData (id: string, type: number, num: number): Array<AWARDDATA> {
        id = id.toString()
        if (this.boxList.size == 0) {
            let t = this.getStaticValues("static_box") as Array<BOXDATA>
            for (let i = 0; i < t.length; i++) {
                let box = t[i].box.toString()
                if (!this.boxList.get(box)) {
                    this.boxList.set(box, new Map())
                }
                let map = this.boxList.get(box)
                if (!map.get(t[i].type)) {
                    map.set(t[i].type, [])
                }
                map.get(t[i].type).push(t[i])
            }
        }

        let list: Array<BOXDATA> = this.boxList.get(id).get(type)
        let max: number = 0
        for (let i = 0; i < list.length; i++) {
            max = max + list[i].weight
        }

        let boxData: Array<AWARDDATA> = [];
        for (let i = 0; i < num; i++) {
            let rm = random2(0,max)
            let m: number = 0
            for (let i = 0; i < list.length; i++) {
                m = m + list[i].weight
                if (m >= rm) {
                    let randomNum: string = JSON.parse(list[i].num)
                    let item = JSON.parse(list[i].item)
                    let box: AWARDDATA = {
                        bid: item.bid,
                        type: item.type,
                        num: random2(randomNum[0], randomNum[1])
                    }
                    boxData.push(box)
                    break
                }
            }
        }
        return boxData
    }

    // 升阶数据
    private heroUpData_: Map<string, Array<HEROUPDATA>> = new Map();
    get heroUpData (): Map<string, Array<HEROUPDATA>> {
        if (this.heroUpData_.size == 0) {
            let t = this.getStaticValues("static_hero_level") as Array<HEROUPDATA>
            for (let i = 0; i < t.length; i++) {
                let heroid = t[i].hero.toString()
                if (!this.heroUpData_.get(heroid)) {
                    this.heroUpData_.set(heroid, [])
                }
                this.heroUpData_.get(heroid).push(t[i])
            }
        }
        return this.heroUpData_
    }

    getHeroUpData (id: string, lv: number): HEROUPDATA {
        let d = this.heroUpData.get(id.toString())
        for (let i = 0; i < d.length; i++) {
            if (d[i].level == lv) {
                return d[i]
            }
        }
        return
    }
    
    // 升级数据
    private heroExpData_: Map<string, Array<HEROEXPDATA>> = new Map();
    get heroExpData (): Map<string, Array<HEROEXPDATA>> {
        if (this.heroExpData_.size == 0) {
            let t = this.getStaticValues("static_hero_level_up") as Array<HEROEXPDATA>
            for (let i = 0; i < t.length; i++) {
                let heroid = t[i].hero.toString()
                if (!this.heroExpData_.get(heroid)) {
                    this.heroExpData_.set(heroid, [])
                }
                this.heroExpData_.get(heroid).push(t[i])
            }
        }
        return this.heroExpData_
    }
    getHeroExpData (id: string, lv: number) {
        let d = this.heroExpData.get(id.toString())
        for (let i = 0; i < d.length; i++) {
            if (d[i].level == lv) {
                return d[i]
            }
        }
        return
    }

    // 关卡相关
    getWaveData (id: string): WAVEDATA {
        let waveData: WAVEDATA = this.getStaticValue("static_wave_data", id)
        if (!waveData) {
            waveData = this.getStaticValue("static_special_wave_data", id)
        }
        return waveData
    }

    getPveStage (id: string): WAVESTAGEDATA {
        let stageData: WAVESTAGEDATA = this.getStaticValue("static_pve_stage", id)
        if (!stageData) {
            stageData = this.getStaticValue("static_special_pve_stage", id)
        }
        if (!stageData) {
            stageData = this.getStaticValue("static_special_pve_stage_2", id)
        }
        return stageData
    }

    /**
     * 一次性获取战斗中所有的关卡数据，减少战斗中的数据获取
     * @returns 
     */
    getPveStages (sid: string): Array<WAVESTAGEDATA> {
        sid = sid.toString()
        let waveDats: Array<WAVESTAGEDATA> = [];
        let getNext = (id: string) => {
            let wd = this.getPveStage(id)
            if (wd) {
                waveDats.push(wd)
                getNext(wd.next_id.toString())
            }
        }
        getNext(sid)
        return waveDats
    }

    /**
     * 职业数据
     * @param type 
     * @returns 
     */
    getJobData (type: JOBTYPE): JOBDATA {
        let list: Array<JOBDATA> = this.getStaticValues("static_job")
        for (let i = 0; i < list.length; i++) {
            if (list[i].type == type) {
                return list[i]
            }
        }
        return undefined
    }

    /**
     * 根据heroId来获取对应的道具id
     * @param id 
     */
    getItemIdByHero (id: string): number {
        id = id.toString()
        let d: Array<PROPDATA> = this.getStaticValues("static_item")
        for (let i = 0; i < d.length; i++) {
            let t = JSON.parse(d[i].value)
            if (t && t[0] && t[0].toString() == id) {
                return parseInt(d[i].id) 
            }
        }
        return 14001
    }

    getWaveCloneData (index: number, difficulty: number): WAVEDATA {
        let mapDatas = this.getStaticValues("static_map_data") as Array<MAPDATA> 
        let mapData: MAPDATA;
        for (let i = 0; i < mapDatas.length; i++) {
            if (mapDatas[i].index == index) {
                mapData = mapDatas[i]
            }
        }
        
        let waveData: WAVEDATA;
        for (let i = 0; i < mapData.waveNormalNum + 1; i++) {
            if (i == 0 ) {
                waveData = this.getStaticValue("static_wave_data", mapData.waveNormal) as WAVEDATA
            } else {
                waveData = this.getStaticValue("static_wave_data", waveData.nextId) as WAVEDATA
            }
            if (waveData.difficulty == difficulty) {
                return waveData;
            }
        }
    }

    /**
     * 获取元素类型对应数据
     * @param index 
     * @param type 
     */
    private seasonData: Map<number, Array<SEASONDATA>> = new Map();
    initElementStage () {
        let defs = this.getStaticValues("static_element_stage") as Array<SEASONDATA>;
        for (let i = 0; i < defs.length; i++) {
            let v = defs[i];
            if (!this.seasonData.get(v.element)) {
                this.seasonData.set(v.element, [])
            }
            this.seasonData.get(v.element).push(v)
        }
        this.seasonData.forEach((value , key) =>{
            sortByKey(value, "element_lv")
        });
    }
    getElementStage (index: number, type: SEASONTYPE): SEASONDATA {
        if (this.seasonData.size == 0) {
            this.initElementStage()
        }
        return this.seasonData.get(type)[index-1];
    }

    /**
     * 获取符文变态版
     * @param data 
     */
    getSuperRuneData (data: RUNEDATA): RUNEDATA {
        let id = data.id.toString()
        let superData: RUNEDATA
        let runeDatas = this.getRuneSuper()
        for (let i = 0; i < runeDatas.length; i++) {
            if (runeDatas[i].old_rune_id.toString() == id) {
                superData = runeDatas[i]
                break
            }
        }
        if (!superData) { return data }

        data.super = true
        data.superData = superData
        data.img = superData.img
        data.name = superData.name
        data.des = superData.des
        data.des2 = superData.des2
        data.cdTime = superData.cdTime

        return data
    }


    /************************ 多重 ************************/

    getRune (type?: number): Array<RUNEDATA> {
        let ntype = type ? type : GameManager.runeType
        if (ntype == 1) {
            return this.getStaticValues("static_rune")
        } else {
            return this.getStaticValues("static_rune2")
        }
    }

    getRuneById (id: string, type?: number): RUNEDATA {
        let ntype = type ? type : GameManager.runeType
        if (ntype == 1) {
            return this.getStaticValue("static_rune", id)
        } else {
            return this.getStaticValue("static_rune2", id)
        }
    }

    getRuneSuper (type?: number): Array<RUNEDATA> {
        let ntype = type ? type : GameManager.runeType
        if (ntype == 1) {
            return this.getStaticValues("static_rune_super")
        } else {
            return this.getStaticValues("static_rune_super2")
        }
    }

    getRuneSuperById (id: string, type?: number): RUNEDATA {
        let ntype = type ? type : GameManager.runeType
        if (ntype == 1) {
            return this.getStaticValue("static_rune_super", id)
        } else {
            return this.getStaticValue("static_rune_super2", id)
        }
    }

    getRuneSuperSamsaraById (id: string, type?: number): SUPERRUNEDATA {
        let ntype = type ? type : GameManager.runeType
        if (ntype == 1) {
            return this.getStaticValue("static_special_wave_samsara", id)
        } else {
            return this.getStaticValue("static_special_wave_samsara2", id)
        }
    }

}

export default StaticManager.getInstance()