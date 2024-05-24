import CCAnimation from "../../framework/creator/CCAnimation"
import DisUtils from "../../framework/utils/DisUtils"
import EventDispatcher from "../../framework/utils/EventDispatcher"
import HeroManager from "../manager/HeroManager"
import LayerManager from "../manager/LayerManager"
import PlayerManager from "../manager/PlayerManager"
import StaticManager from "../manager/StaticManager"
import PveScene from "../module/pve/PveScene"
import Contants from "../other/Contants"
import { REFRESHINFOTYPE } from "../other/Enum"
import Events from "../other/Events"
import { CAMPTYPE, FLYTYPE, JOBTYPE, MONSTERTYPE, NODEPOOLTYPE, PVESTATE, RUNESELECTTYPE, RUNETYPE, SCENETYPE, SEASONTYPE, SPECIALTYPE, STATETYPE } from "../other/FightEnum"
import GameUtils from "../other/GameUtils"
import { clone, DS, ES, mergeArray, random2 } from "../other/Global"
import { PATHS } from "../other/Paths"
import { TSCENE } from "../other/Tool"
import HeroActor from "./hero/HeroActor"
import { stateBase } from "./states/StateBase"

interface RUNECDDATA {
    max: number,
    progress: number,
}

/**
 * 战斗的一些基础逻辑处理
 */
class FightManager {
    // 备注： 必须private 否则子类不会创建新的
    private static instance_: FightManager
    static getInstance (): FightManager {
        if (!this.instance_) {
            this.instance_ = new FightManager()
        }
        return FightManager.instance_
    }

    // 预制体(外部加载处理)
    private prefabs: Map<string, cc.Prefab> = new Map();
    // 图集
    private spriteAtlas: Map<string, cc.SpriteAtlas> = new Map();

    //pvescene
    public pveScene: PveScene;
    // 地图节点
    public tiledNode: cc.Node;
    // 英雄已上阵列表
    private battleList: Array<BATTLEINFO>;
    // 唯一id
    public uniqueId_: number;
    get uniqueId (): number {
        this.uniqueId_ ++
        return this.uniqueId_
    }
    // 回归
    public fightBack: boolean;
    // 上阵限制
    public maxUp: string;
    // 类型
    public pveType: SCENETYPE;
    // 名称
    public pveName: string;
    // 地图id
    public mapId: string;
    // 关卡id
    public waveId: string;
    // 自定义
    public customData: any;
    // 关卡数据
    public stageDatas: Array<WAVESTAGEDATA>;
    // 时间
    public timer: string;
    // 波次倒计时
    public countTime: string;
    // 最大怪物数
    public maxMonster: string;   
    // 延缓数 
    public maxSlowTime: string;
    public slowTime: string;
    // 当前怪物数
    public curMonster: string;
    // 怪物数超出上限
    public upMonster: boolean;
    // 波次
    public curWave: string;
    // 当前波次描述
    public curWaveDes: string;
    // 战斗积分
    public curScore: string;
    // 当前随机事件数
    public curRandom: string;
    // 当前机械数量
    public curMachine: string;
    // 当前恶魔蛋数量
    public curDevil: string;
    // 暂停
    isPause: boolean = false;
    // 胜利失败
    public pveWin: string;
    public pveLose: string;
    public isWin: string;
    public forceEnd: boolean;
    // boss
    public isBoss: boolean;
    // 关卡掉落奖励
    public awards: Array<AWARDDATA>;
    // 对象池
    public nodePools: Array<cc.NodePool>;
    // 游戏速度
    public speed: string;
    // 符文刷新次数
    public runeRefresh: string;
    public runeStart: boolean;
    // 超级加速
    public superFast: boolean;
    // 当前游戏速度
    public gameSpeed: string;
    // 飘字次数
    public flyNumber: number;
    // 元素化状态开启
    public seasonOpen: boolean;
    // 元素化cd
    public seasonCd: string;
    // 元素化怪物buff
    public seasonMonsterBuffs: Array<Array<string>>;

    // 当前帧
    public FRAME: number;
    public SPEED: number;

    // 英雄伤害记录
    public heroHurt: Map<string, number>;
    public allHurt: number;

    // 符文装备
    public equips: Array<RUNEDATA>;
    // 已装备符文
    public equipProp: Map<string, Map<number, RUNEDATA>>;
    // 曾今获得的符文装备
    public gainEquips: Array<string>;
    // 神器
    public artifacts: Array<RUNEDATA>;
    // 符文装备cd表
    public cdList: Map<string, RUNECDDATA> = new Map();

    // 职业
    public jobMax: string;      // 可转职最大数
    public jobNum: string;      // 限制等级
    public curJob: string;      // 可用转职点
    public jobLimit: boolean;   // 可获得点数 ？
    public jobList: Array<number>;      // 已选择职业

    /****************** 性能优化部分(空间换时间) ******************/
    cachePoint: Map<number, cc.Vec2> = new Map();
    cacheMonster: Map<string, MONSTERINFO> = new Map();
    cacheMap: Map<string, MAPINFO> = new Map();

    // 在init之前
    initData (data: SCENEDATA) {
        this.pveType = data.type
        this.pveName = data.name
        this.mapId = data.mapId
        this.waveId = data.waveId
        this.customData = data.customData
        this.fightBack = (this.customData && this.customData.fightBack == true) ? true : false
    }

    /**
     * 初始化数据 
     */
    init (pveScene: PveScene, tiledNode: cc.Node) {
        this.pveScene = pveScene
        this.tiledNode = tiledNode
        this.battleList = []
        this.uniqueId_ = 0
        this.maxUp = ES(4)
        this.stageDatas = []
        this.timer = ES(0)
        this.countTime = ES(0)
        this.maxMonster = ES(0)
        this.maxSlowTime = ES(5)
        this.slowTime = ES(5)
        this.curMonster = ES(0)
        this.upMonster = false
        this.curWaveDes = ""
        this.curWave = ES(0)
        this.curScore = ES(0)
        this.curRandom = ES(0)
        this.curMachine = ES(0)
        this.curDevil = ES(0)
        this.pveWin = ES(random2(0, 100000))
        this.pveLose = ES(random2(200000, 300000))
        this.isWin = ES(0)
        this.forceEnd = false
        this.isBoss = false
        this.heroHurt = new Map()
        this.allHurt = 0
        this.equips = []
        this.gainEquips = []
        this.artifacts = []
        this.cdList.clear()
        this.speed = ES(1)
        this.runeRefresh = ES(0);
        this.runeStart = true;
        this.superFast = false;
        this.gameSpeed = ES(1);
        this.flyNumber = 0;
        this.seasonOpen = false;
        this.seasonCd = ES(0);
        this.jobMax = ES(0)
        this.jobNum = ES(0)
        this.curJob = ES(0)
        this.jobLimit = false
        this.jobList = []
        this.seasonMonsterBuffs = [];
        
        this.FRAME = 2;
        this.SPEED = 1;

        // 测试
        // let list: Array<RUNEDATA> = StaticManager.getRune()
        // for (let i = 0; i < list.length; i++) {
        //     if (list[i].type == RUNETYPE.rune) {
        //         this.equips.push(list[i])
        //     }
        // }
        
        for (let i = 0; i < this.equips.length; i++) {
            this.equips[i].uid = this.uniqueId.toString()
        }

        this.equipProp = new Map();
        this.nodePools = []
        
        for (let i = 0; i < NODEPOOLTYPE.length; i++) {
            let pool = new cc.NodePool();
            this.nodePools.push(pool)
        }
        
        this.initModel()
    }

    initModel () {

    }
    
    /****************************** update ******************************/

    checkDown () {
        let heros = this.pveScene.heros
        if (heros.length <= 0) {
            GameUtils.messageHint("至少上阵一位角色")
            return true
        }
        return false
    }
    
    checkUp () {
        let heros = this.pveScene.heros
        if (heros.length >= DS(this.maxUp)) {
            GameUtils.messageHint("上阵角色达到限制")
            return true
        }
        return false
    }

    // 战斗开始
    startFight () {
        let list: Array<BATTLEHEROLOCALDATA> = []
        let heros = this.pveScene.heros
        for (let i = 0; i < heros.length; i++) {
            heros[i].isFight = true
            heros[i].showRange(false)
            this.equipProp.set(heros[i].uid, new Map())
            this.heroHurt.set(heros[i].uid, 0)

            list.push({
                index: heros[i].towerIndex,
                pos: heros[i].startPos,
                heroId: heros[i].pid,
            })
        }
        this.jobMax = ES(heros.length)

        this.startFightModel(list)

        PlayerManager.refreshFightBattle(this.mapId, list)
    }

    startFightModel (list: Array<BATTLEHEROLOCALDATA>) { }

    update2 (dt: number) {
        this.timer = ES(DS(this.timer) + dt)                // 时间
        this.countTime = ES(DS(this.countTime) - dt)        // 倒计时
        
        if (this.upMonster) {
            this.slowTime = ES(DS(this.slowTime) - dt)
        } else {
            this.slowTime = this.maxSlowTime
        }

        let cd = DS(this.seasonCd)
        if (cd > 0) { this.seasonCd = ES(cd - dt) }

        this.updateCdList(dt)
    }

    setTimeScale (scale: number) {
        this.gameSpeed = ES(scale)
        this.SPEED = scale
        cc.director.getScheduler().setTimeScale(scale)
    }

    updateMonsterNum () {
        let num: number = 0
        let monsters = this.getMonsters()
        for (let i = 0; i < monsters.length; i++) {
            if (!monsters[i].season) {
                num = num + 1
            }
        }
        
        this.curMonster = ES(num)
        this.upMonster = num >= DS(this.maxMonster)
        this.superFast = num == 0
        
        // 超级冲冲冲模式
        let scale = cc.director.getScheduler().getTimeScale()
        if (PlayerManager.isForbidFast && this.superFast) {
            if (scale != 5) { 
                this.SPEED = 5
                cc.director.getScheduler().setTimeScale(this.SPEED)   
            }
        } else {
            if (scale != DS(this.gameSpeed)) { 
                this.setTimeScale(DS(this.gameSpeed))
            }
        }
    }

    get pveState (): PVESTATE {
        return this.pveScene.pveState
    }

    // 装备符文
    changeEquip (selectEquip: SELECTHERODATA) {
        let hero = this.getHeroByuid(selectEquip.heroId)
        selectEquip.selectData.heroUid = hero.uid
        selectEquip.selectData.index = selectEquip.index
        this.equipProp.get(selectEquip.heroId).set(selectEquip.index, selectEquip.selectData)

        let buffs = JSON.parse(selectEquip.selectData.value)
        if (selectEquip.selectData.super) {
            // 变态强化
            let btBuffs = JSON.parse(selectEquip.selectData.superData.value)
            this.addStrengthen(selectEquip.heroId, btBuffs)
        } else {
            this.addStrengthen(selectEquip.heroId, buffs)
        }

        for (let i = 0; i < this.equips.length; i++) {
            if (this.equips[i].uid == selectEquip.selectData.uid) {
                this.equips.splice(i,1)
                break
            }
        }

        // 检测符文大师
        if (hero.jobData && hero.jobData.type == JOBTYPE.rune) {
            let atHero = this.getHeros()[0]
            this.addStrengthen(atHero.uid, buffs)
        }

        EventDispatcher.dispatchEvent(Events.game_rune_change_event)
    }

    //机械化
    machineEquip (uid: string, index: number) {
        let data: RUNEDATA = this.equipProp.get(uid).get(index)
        data.machine = true

        let buffs = JSON.parse(data.value2)
        // 变态版本
        if (data.super) {
            buffs = JSON.parse(data.superData.value2)
        }

        this.addStrengthen(uid, buffs)

        EventDispatcher.dispatchEvent(Events.fight_hero_change_event, {
            id: uid,
            type: REFRESHINFOTYPE.skill
        })
    }

    addEquip (equip: RUNEDATA) {
        if (equip.type == RUNETYPE.rune) {
            equip = this.dealSuperSpecial(equip)

            this.equips.unshift(equip)
            this.gainEquips.push(equip.id)
    
            EventDispatcher.dispatchEvent(Events.game_rune_change_event)
        } else {
            // 神器
            let buffs = JSON.parse(equip.value)
            for (let i = 0; i < this.pveScene.heros.length; i++) {
                let hero = this.pveScene.heros[i];
                this.addStrengthen(hero.uid, buffs)
            }

            let has: boolean = false
            for (let i = 0; i < this.artifacts.length; i++) {
                if (this.artifacts[i].id == equip.id) {
                    this.artifacts[i].num = this.artifacts[i].num + 1
                    has = true
                    break
                }
            }
            if (!has) { 
                equip.num = 1
                this.artifacts.push(equip)
            }
        }
    }
    
    // 添加buff
    addStrengthen (id: string, buffs: Array<string>) {
        let hero = this.getHeroByuid(id)
        hero._buffs.addBuffs(buffs, hero._realValue.realFight)
    }

    // 清除buff
    clearStrengthen (id: string, buffs: Array<string>) {
        let hero = this.getHeroByuid(id)
        hero._buffs.delBuffs(buffs)
    }

    // 符文装满了？
    isRuneFull () {
        let can = true
        this.equipProp.forEach((value, key) => {
            if (value.size < 4) { can = false }
        });
        return can
    }

    addRecord (id, hurt) {
        let record = this.heroHurt.get(id)
        record = record + hurt
        this.heroHurt.set(id, record)

        this.allHurt = this.allHurt + hurt
    }

    updateScore () {
        this.curScore = ES(DS(this.curScore) + 10)
    }

    // 符文
    addRandom (m: number = 1) {
        let num = DS(this.curRandom) + m
        this.curRandom =ES(num)
    }
    costRandom () {
        this.curRandom = ES(DS(this.curRandom) - 1)
    }
    getRandom () {
        return DS(this.curRandom)
    }
    canRandom () {
        return DS(this.curRandom) > 0 
    }

    // 选择符文
    selectRune () {
        if (!this.canRandom()) { return }
        this.pauseGame()
        
        if (this.runeStart) {
            LayerManager.pop({
                script: "RuneSelectLayer",
                prefab: PATHS.fight + "/runeSelectLayer",
                opacity: 180,
                data: RUNESELECTTYPE.single,
            })
        } else {
            LayerManager.pop({
                script: "RandomLayer",
                prefab: PATHS.fight + "/randomLayer",
                opacity: 180,
            })
        }
    }

    // 选择钢铁符文
    selectMachine () {
        if (this.canMachine()) {
            this.pauseGame()
            LayerManager.pop({
                script: "MachineLayer",
                prefab: PATHS.fight + "/machineLayer",
                opacity: 180,
            })
        } else {
            GameUtils.messageHint("英雄未机械化符文超过4个方可开启")
        }
    }
    
    // 机械
    addMachine () {
        let num = DS(this.curMachine) + 1
        this.curMachine =ES(num)
    }
    costMachine () {
        this.curMachine = ES(DS(this.curMachine) - 1)
    }
    getMachine () {
        return DS(this.curMachine)
    }
    canMachineShow () {
        return DS(this.curMachine) > 0 
    }
    // 已装备未机械化符文超过4个 且存在机械蛋
    canMachine () {
        let num: number = 0
        this.equipProp.forEach((value, key) => {
            value.forEach((value1, key1) => {
                if (!value1.machine) { num = num + 1 }
            })
        });
        if (num <= 4) { return false }
        return DS(this.curMachine) > 0 
    }

    // 恶魔
    addDevil () {
        let num = DS(this.curDevil) + 1
        this.curDevil =ES(num)
    }
    costDevil () {
        this.curDevil = ES(DS(this.curDevil) - 1)
    }
    getDevil () {
        return DS(this.curDevil)
    }
    canDevil () {
        return DS(this.curDevil) > 0 
    }
    // 非元素怪物造成伤害
    killAll () {
        let monsters = this.getMonsters()
        for (let i = 0; i < monsters.length; i++) {
            if (!monsters[i].season) {
                monsters[i].forceSeason()
            }
        }
    }

    playEffect (clip: CCAnimation, path: string, res: string, wrapMode?: cc.WrapMode) {
        if (PlayerManager.isForbidEffect) { return }    // 不显示特效
        clip.play(path, res, wrapMode)
    }

    /****************************** 资源加载 ******************************/

    // 加载
    loadPrefabs (callback: Function) {
        let self = this
        let index = 0
        let fightList = [ "skillDrag", ]
        
        let getSpriteAtlas = function () {
            cc.resources.load("plist/" + fightList[index], cc.SpriteAtlas, (err, atlas) => {
                self.spriteAtlas.set(fightList[index], <cc.SpriteAtlas>atlas)
                index = index + 1

                if (index >= fightList.length) {
                    callback()
                } else {
                    getSpriteAtlas()
                }
            });
        }

        cc.resources.loadDir(PATHS.fight, function (err, assets) {
            for (const key in assets) {
                const element = <cc.Prefab>assets[key];
                self.prefabs.set(element.name, element)
            }
            getSpriteAtlas()
        });
    }

    // 释放 reelease
    releasePrefabs () {
        this.prefabs.forEach((value , key) =>{
            cc.resources.release("prefab/fight/" + key, cc.Prefab)
        });
        this.spriteAtlas.forEach((value , key) =>{
            cc.resources.release("plist/" + key, cc.SpriteAtlas)
        });
        this.prefabs.clear()
        this.spriteAtlas.clear()
    }

    getPrefabByName (name: string): cc.Prefab {
        return this.prefabs.get(name)
    }
    getSpriteAtlasByName (name: string): cc.SpriteAtlas {
        return this.spriteAtlas.get(name)
    }
    
    /****************************** 阵位信息 ******************************/

    getDownBattle ():Array<HEROINFO> {
        let list = HeroManager.openHeroData
        let newList: Array<HEROINFO> = []
        for (let i = 0; i < list.length; i++) {
            const element = list[i];
            let has = false
            for (const v of this.battleList) {
                if (v.id == element.id) {
                    has = true
                    break
                }
            }

            if (!has) {
                newList.push(element)
            }
        }
        return newList
    }

    addBattleIndex (index: number, id: string) {
        this.battleList.push({
            id: id,
            index: index,
        })
    }

    delBattleIndex (id: string) {
        for (let i = 0; i < this.battleList.length; i++) {
            const element = this.battleList[i];
            if (element.id == id) {
                this.battleList.splice(i,1)
                return
            }
        }
    }

    /****************************** state处理 ******************************/

    // 全量state
    getStates (list: Array<STATEDATA>): Array<STATEDATA> {
        let newList: Array<STATEDATA> = []
        for (let i = 0; i < list.length; i++) {
            let item = this.getState(list[i])
            newList.push(item)
        }
        return newList
    }

    // 根据id列表
    getStatesByIds (list: Array<string>): Array<STATEDATA> {
        let newList: Array<STATEDATA> = []
        for (let i = 0; i < list.length; i++) {
            let def = StaticManager.getStaticValue("static_state", list[i].toString())
            def.condition = JSON.parse(def.condition)
            let item = this.getState(def)
            newList.push(item)
        }
        return newList
    }

    getState (state: STATEDATA): STATEDATA {
        let base = stateBase[state.pid.toString()]
        let item = {
            uid: this.uniqueId.toString(),
            id: state.id,
            pid: state.pid,
            name: base.name,
            from: base.from,
            to: base.to,
            pos: state.pos,
            skillId: state.skillId,
            condition: state.condition,
            mv: state.mv,
            once: state.once,
            sort: state.sort,
            extra: state.extra, 
        }
        return item
    }

    /****************************** logic ******************************/

    getHeroByid (uid: string) {
        for (let i = 0; i < this.pveScene.heros.length; i++) {
            if (uid == this.pveScene.heros[i].uid) {
                return this.pveScene.heros[i]
            }
        }
    }

    getHeroByuid (id: string) {
        for (let i = 0; i < this.pveScene.heros.length; i++) {
            if (id == this.pveScene.heros[i].uid) {
                return this.pveScene.heros[i]
            }
        }
    }

    getHeros () {
        return this.pveScene.heros
    }

    getMonsters () {
        return this.pveScene.monsters
    }

    // 获取出怪
    getOutMonsters () {
        return this.pveScene.outMonsters
    }

    getStageData () {
        return this.pveScene.stageData
    }

    getActorsByCamp (camp: CAMPTYPE) {
        switch (camp) {
            case CAMPTYPE.hero:
                return this.getHeros()
                break;
            case CAMPTYPE.monster:
                return this.getMonsters()
                break;
            default:
                break;
        }
        return []
    }

    /****************************** special ******************************/

    // 全局特性处理
    dealGlobalSpecial (type: SPECIALTYPE, custom: any) {
        for (let i = 0; i < this.pveScene.heros.length; i++) {
            let hero = this.pveScene.heros[i];
            switch (type) {
                case SPECIALTYPE.appear:
                    hero._special.checkMonsterAppear(custom.target)
                    break;
                case SPECIALTYPE.activeSkill:
                    hero._special.checkActiveSkill(custom.target)
                    break;
                case SPECIALTYPE.activeHurt:
                    hero._special.checkActiveHurt(custom.target)
                    break;
                default:
                    break;
            }
        }
    }

    dealSuperSpecial (equip: RUNEDATA): RUNEDATA {
        let has: boolean = false
        let heros = this.getHeros()
        for (let i = 0; i < heros.length; i++) {
            if (heros[i]._special.checkSuper()) {
                has = true
                heros[i]._special.addSuper()
                break
            }
        }

        if (!has) { return equip }

        equip = StaticManager.getSuperRuneData(equip)
        return equip
    }
    
    checkSuperSpecial (): boolean {
        let heros = this.getHeros()
        for (let i = 0; i < heros.length; i++) {
            if (heros[i]._special.checkSuper()) {
                return true
            }
        }
        return false
    }

    /****************************** nodePool ******************************/

    getPool (type: NODEPOOLTYPE, prefeb: cc.Prefab): cc.Node {
        let pool = this.nodePools[type]
        if (pool.size() > 0) {
            return pool.get()
        } 
        return cc.instantiate(prefeb)
    }
    
    putPool (type: NODEPOOLTYPE, node: cc.Node) {
        this.nodePools[type].put(node)
    }

    /****************************** 符文cd类倒计时 ******************************/

    addCdList (id: string, max: number) {
        id = id.toString()
        if (this.cdList.get(id)) { return }
        
        this.cdList.set(id, {
            max: max,
            progress: 0,
        })
    }

    updateCdList (dt: number) {
        this.cdList.forEach((value, key) => { 
            let d: RUNECDDATA = this.cdList.get(key)
            let pro = d.progress + dt
            if (pro >= d.max) { pro = pro - d.max }
            this.cdList.set(key, {
                max: d.max,
                progress: pro,
            })
        }) 
    }
    
    getCdList (id: string): RUNECDDATA {
        id = id.toString()
        return this.cdList.get(id)
    }

    /****************************** 游戏的暂停和恢复 ******************************/

    pauseGame () {
        this.isPause = true
        for (let i = 0; i < this.pveScene.heros.length; i++) {
            this.pveScene.heros[i]._buffs.pauseEffect()
        }
        for (let i = 0; i < this.pveScene.bullets.length; i++) {
            this.pveScene.bullets[i].pauseEffect()
        }
        for (let i = 0; i < this.pveScene.hurtRects.length; i++) {
            this.pveScene.hurtRects[i].pauseEffect()
        }
    }

    resumeGame () {
        this.isPause = false
        for (let i = 0; i < this.pveScene.heros.length; i++) {
            this.pveScene.heros[i]._buffs.resumeEffect()
        }
        for (let i = 0; i < this.pveScene.bullets.length; i++) {
            this.pveScene.bullets[i].resumeEffect()
        }
        for (let i = 0; i < this.pveScene.hurtRects.length; i++) {
            this.pveScene.hurtRects[i].resumeEffect()
        }
    }

    /****************************** 自动施法处理 ******************************/

    updateAuto (autos: Map<string, boolean>) {
        let heros = this.getHeros()
        for (let i = 0; i < heros.length; i++) {
            let has = autos.get(heros[i].uid)
            heros[i]._auto.auto = has
        }
    }

    /****************************** 性能优化部分(空间换时间) ******************************/
    
    // 获取点的战内坐标
    getIndexWorldPos (num: number): cc.Vec2 {
        let m = Math.floor(num / Contants.MAP_WIDTH) 
        let n = num % Contants.MAP_WIDTH
        let pos = cc.v2(Contants.MAP_LEN * m + Contants.MAP_CLEN, Contants.MAP_HLEN - Contants.MAP_LEN * n - Contants.MAP_CLEN)

        let w = DisUtils.getPositionInNode(this.tiledNode, pos, TSCENE())
        let x = Math.floor(w.x - Contants.MAP_CW)
        let y = Math.floor(w.y - Contants.MAP_CH)
        return cc.v2(x,y)
    }

    getCachPos (num: number): cc.Vec2 {
        let pos = this.cachePoint.get(num)
        if (!pos) {
            pos = this.getIndexWorldPos(num)
            this.cachePoint.set(num, pos)
        }
        return pos
    }

    getCacheMonster (id: string, isClone: boolean = false): MONSTERINFO {
        id = id.toString()
        let monster = this.cacheMonster.get(id)
        if (!monster) {
            monster = StaticManager.getStaticValue("static_monster", id) as MONSTERINFO
            this.cacheMonster.set(id, monster)
        }

        if (isClone) {
            return clone(monster)
        }
        return monster
    }

    getCacheMap (id: string): MAPINFO {
        id = id.toString()
        let map = this.cacheMap.get(id)
        if (!map) {
            map = StaticManager.getStaticValue("static_map", id) as MAPINFO
            this.cacheMap.set(id, map)
        }
        return map
    }

    /****************************** 转职 ******************************/

    canJob (): boolean {
        return DS(this.curJob) > 0
    }
    
    checkJob (level: number) {
        if (this.jobLimit) { return }

        let m = DS(this.jobNum) + 1
        if (level < m * 50) { return }

        this.jobNum = ES(m)
        this.curJob = ES(DS(this.curJob) + 1)

        if (DS(this.jobNum) >= DS(this.jobMax)) {
            this.jobLimit = true
        }
    }
    
    // 转职
    setJob (hero: HeroActor, data: JOBDATA) {
        this.curJob = ES(DS(this.curJob) - 1)
        this.jobList.push(data.type)

        hero.setJob(data)
    }

    flyNum (word: string, type: FLYTYPE = FLYTYPE.hurt, pos: cc.Vec2) {
        if (this.flyNumber > 200) { return }
        this.flyNumber = this.flyNumber + 1
        GameUtils.fly(word, type, pos)
    }

    /****************************** 游戏速率的问题 ******************************/

    checkFrame () {
        if (this.SPEED >= 3) { return true }
        if (this.SPEED == 2 && this.FRAME >= 2) { return true }
        if (this.SPEED == 1 && this.FRAME >= 3) { return true }
    }

    getFrame () {
        if (this.SPEED > 3) { return this.SPEED / 60 }
        return Contants.FRAME
    }

    nextFrame () {
        this.FRAME = this.FRAME + 1
        if (this.FRAME > 3) { this.FRAME = 1 }
    }

    /****************************** 暂离 ******************************/

    //暂离回归 战斗开始前数据
    backFightStart () {
        let data: FIGHTBACKDATA = PlayerManager.getFightLeave()  
        if (!data) { return }

        this.timer = data.timer
        this.pveScene.stageIndex = data.stageIndex
        this.pveScene.outMonsters = [];
        this.pveScene.refreshStageData()

        // 英雄布阵
        for (let i = 0; i < data.heroData.length; i++) {
            let battle = data.heroData[i].battle
            let heroInfo: HEROINFO = HeroManager.getHeroDataById(battle.heroId)
            this.pveScene.createHero(heroInfo, battle.pos, battle.index)
        }
    }

    //暂离回归 战斗开始后数据
    backFightEnd () {
        let data: FIGHTBACKDATA = PlayerManager.getFightLeave()  
        if (!data) { return }

        this.curScore = data.curScore
        this.curRandom = data.curRandom
        this.runeRefresh = data.runeRefresh
        this.allHurt = DS(data.allHurt)

        // 符文
        for (let i = 0; i < data.equips.length; i++) {
            let d: RUNEDATA = StaticManager.getRuneById(data.equips[i])
            d.uid = this.uniqueId.toString()
            this.addEquip(d)
        }

        // 神器
        for (let i = 0; i < data.artifacts.length; i++) {
            let d: RUNEDATA = StaticManager.getRuneById(data.artifacts[i])
            d.uid = this.uniqueId.toString()
            this.addEquip(d)
        }

        // 数据赋予
        let heros = this.getHeros()
        for (let i = 0; i < data.heroData.length; i++) {
            let v = data.heroData[i]
            let hero = heros[i]

            let upExp = DS(hero.data.upExp) * (DS(v.lv) - 1)
            hero.addExp(upExp + DS(v.exp))

            // 职业在前
            if (v.job != "") {
                let jonData: JOBDATA = StaticManager.getStaticValue("static_job", v.job)
                this.setJob(hero, jonData)
            }

            hero._skill.changeRage(DS(v.rage))

            this.heroHurt.set(hero.uid, DS(v.hurt))

            for (let j = 0; j < v.rune.length; j++) {
                if (v.rune[j] != "") {
                    let d: RUNEDATA = StaticManager.getRuneById(v.rune[j])
                    d.uid = this.uniqueId.toString()
                    this.equipProp.get(hero.uid).set(j, d)
                }
            }

            // buff加成
            hero._realValue.buffAddSpecial = mergeArray(hero._realValue.buffAddSpecial, v.buffAddSpecial)
            hero._realValue.otherAddAttr = mergeArray(hero._realValue.otherAddAttr, v.otherAddAttr)
        }
    }

    // 暂离数据记录
    updateFightLeave () {
        let equips: Array<string> = []
        for (let i = 0; i < this.equips.length; i++) {
            equips.push(this.equips[i].id)
        }

        let artifacts: Array<string> = []
        for (let i = 0; i < this.artifacts.length; i++) {
            artifacts.push(this.artifacts[i].id)
        }

        let heroData: Array<FIGHTBACKHERODATA> = []
        let heros = this.getHeros()
        for (let i = 0; i < heros.length; i++) {
            let h: HeroActor = heros[i]
            let rune: Array<string> = []
            let hr = this.equipProp.get(h.uid)
            for (let j = 0; j < 4; j++) {
                let rd: RUNEDATA = hr.get(j)
                if (rd) {
                    rune.push(rd.id)
                } else {
                    rune.push("")
                }
            }

            heroData.push({
                id: h.pid,
                lv: h._level,
                exp: h._exp,
                job: h.jobData ? h.jobData.id : "",
                rage: h._skill.getRage(),
                hurt: ES(this.heroHurt.get(h.uid)),
                rune: rune,
                battle: {
                    index: h.towerIndex,
                    pos: h.startPos,
                    heroId: h.pid,
                },
                buffAddSpecial: h._realValue.buffAddSpecial,
                otherAddAttr: h._realValue.otherAddAttr,
            })
        }

        PlayerManager.setFightLeave({
            type: this.pveType,
            name: this.pveName,
            mapId: this.mapId,
            waveId: this.waveId,
            
            timer: this.timer,
            stageIndex: this.pveScene.stageIndex,
            curScore: this.curScore,
            curRandom: this.curRandom,
            curJob: this.curJob,
            runeRefresh: this.runeRefresh,
            allHurt: ES(this.allHurt),
            equips: equips,
            artifacts: artifacts,
            heroData: heroData,
        })
    }

    /****************************** 元素化 ******************************/

    // 添加元素出怪物
    addOutMonsters (outMonsters: Array<MONSTERQUEUE>) {
        let out = this.getOutMonsters()
        for (let i = 0; i < outMonsters.length; i++) {
            out.push(outMonsters[i])
        }
    }

    addSeasonHeroBuffs (ids: Array<string>) {
        let heros = this.getHeros()
        for (let i = 0; i < heros.length; i++) {
            heros[i]._buffs.addBuffs(ids, heros[i]._realValue.realFight)
        }
    }

    addSeasonMonsterBuffs (ids: Array<string>) {
        let monsters = this.getMonsters()
        for (let i = 0; i < monsters.length; i++) {
            monsters[i]._buffs.addBuffs(ids, monsters[i]._realValue.realFight)
        }
        this.seasonMonsterBuffs.push(ids)
    }

    clear () {
        this.heroHurt.clear()
        this.cachePoint.clear()
        this.cacheMonster.clear()
        this.cacheMap.clear()
        // 清空预制体资源
        this.releasePrefabs()
        // 清空对象池
        for (const v of this.nodePools) {
            v.clear()
        }
    }
}

export default FightManager