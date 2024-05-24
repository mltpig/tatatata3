import EventDispatcher from "../../framework/utils/EventDispatcher";
import LocalDataManager from "../../framework/utils/LocalDataManager";
import Contants from "../other/Contants";
import { ACHIEVETYPE, COMMONLOGICTYPE, DAILYTYPE, ITEMTYPE, REDDOTTYPE } from "../other/Enum";
import Events from "../other/Events";
import GameUtils from "../other/GameUtils";
import { checkArrayIn, DS, ES, mergeArray, random1, randString } from "../other/Global";
import StaticManager from "./StaticManager";
import VER from "./Ver";

/**************************** 初始化数据 ****************************/

let playerInitData: PLAYERDATA = {
    uid: "",
    name: "玩家",
    gold: ES(0),
}
let signInitData: SIGNLOCALDATA = {
    day: ES(0),
    date: ES(0),
    get: false,
}
let mapInitData: Array<MAPLOCALDATA> = []
let bookInitData: Array<BOOKLOCALDATA> = [
    { id: "10001", type: 1},
    { id: "10002", type: 1},
    { id: "10003", type: 1},
    { id: "10004", type: 1},
]
let heroInitData: Array<HEROLOCALDATA> = [
    { id: "10001", patch: ES(0), level: ES(0), exp: ES(0) },
    { id: "10002", patch: ES(0), level: ES(0), exp: ES(0) },
    { id: "10003", patch: ES(0), level: ES(0), exp: ES(0) },
    { id: "10004", patch: ES(0), level: ES(0), exp: ES(0) },
]
let dailyInitData: Array<DAILYLOCALDATA> = []
let achieveInitData: Array<ACHIEVELOCALDATA> = []
let codeInitData: Array<string> = []
let adInitData: ADLOCALDATA = {
    date: ES(0),
    adReward: [],
    random: ES(random1(0,100))
}
let fightInitBattle = []
let initSoul: string = ES(0)

/**
 * 本地记录
 * 玩家数据
 * 数据需要实时刷新和记录
 */
class PlayerManager {
    private static instance_: PlayerManager
    static getInstance (): PlayerManager {
        if (!this.instance_) {
            this.instance_ = new PlayerManager()
        }
        return PlayerManager.instance_
    }

    // uid
    private uid_: string;
    set uid (uid: string) {
        this.uid_ = uid
    }
    get uid (): string {
        return this.uid_
    }
    
    // 玩家数据
    private _playerData: PLAYERDATA;
    // 签到数据
    private _signData: SIGNLOCALDATA;
    // 关卡数据
    private _mapData: Array<MAPLOCALDATA>;
    // 图鉴数组
    private _bookData: Array<BOOKLOCALDATA>;
    // 英雄数据
    private _heroData: Array<HEROLOCALDATA>;
    // 日常数据
    private _dailyData: Array<DAILYLOCALDATA>;
    // 成就数据
    private _achieveData: Array<ACHIEVELOCALDATA>;
    // 兑换码
    private _codeData: Array<string>;
    // 灵魂数
    private _soulNumber: string;
    // 特效
    private _isForbidNumber: boolean = false;
    private _isForbidEffect: boolean = false;
    private _isForbidFast: boolean = false;
    private _isForbidEnemy: boolean = false;
    // 布阵
    private _fightBattle: Array<BATTLELOCALDATA>;
    // 广告
    private _adData: ADLOCALDATA;
    // 关卡广告次数限制
    private _adLimit: number;

    // 服务器时间
    public _serverTime: number = 0;
    // 红点
    private _reddotData: Map<number, boolean> = new Map();

    // 审核版本(ios)
    public review: boolean = false;

    // 离线版本
    private _outLine: string = randString(8)
    private _outLineValue: string = ""
    public initOutLine () { this._outLineValue = this._outLine }
    public get isOutLine () { return this._outLine == this._outLineValue }

    // 服务器版本
    public serverVer: string;
    public isNewVer: boolean = true;
    
    /**
     * 测试版本到期时间
     * 2021-09-08 12:00:00
     */
    // public testTime: number = 1631073600000; 
    
    /**
     * 初始化
     */
    init () {
        let select = (a, b)=> { if (a != undefined) { return a } else { return b } }
        this._playerData = select(this.getLocalStorage(VER.LOCALSTORAGEKEY.playData), playerInitData)  
        this._playerData.uid = this.uid_
        this._signData = select(this.getLocalStorage(VER.LOCALSTORAGEKEY.signData), signInitData)
        this._mapData = select(this.getLocalStorage(VER.LOCALSTORAGEKEY.mapData), mapInitData)
        this._bookData = select(this.getLocalStorage(VER.LOCALSTORAGEKEY.bookData), bookInitData)
        this._heroData = select(this.getLocalStorage(VER.LOCALSTORAGEKEY.heroData), heroInitData)
        this._dailyData = select(this.getLocalStorage(VER.LOCALSTORAGEKEY.dailyData), dailyInitData)
        this._achieveData = select(this.getLocalStorage(VER.LOCALSTORAGEKEY.achieveData), achieveInitData)
        this._codeData = select(this.getLocalStorage(VER.LOCALSTORAGEKEY.codeData), codeInitData)
        this._soulNumber = select(this.getLocalStorage(VER.LOCALSTORAGEKEY.soulNumber), initSoul)
        this._adData = select(this.getLocalStorage(VER.LOCALSTORAGEKEY.adData), adInitData)
        this._isForbidNumber = this.getShowNumber()
        this._isForbidEffect = this.getShowEffect()
        this._isForbidFast = this.getShowFast()
        this._isForbidEnemy = this.getShowEnemy()
        this._fightBattle = select(this.getLocalStorage(VER.LOCALSTORAGEKEY.fightBattle), fightInitBattle)
        this._adLimit = select(this.getLocalStorage(VER.LOCALSTORAGEKEY.adLimit), 0)
        this.refreshDaily()
        this.refreshAchieve()
        this.refreshMap()

        this.initReddotData()
        this.refreshReddotData()

        this.refreshAllLocalStorage()
    }

    /************************** get **************************/

    set serverTime (ntime: number) {
        this._serverTime = ntime
    }
    get serverTime (): number {
        return this._serverTime
    }

    get playerData () { return this._playerData }
    get signData () { return this._signData }
    get mapData () { return this._mapData }
    get bookData () { return this._bookData }
    get heroData () { return this._heroData }
    get dailyData () { return this._dailyData }
    get achieveData () { return this._achieveData }
    get codeData () { return this._codeData }
    get soulNumber () { return this._soulNumber }
    get reddotData () { return this._reddotData }
    get isForbidNumber () { return this._isForbidNumber }
    get isForbidEffect () { return this._isForbidEffect }
    get isForbidFast () { return this._isForbidFast }
    get isForbidEnemy () { return this._isForbidEnemy }
    get adData () { return this._adData }
    get fightBattle () { return this._fightBattle }
    get adLimit () { return this._adLimit }

    /************************** 获取/初始化本地数据 **************************/
    
    refreshDaily () {
        let newt: Array<DAILYLOCALDATA> = [];
        let dailyData = StaticManager.getStaticValues("static_daily_data") as Array<DAILYDATA> 
        for (let i = 0; i < dailyData.length; i++) {
            let vi = dailyData[i]
            let has: boolean = false
            for (let j = 0; j < this._dailyData.length; j++) {
                let vj = this._dailyData[j]
                if (vj.id == vi.id) {
                    has = true
                }
            }
            if (!has) {
                let d: DAILYLOCALDATA = {
                    id: vi.id,
                    type: vi.type,
                    num: ES(0),
                    get: false,
                    maxNum: ES(vi.num),
                }
                newt.push(d)
            }
        }
        this._dailyData = mergeArray(this._dailyData, newt)
        this.updateDailyData(DAILYTYPE.login, 1)
    }

    refreshAchieve () {
        let achieveData = StaticManager.getStaticValues("static_achieve_data") as Array<ACHIEVEDATA> 
        // 检测有新数据或初始化
        let t: Array<ACHIEVELOCALDATA> = [];
        let newt: Array<Array<ACHIEVEDATA>> = [];
        for (let i = 0; i < achieveData.length; i++) {
            let v = achieveData[i]
            if (!newt[v.ntype]) {
                newt[v.ntype] = []
            }
            newt[v.ntype].push(v)
        }
        // 分类记录
        for (const i in newt) {
            let has: boolean = false
            let vi = newt[i]
            for (let j = 0; j < this._achieveData.length; j++) {
                let vj = this._achieveData[j];
                if (vj.ntype == vi[0].ntype) {
                    has = true
                }
            }
            if (!has) {
                let d: ACHIEVELOCALDATA = {
                    id: vi[0].id,
                    type: vi[0].type,
                    ntype: vi[0].ntype,
                    num: ES(0),
                    get: false,
                    maxNum: ES(vi[0].num),
                    extra: vi[0].extra,
                }
                t.push(d)
            }
        }
        this._achieveData = mergeArray(this._achieveData, t)
    }

    // 刷新关卡数据
    refreshMap () {
        let newt: Array<MAPLOCALDATA> = [];

        let mapData = StaticManager.getStaticValues("static_map_data") as Array<MAPDATA> 
        let specialMapData = StaticManager.getStaticValues("static_special_map_data") as Array<MAPDATA>
        mapData = mergeArray(mapData, specialMapData)

        for (let i = 0; i < mapData.length; i++) {
            let vi = mapData[i]
            let has: boolean = false
            for (let j = 0; j < this._mapData.length; j++) {
                let vj = this._mapData[j]
                if (vj.id.toString() == vi.id.toString()) {
                    has = true
                }
            }
            if (!has) {
                let d: MAPLOCALDATA = {
                    id: vi.id,
                    waveId: vi.waveNormal.toString(),
                    wave: ES(0),
                    score: ES(0),
                    endlessId: vi.waveInfinite.toString(),
                    endlessWave: ES(0),
                    endlessScore: ES(0),
                }
                newt.push(d)
            }
        }
        this._mapData = mergeArray(this._mapData, newt)
    }

    /************************** 本地记录 **************************/

    // 清理所有
    clearLocalStorage () {
        for (const key in VER.LOCALSTORAGEKEY) {
            LocalDataManager.clear(VER.LOCALSTORAGEKEY[key])
        }
    }
    
    // 刷新本地存储
    refreshLocalStorage (key: string) {
        switch (key) {
            case VER.LOCALSTORAGEKEY.playData:
                LocalDataManager.set(key, JSON.stringify(this.playerData))
                break;
            case VER.LOCALSTORAGEKEY.signData:
                LocalDataManager.set(key, JSON.stringify(this.signData))
                break;
            case VER.LOCALSTORAGEKEY.mapData:
                LocalDataManager.set(key, JSON.stringify(this.mapData))
                break;
            case VER.LOCALSTORAGEKEY.bookData:
                LocalDataManager.set(key, JSON.stringify(this.bookData))
                break;
            case VER.LOCALSTORAGEKEY.heroData:
                LocalDataManager.set(key, JSON.stringify(this.heroData))
                break;
            case VER.LOCALSTORAGEKEY.dailyData:
                LocalDataManager.set(key, JSON.stringify(this.dailyData))
                break;
            case VER.LOCALSTORAGEKEY.achieveData:
                LocalDataManager.set(key, JSON.stringify(this.achieveData))
                break;
            case VER.LOCALSTORAGEKEY.codeData:
                LocalDataManager.set(key, JSON.stringify(this.codeData))
                break;
            case VER.LOCALSTORAGEKEY.soulNumber:
                LocalDataManager.set(key, JSON.stringify(this.soulNumber))
                break;
            case VER.LOCALSTORAGEKEY.adData:
                LocalDataManager.set(key, JSON.stringify(this.adData))
                break;
            case VER.LOCALSTORAGEKEY.showNumber:
                this.resetShowNumber(this.isForbidNumber)
                break;
            case VER.LOCALSTORAGEKEY.showEffect:
                this.resetShowEffect(this.isForbidEffect)
                break;
            case VER.LOCALSTORAGEKEY.fightGo:
                this.resetShowEffect(this.isForbidFast)
                break;
            case VER.LOCALSTORAGEKEY.fightEnemy:
                this.resetShowEnemy(this.isForbidEnemy)
                break;
            case VER.LOCALSTORAGEKEY.fightBattle:
                LocalDataManager.set(key, JSON.stringify(this.fightBattle))
                break;
            case VER.LOCALSTORAGEKEY.adLimit:
                LocalDataManager.set(key, JSON.stringify(this.adLimit))
                break;
            default:
                break;
        }
    }

    // 获取本地存储
    getLocalStorage (key: string) {
        return JSON.parse(LocalDataManager.get(key))
    }   
    
    getShowNumber (): boolean {
        let show = LocalDataManager.get(VER.LOCALSTORAGEKEY.showNumber)
        return show == 1 ? true : false
    }

    getShowEffect (): boolean {
        let show = LocalDataManager.get(VER.LOCALSTORAGEKEY.showEffect)
        return show == 1 ? true : false
    }

    getShowFast (): boolean {
        let show = LocalDataManager.get(VER.LOCALSTORAGEKEY.fightGo)
        return show == 1 ? true : false
    }

    getShowEnemy (): boolean {
        let show = LocalDataManager.get(VER.LOCALSTORAGEKEY.fightEnemy)
        return show == 1 ? true : false
    }

    // 刷新所有本地存储
    refreshAllLocalStorage () {
        LocalDataManager.set(VER.LOCALSTORAGEKEY.playData, JSON.stringify(this.playerData))
        LocalDataManager.set(VER.LOCALSTORAGEKEY.signData, JSON.stringify(this.signData))
        LocalDataManager.set(VER.LOCALSTORAGEKEY.mapData, JSON.stringify(this.mapData))
        LocalDataManager.set(VER.LOCALSTORAGEKEY.bookData, JSON.stringify(this.bookData))
        LocalDataManager.set(VER.LOCALSTORAGEKEY.heroData, JSON.stringify(this.heroData))
        LocalDataManager.set(VER.LOCALSTORAGEKEY.dailyData, JSON.stringify(this.dailyData))
        LocalDataManager.set(VER.LOCALSTORAGEKEY.achieveData, JSON.stringify(this.achieveData))
        LocalDataManager.set(VER.LOCALSTORAGEKEY.codeData, JSON.stringify(this.codeData))
        LocalDataManager.set(VER.LOCALSTORAGEKEY.soulNumber, JSON.stringify(this.soulNumber))
        LocalDataManager.set(VER.LOCALSTORAGEKEY.adData, JSON.stringify(this.adData))
        LocalDataManager.set(VER.LOCALSTORAGEKEY.adLimit, JSON.stringify(this.adLimit))

        this.resetShowNumber(this.isForbidNumber)
        this.resetShowEffect(this.isForbidEffect)
        this.resetShowFast(this.isForbidFast)
        this.resetShowEnemy(this.isForbidEnemy)
    }

    /************************** 自然天刷新 **************************/

    // 检测刷新签到数据 日常数据
    refreshNaturalDay (timer: number) {
        let date: Date = new Date(timer);
        date.setHours(0, 0, 0, 0)
        let newTime = date.getTime()

        if (newTime > DS(this._signData.date)) {
            // 1
            let day = DS(this._signData.day)
            day = day >= 7 ? 1 : (day + 1)      // 超过其他重新开始 
            
            this._signData = {
                day: ES(day),
                date: ES(newTime), 
                get: false,
            }
            // 2
            this._dailyData = []
            this.refreshDaily()
        }

        // 检测广告刷新
        if (newTime > DS(this.adData.date)) {
            this.refreshAdData({
                date: ES(newTime),
                adReward: [],
                random: ES(random1(0,100))
            })

            // 关卡广告限制
            this._adLimit = 0
        }
        
        this.refreshAllLocalStorage()
    }

    /************************** 红点 **************************/

    initReddotData () {
        for (let i = 0; i < REDDOTTYPE.length; i++) {
            this._reddotData.set(i, false)
        }
    }
    
    // 刷新红点数据
    refreshReddotData () {
        let self = this
        let getReddot = function (key: REDDOTTYPE): boolean {
            switch (key) {
                case REDDOTTYPE.sign:
                    return !self._signData.get
                case REDDOTTYPE.daily:
                    for (let i = 0; i < self._dailyData.length; i++) {
                        let v = self._dailyData[i]
                        if (!v.get && DS(v.num) >= DS(v.maxNum)) {
                            return true
                        }
                    }
                    return false
                case REDDOTTYPE.achieve:
                    for (let i = 0; i < self._achieveData.length; i++) {
                        let v1 = self._achieveData[i]
                        if (!v1.get && DS(v1.num) >= DS(v1.maxNum)) {
                            return true
                        }
                    }
                    return false
                case REDDOTTYPE.heroUp:
                    return false
                default:
                    return false
            }
        }

        this._reddotData.forEach((value, key) => {
            this._reddotData.set(key, getReddot(Number(key)))
        });
        EventDispatcher.dispatchEvent(Events.game_reddot_event)
    }

    getReddot (type: REDDOTTYPE) {
        switch (type) {
            case REDDOTTYPE.award:
                return this._reddotData.get(REDDOTTYPE.sign) || this._reddotData.get(REDDOTTYPE.daily) || this._reddotData.get(REDDOTTYPE.achieve)
            default:
                return this._reddotData.get(type)
        }
    }

    /****************************** other ******************************/
    
    changeName (name: string) {
        this._playerData.name = name
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.playData)
    }

    /****************************** 英雄图鉴 ******************************/

    getHeroData (id: string): HEROLOCALDATA {
        id = id.toString()
        for (let i = 0; i < this._heroData.length; i++) {
            let v = this._heroData[i];
            if (v.id == id) {
                return v
            }
        }
    }

    heroUp (id: string): HEROLOCALDATA {
        id = id.toString()
        let info = null
        for (let i = 0; i < this._heroData.length; i++) {
            if (this._heroData[i].id == id) {
                this._heroData[i].level = ES(DS(this._heroData[i].level) + 1)
                info = this._heroData[i]
                break
            }
        }
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.heroData)
        return info
    }

    heroExpUp (id: string): HEROLOCALDATA {
        id = id.toString()
        let info = null
        for (let i = 0; i < this._heroData.length; i++) {
            if (this._heroData[i].id == id) {
                this._heroData[i].exp = ES(DS(this._heroData[i].exp) + 1)
                info = this._heroData[i]
                break
            }
        }
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.heroData)
        return info
    }

    // 满阶英雄碎片数
    getHeroSoul () {
        let path: number = 0
        for (let i = 0; i < this._heroData.length; i++) {
            if (DS(this._heroData[i].level) >= DS(Contants.MAXSTAGE)) {
                path = path + DS(this._heroData[i].patch)
            }
        }
        return path * DS(Contants.P2S)
    }

    // 碎片转化灵魂
    heroSoul () {
        let num: number = this.getHeroSoul()
        this._soulNumber = ES(DS(this._soulNumber) + num)

        for (let i = 0; i < this._heroData.length; i++) {
            if (DS(this._heroData[i].level) >= DS(Contants.MAXSTAGE)) {
                this._heroData[i].patch = ES(0)
            }
        }
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.heroData)
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.soulNumber)
    }

    heroSoul2Path (list: Map<string, number>) {
        let self = this
        list.forEach((value, key) => {
            self.addPatch(key, value)
            self._soulNumber = ES(DS(self._soulNumber) - value * DS(Contants.S2P))
        });
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.heroData)
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.soulNumber)
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.bookData)
    }

    /****************************** 关卡 ******************************/
    mapCommand (data: MAPLOCALDATA) {
        for (let i = 0; i < this._mapData.length; i++) {
            if (this._mapData[i].id == data.id) {
                this._mapData[i] = data
                break
            }
        }
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.mapData)
    }
    /****************************** 签到 ******************************/
    signCommand (day: number) {
        this._signData = {
            date: this._signData.date,
            day: this._signData.day,
            get: true,
        }
        
        // 奖励获取
        let signDatas = StaticManager.getStaticValues("static_sign_data") as Array<SIGNDATA>
        let props = JSON.parse(signDatas[day].prop) 
        this.addProp(props)
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.signData)
        this.refreshReddotData()
    }

    /****************************** 日常 ******************************/

    // 更新日常状态
    updateDailyData (type: DAILYTYPE, num: number) {
        let index: number = 0
        for (let i = 0; i < this._dailyData.length; i++) {
            let v = this._dailyData[i]
            if (v.type == type && DS(v.num) < DS(v.maxNum)) {
                this._dailyData[i].num = ES(DS(this._dailyData[i].num) + num)
            }
            if (DS(this._dailyData[i].num) >= DS(this._dailyData[i].maxNum)) {
                index = index + 1
            }
        }

        for (let i = 0; i < this._dailyData.length; i++) {
            if (this._dailyData[i].type == DAILYTYPE.all) {
                this._dailyData[i].num = ES(index)
                break
            }
        }
    }

    dailyCommand (id: string) {
        for (let i = 0; i < this._dailyData.length; i++) {
            if (this._dailyData[i].id == id) {
                this._dailyData[i].get = true
                break
            }
        }
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.dailyData)
        this.refreshReddotData()
    }

    /****************************** 成就 ******************************/

    // 更新成就状态
    updateAchieveData (type: ACHIEVETYPE, num: number) {
        for (let i = 0; i < this._achieveData.length; i++) {
            if (this._achieveData[i].type == type) {
                this._achieveData[i].num = ES(DS(this._achieveData[i].num) + num)
            }
        }
    }

    updateAchieveData2 (type: ACHIEVETYPE, num: number) {
        for (let i = 0; i < this._achieveData.length; i++) {
            if (this._achieveData[i].type == type) {
                if (num > DS(this._achieveData[i].num)) {
                    this._achieveData[i].num = ES(num)
                }
            }
        }
    }

    // 关卡难度
    updateAchieveData3 (type: ACHIEVETYPE, num: number, mapId: string) {
        for (let i = 0; i < this._achieveData.length; i++) {
            let map = JSON.parse(this._achieveData[i].extra)[0]
            if (map == mapId) {
                if (num > DS(this._achieveData[i].num)) {
                    this._achieveData[i].num = ES(num)
                }
            }
        }
    }
    
    achieveCommand (id: string): ACHIEVELOCALDATA {
        let data: ACHIEVELOCALDATA;
        for (let i = 0; i < this._achieveData.length; i++) {
            if (this._achieveData[i].id == id) {
                let v = this._achieveData[i]
                let achieveData = StaticManager.getStaticValue("static_achieve_data", id) as ACHIEVEDATA
                if (Number(achieveData.nextId) == 0) {
                    this._achieveData[i] = {
                        id: v.id,
                        type: v.type,
                        ntype: v.ntype,
                        num: v.num,
                        maxNum: v.maxNum,
                        get: true,
                        extra: v.extra,
                    }
                } else {
                    let nextData = StaticManager.getStaticValue("static_achieve_data", achieveData.nextId) as ACHIEVEDATA
                    this._achieveData[i] = {
                        id: nextData.id.toString(),
                        type: v.type,
                        ntype: v.ntype,
                        num: v.num,
                        maxNum: ES(nextData.num),
                        get: false,
                        extra: v.extra,
                    }
                }

                data = this._achieveData[i]
                break
            }
        }
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.achieveData)
        this.refreshReddotData()
        return data
    }

    // 任务相关性刷新
    updateTaskState () {
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.dailyData)
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.achieveData)
        this.refreshReddotData()
    }

    /****************************** 兑换码 ******************************/

    // 检测是否兑换
    exchangeCode (code: string): boolean {
        if (checkArrayIn(this._codeData, code)) {
            return true
        }
        return false
    }

    // 已兑换
    addExchangeCode (code: string) {
        this._codeData.push(code)
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.codeData)
    }

    /****************************** 关卡广告限制 ******************************/
    addAdLimit () {
        this._adLimit = this._adLimit + 1
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.adLimit)
    }
    
    /****************************** 通用奖励获取 / 道具消耗 ******************************/

    // 获取道具 
    // return 整合后的不含宝箱的数据
    addProp (prop: Array<AWARDDATA>, show: boolean = true): Array<AWARDDATA> {
        let newProps: Array<AWARDDATA> = [];        // 整合道具
        let nowProps: Array<AWARDDATA> = [];        
        let boxProps: Array<Array<AWARDDATA>> = []; // 宝箱集合
        for (let i = 0; i < prop.length; i++) {
            let v = prop[i];

            switch (v.type) {
                case ITEMTYPE.gold:
                    this.addGold(v.num)
                    nowProps.push(v)
                    break;
                case ITEMTYPE.patch:
                    let d = StaticManager.getStaticValue("static_item", v.bid.toString()) as PROPDATA
                    let id: string = JSON.parse(d.value)[0].toString()
                    this.addPatch(id, v.num)
                    nowProps.push(v)
                    break;
                case ITEMTYPE.box:
                    // 多个宝箱
                    let t: Array<Array<AWARDDATA>> = this.addBox(v.bid.toString(), v.num)
                    boxProps = mergeArray(boxProps, t)
                    for (let i = 0; i < t.length; i++) {
                        nowProps = mergeArray(nowProps, t[i])
                    }
                    break;
                default:
                    break;
            }
        }

        this.refreshAllLocalStorage()

        // 整合后的宝箱数据
        for (let i = 0; i < nowProps.length; i++) {
            let index: number = -1
            for (let j = 0; j < newProps.length; j++) {
                if (newProps[j].bid == nowProps[i].bid) {
                    index = j
                }
            }
            if (index == -1) {
                newProps.push(nowProps[i])
            } else {
                newProps[index].num = newProps[index].num + nowProps[i].num
            }
        }
        
        // 奖励飘出
        if (show) {
            GameUtils.flyAward(newProps)
        }

        return newProps
    }
    
    // 消耗道具
    costProp (prop: Array<AWARDDATA>) {
        for (let i = 0; i < prop.length; i++) {
            let v = prop[i];

            switch (v.type) {
                case ITEMTYPE.gold:
                    this.addGold(-v.num)
                    break;
                case ITEMTYPE.patch:
                    let d = StaticManager.getStaticValue("static_item", v.bid.toString()) as PROPDATA
                    let id: string = JSON.parse(d.value)[0].toString()
                    this.addPatch(id, -v.num)
                    break;
                case ITEMTYPE.box:
                    // 不会消耗宝箱
                    break;
                default:
                    break;
            }
        }

        this.refreshAllLocalStorage()
    }

    // 添加金币
    addGold (num: number) {
        this._playerData.gold = ES(DS(this._playerData.gold) + num)
        EventDispatcher.dispatchEvent(Events.game_gold_change_event)
    }

    // 添加碎片
    addPatch (id: string, num: number) {
        let has: boolean = false
        for (let i = 0; i < this._heroData.length; i++) {
            if (this._heroData[i].id == id) {
                has = true
                this._heroData[i].patch = ES(DS(this._heroData[i].patch) + num)
            }
        }
        
        if (!has) {
            this._heroData.push({
                id: id,
                patch: ES(num),
                level: ES(0),
                exp: ES(0),
            })
            this._bookData.push({
              id: id,
              type: 1,
            })
            GameUtils.addHero(id)
        }
    }
    
    addBox (id: string, num: number) { 
        EventDispatcher.dispatchEvent(Events.game_logic_event, {
            type: COMMONLOGICTYPE.box
        })

        let prop: PROPDATA = StaticManager.getStaticValue("static_item", id)
        // 含宝箱
        let award: Array<Array<AWARDDATA>> = [];
        for (let i = 0; i < num; i++) {
            let d = JSON.parse(prop.value)
            for (let j = 0; j < d.length; j++) {
                let t = StaticManager.getBoxRandData(id, d[j].type, d[j].num)
                award.push(t)
            }
        }

        // 无宝箱
        let lastAward: Array<Array<AWARDDATA>> = [];
        for (let m = 0; m < award.length; m++) {
            let t = this.addProp(award[m], false)
            lastAward.push(t)
        }
        return lastAward
    }

    // 获取道具数量
    getAwardNum (prop: AWARDDATA): number {
        switch (prop.type) {
            case ITEMTYPE.gold:
                return DS(this._playerData.gold)
            case ITEMTYPE.patch:
                let d = StaticManager.getStaticValue("static_item", prop.bid.toString()) as PROPDATA
                let id: string = JSON.parse(d.value)[0].toString()
                for (let i = 0; i < this._heroData.length; i++) {
                    if (this._heroData[i].id.toString() == id) {
                        return DS(this._heroData[i].patch)
                    }
                }
            default:
                break
        }
        return 0
    }

    /****************************** 设置 ******************************/

    resetShowNumber (show: boolean) {
        let num = show ? 1 : 0
        LocalDataManager.set(VER.LOCALSTORAGEKEY.showNumber, num)
        this._isForbidNumber = show
    }
    resetShowEffect (show: boolean) {
        let num = show ? 1 : 0
        LocalDataManager.set(VER.LOCALSTORAGEKEY.showEffect, num)
        this._isForbidEffect = show
    }
    resetShowFast (show: boolean) {
        let num = show ? 1 : 0
        LocalDataManager.set(VER.LOCALSTORAGEKEY.fightGo, num)
        this._isForbidFast = show
    }
    resetShowEnemy (show: boolean) {
        let num = show ? 1 : 0
        LocalDataManager.set(VER.LOCALSTORAGEKEY.fightEnemy, num)
        this._isForbidEnemy = show
    }

    /****************************** 广告 ******************************/
    
    refreshAdData (data: ADLOCALDATA) {
        this._adData = data
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.adData)
    }

    /************************** 布阵 **************************/
    refreshFightBattle (id: string, battle: Array<BATTLEHEROLOCALDATA>) {
        id = id.toString()
        let has: boolean = false
        for (let i = 0; i < this._fightBattle.length; i++) {
            if (this._fightBattle[i].id == id) {
                this._fightBattle[i].battle = battle
                has = true
                break;
            }
        }
        if (!has) {
            this._fightBattle.push({
                id: id,
                battle: battle,
            })   
        }
        this.refreshLocalStorage(VER.LOCALSTORAGEKEY.fightBattle)
    }
    
    getFightBattle (id: string): Array<BATTLEHEROLOCALDATA> {
        id = id.toString()
        for (let i = 0; i < this._fightBattle.length; i++) {
            if (this._fightBattle[i].id == id) {
                return this._fightBattle[i].battle
            }
        }
        return [];
    }
    
    /************************** 获取克隆模式关卡 **************************/

    getCloneModel () {
        const num = 6
        let date: Date = new Date(this.serverTime);
        let day: number = date.getDate()
        let index = day % num + 1
        return index
    }

    /************************** 获取变态符文模式关卡数据 **************************/

    getSuperTime (): string {
        let date: Date = new Date(this.serverTime);
        let mon: number = date.getMonth()
        let day: number = date.getDate()
        let last: number = mon * 31 + day
        return last.toString()
    }
    
    /************************** 暂离数据 **************************/

    setFightLeave (data: FIGHTBACKDATA) {
        LocalDataManager.set(VER.LOCALSTORAGEKEY.fightBack, JSON.stringify(data))
    }

    getFightLeave (): FIGHTBACKDATA {
        let data: FIGHTBACKDATA = JSON.parse(LocalDataManager.get(VER.LOCALSTORAGEKEY.fightBack))
        return data
    }

    clearFightLeave () {
        LocalDataManager.clear(VER.LOCALSTORAGEKEY.fightBack)
    }

}

export default PlayerManager.getInstance();