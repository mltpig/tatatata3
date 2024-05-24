import List from "../../../framework/creator/List";
import { UIACT, UI_ZORDER } from "../../../framework/utils/Enumer";
import AssetManager from "../../manager/AssetManager";
import GameManager from "../../manager/GameManager";
import HeroManager from "../../manager/HeroManager";
import LayerManager from "../../manager/LayerManager";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import BulletBase from "../../model/bullet/BulletBase";
import HurtRect from "../../model/bullet/HurtRect";
import FightManager from "../../model/FightManager";
import HeroActor from "../../model/hero/HeroActor";
import LaunchActor from "../../model/launcher/LaunchActor";
import MonsterActor from "../../model/monster/MonsterActor";
import UnitManager from "../../model/UnitManager";
import Contants from "../../other/Contants";
import { REFRESHINFOTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { DRAGTARGETTYPE, PVESTATE, STATETYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { DS, ES, random1, splice } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import { TSCENE } from "../../other/Tool";
import GameView from "../GameView";
import FightLayer from "./FightLayer";
import HandleLayer from "./HandleLayer";
import HeroIcon from "./HeroIcon";
import MapView from "./MapView";
import SkillDrag from "./SkillDrag";

const {ccclass, property} = cc._decorator;

interface SELECTDATA {
    node: cc.Node,
    info: HEROINFO,
    isLine: boolean,
    newNode?: cc.Node,
    pos?: cc.Vec2,
    index?: number,
}

@ccclass
export default class PveScene extends GameView {
    public fm: FightManager;
    public cm: cc.CollisionManager; 
    
    public heroIcon: cc.Prefab;
    public heroItem: cc.Prefab;
    public monsterItem: cc.Prefab;
    public bulletItem: cc.Prefab;
    public fightLayer: cc.Prefab;
    public handleLayer: cc.Prefab;
    public dragBase: cc.Prefab;
    public hurtRect: cc.Prefab;

    public isMove: boolean = false;
    public waveId: string;
    public waveData: WAVEDATA;
    public stageData: WAVESTAGEDATA;
    public isStageEnd: boolean = false;    // 最后一波？
    public isOutEnd: boolean = false;      // 所有怪物出完
    public stageIndex: string = ES(0);

    public outMonsters: Array<MONSTERQUEUE> = [];
    public heroData: Array<HEROINFO>;
    public selectData: SELECTDATA = null;
    public towers: Array<TOWERDATA> = [];
    public bullets: Array<BulletBase> = [];
    public launchs: Array<LaunchActor> = [];
    public hurtRects: Array<HurtRect> = [];
    
    public heroList: List = null;
    public tiledMap: cc.TiledMap;
    public mapView: MapView;
    public tiledNode: cc.Node;
    public fightBtn: cc.Node;
    public downNode: cc.Node;
    public downRect: cc.Rect;
    public listNode: cc.Node;
    public canvas: cc.Node;
    public heroScroll: cc.ScrollView;
    public heroNum: cc.Label;

    public pveState: PVESTATE = PVESTATE.ready;
    public skillDrag: SkillDrag = null;

    // 角色
    public monsters: Array<MonsterActor> = [];
    public heros: Array<HeroActor> = [];

    public handleScript: HandleLayer;
    public fightScript: FightLayer;
    public cancelRect = cc.rect(0,0,0,0);

    private cancelTouch: boolean = false;
    private isLongTouch: boolean = false;

    /************************ 初始 ************************/

    onLoad () {
        super.onLoad()
        
        this.fm = GameManager.getFM()
        
        this.tiledMap = this.getCpByType("mapNode", cc.TiledMap)
        this.mapView = this.getCpByType("mapNode", MapView)
        this.tiledNode = this.getNode("mapNode")
        this.fightBtn = this.getNode("fightBtn")
        this.heroList = this.getCpByType("heroList", List)
        this.downNode = this.getNode("downNode")
        this.listNode = this.getNode("listNode")
        this.heroScroll = this.getCpByType("heroList", cc.ScrollView)
        this.heroNum = this.getCpByType("heroNum", cc.Label)
        this.canvas = TSCENE()

        this.heroIcon = this.fm.getPrefabByName("heroIcon");
        this.heroItem = this.fm.getPrefabByName("heroItem");
        this.monsterItem = this.fm.getPrefabByName("monsterItem");
        this.bulletItem = this.fm.getPrefabByName("bulletItem");
        this.fightLayer = this.fm.getPrefabByName("fightLayer");
        this.handleLayer = this.fm.getPrefabByName("handleLayer");
        this.hurtRect = this.fm.getPrefabByName("hurtRect");
        this.dragBase = this.fm.getPrefabByName("dragBase");

        this.addEventListener_(Events.fight_kill_exp_event, this.handExp)
        this.addEventListener_(Events.fight_random_event, this.handRandomLayer)
        this.addEventListener_(Events.fight_machine_event, this.handMachineLayer)
    }

    start () { 
        this.addMaskUse()
        
        // 开启
        this.cm = cc.director.getCollisionManager()
        this.cm.enabled = true
        // this.cm.enabledDebugDraw = true
        
        let rect: cc.Rect = this.downNode.getBoundingBoxToWorld()
        let newPos: cc.Vec2 = this.canvas.convertToNodeSpaceAR(cc.v2(rect.x, rect.y))
        this.downRect = new cc.Rect(newPos.x, newPos.y, rect.width, rect.height)
        this.showBattle(false)

        // logic
        this.fm.init(this, this.tiledNode)
        this.heroNum.string = this.heros.length + "/" + DS(this.fm.maxUp)

        this.init()
        this.initView()
        this.initListener()
        this.initMap()
    }

    init () {
        this.waveId = this.fm.waveId;
        this.waveData = StaticManager.getWaveData(this.waveId) as WAVEDATA
        this.fm.maxMonster = this.waveData.monster_num_limit
        this.fm.stageDatas = StaticManager.getPveStages(this.waveData.stage_id.toString())

        this.initWaveDataModel()
        this.refreshStageData()
    }

    initWaveDataModel () {}

    refreshStageData () {
        if (this.isStageEnd) {
            // 本关卡波次全部结束
            return
        }
        
        this.stageData = this.fm.stageDatas[DS(this.stageIndex)]
        this.initStageDataModel()
        this.fm.countTime = this.stageData.time_limit
        this.fm.curWaveDes = this.stageData.waves_des
        this.fm.curWave = ES(this.stageData.round)
        this.fm.isBoss = this.stageData.type == 2
        this.fm.awards = JSON.parse(this.stageData.award)

        this.stageIndex = ES(DS(this.stageIndex) + 1)
        if (DS(this.stageIndex) >= this.fm.stageDatas.length) {
            this.isStageEnd = true
        }
        if (!this.fm.seasonOpen && DS(this.fm.curWave) > 100) {
            this.fm.seasonOpen = true
            this.dispatchEvent_(Events.open_fight_season)
        }

        // 出怪
        let outs: Array<Array<number>> = JSON.parse(this.stageData.monsters) 
        let paths: Array<number> = JSON.parse(this.stageData.route)
        let interval: number = DS(this.stageData.monsters_times)
        for (let i = 0; i < outs.length; i++) {
            let d = outs[i]
            for (let j = 0; j < d[1]; j++) {
                let t = {
                    delayStep: DS(this.fm.timer) + j * interval,
                    id: d[0].toString(),
                    pathId: paths[random1(0,paths.length)].toString(),
                    rate: this.stageData.hp_rate,
                    level: this.stageData.lv,
                }
                this.outMonsters.push(t)
            }
        }

        this.initStageDataModel2()
    }

    initStageDataModel () {}
    
    initStageDataModel2 () {}

    onTouchEnd (name: string) {
        switch (name) {
            case "fightBtn":
                if (this.fm.checkDown()) {
                    return
                }
                
                this.startFight()
                break;
            default:
                break;
        }
    }

    /************************ 进入战斗界面 ************************/

    initMap () {
        let self = this

        let path = "map/" + this.waveData.map
        cc.resources.load(path, function (error, map) {
            self.tiledMap.tmxAsset = <any> map
            self.mapView.init()
            self.initData()
        })
    }

    initView () {
        // 操作界面
        let handle = cc.instantiate(this.handleLayer)
        handle.setPosition(0,0)
        this.canvas.addChild(handle, UI_ZORDER.dragUpZoder)
        this.handleScript = handle.getComponent(HandleLayer)

        this.initModel()
    }

    initModel () {
        // 显示界面
        let view = cc.instantiate(this.fightLayer)
        view.setPosition(0,0)
        this.canvas.addChild(view, UI_ZORDER.dragUpZoder)
        this.fightScript = view.getComponent(FightLayer)
    }

    initData () {
        // tower
        let towers = this.mapView.towers
        for (const v of towers) {
            let pos = this.fm.getCachPos(v)
            this.towers.push({
                index: v,
                pos: pos,
                node: null,
                rect: cc.rect(pos.x - Contants.MAP_CLEN, pos.y - Contants.MAP_CLEN, Contants.MAP_LEN, Contants.MAP_LEN)
            })
        }

        this.initModelData()

        // if (this.fm.fightBack) {
        //     this.startFightLeave()
        //     return
        // }

        // 检测布阵失效
        let unInvalid: boolean = false
        let battle: Array<BATTLEHEROLOCALDATA> = PlayerManager.getFightBattle(this.fm.mapId)
        for (let i = 0; i < battle.length; i++) {
            let can = false
            for (let j = 0; j < this.towers.length; j++) {
                if (battle[i].index == this.towers[j].index && battle[i].pos.x == this.towers[j].pos.x && battle[i].pos.y == this.towers[j].pos.y) {
                    can = true
                    break
                }
            }
            if (!can) {
                unInvalid = true
                break
            }
        }

        if (!unInvalid) {
            // 布阵
            for (let i = 0; i < battle.length; i++) {
                let hero: HEROINFO = HeroManager.getHeroDataById(battle[i].heroId)
                this.createHero(hero, battle[i].pos, battle[i].index)
            }
        }
        // hero
        this.refreshListRender()
    }
    
    initModelData () { }

    initListener () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnds, this, true);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this, true);
    }

    /************************ 英雄选择和点击 ************************/

    onListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(HeroIcon)
        cell.setData(this.heroData[idx])
    }

    refreshListRender () {
        this.heroData = this.fm.getDownBattle()
        this.heroList.numItems = this.heroData.length
    }

    showBattle (up: boolean) {
        if (up) {
            this.downNode.opacity = 255
            this.listNode.opacity = 0
        } else {
            this.downNode.opacity = 0
            this.listNode.opacity = 255
        }
    }

    checkInList (pos: cc.Vec2) {
        let children = this.heroList.content.children
        for (let i = 0; i < children.length; i++) {
            const element = children[i];
            let rect: cc.Rect = element.getBoundingBoxToWorld()
            let newPos: cc.Vec2 = this.canvas.convertToNodeSpaceAR(cc.v2(rect.x, rect.y))
            let newRect: cc.Rect = new cc.Rect(newPos.x, newPos.y, rect.width, rect.height)
            if (newRect.contains(pos)) {
                let script = element.getComponent(HeroIcon)
                return {
                    node: element,
                    info: script.data,
                    isLine: false,
                }
            }
        }
        return
    }

    checkInLine (pos: cc.Vec2) {
        for (let i = 0; i < this.towers.length; i++) {
            const element = this.towers[i];
            if (element.rect.contains(pos)) {
                let script = null
                let info = null
                if (element.node) {
                    script = element.node.getComponent(HeroActor)
                    info = script.data
                }
                return {
                    node: element.node,
                    info: info,
                    script: script,
                    isLine: true,
                    pos: element.pos,
                    index: element.index,
                }
            }
        }
        return
    }

    getShowItem (): cc.Node {
        let node = cc.instantiate(this.heroIcon) as cc.Node
        let script = node.getComponent(HeroIcon)
        this.canvas.addChild(node, UI_ZORDER.selectZoder)
        script.setData(this.selectData.info)
        script.showRange(true)
        return node
    }

    onTouchStart (event) {
        if (this.fm.isPause) { return }

        this.onModelTouchStart(event)
        let pos = this.canvas.convertToNodeSpaceAR(event.getLocation())

        if (this.pveState == PVESTATE.ready) {
            this.closeHeroRangeShow()
            // 布阵
            let check1 = this.checkInList(pos)
            if (check1) {
                this.selectData = {
                    node: check1.node,
                    info: check1.info,
                    isLine: false,
                }

                // 长按
                this.isLongTouch = true
                this.scheduleOnce(this.longTouch, 0.6);
                return
            }

            let check2 = this.checkInLine(pos)
            if (check2 && check2.node) {
                this.selectData = {
                    node: check2.node,
                    info: check2.info,
                    isLine: true,
                    pos: check2.pos,
                    index: check2.index,
                }
                let hero = this.selectData.node.getComponent(HeroActor)
                if (hero) {
                    hero.showRange(true)
                }
                return
            }
        } else if (this.pveState == PVESTATE.battle){
            // 施法
            let heroClick = this.checkInLine(pos)
            if (heroClick && heroClick.script) {
                let actor = <HeroActor>heroClick.script
                
                // 自动施法
                if (actor._auto.auto) { return }

                if (actor._skill.isFull()) {
                    this.showStartSkill()
                    let bAttr: BULLETDATA = actor._skill.getSkillData()
                    this.handleScript.showSkillDes(bAttr.des)
                    this.skillDrag = new SkillDrag({
                        pos: actor.startPos,
                        attacker: actor,
                        bAttr: bAttr,
                        type: DRAGTARGETTYPE.hero,
                        prefab: this.dragBase,
                    })
                }
            }
        }
    }

    onModelTouchStart (event) { }

    closeHeroRangeShow () {
        for (let i = 0; i < this.heros.length; i++) {
            this.heros[i].showRange(false)
        }
    }
    
    onTouchMove (event) {
        if (this.fm.isPause) { return }
        if (this.cancelTouch) { return }

        this.onModelTouchMove(event)
        let pos = this.canvas.convertToNodeSpaceAR(event.getLocation())
        let startPoint = this.canvas.convertToNodeSpaceAR(event.touch._startPoint)
        let isMove = Math.abs(pos.x - startPoint.x) > 5 || Math.abs(pos.y - startPoint.y) > 5

        //纵向移动
        if (this.pveState == PVESTATE.ready) {
            if (isMove) { this.cancelLongTouch() }

            if (this.selectData && this.selectData.newNode) {
                this.selectData.newNode.setPosition(pos)
            } else {
                if (!this.selectData) { return }
                if (this.selectData.isLine) {
                    // 场上
                    this.isMove = isMove
                } else {
                    // 列表
                    this.isMove = Math.abs(pos.y - startPoint.y) > 15
                }
                if (this.isMove) {
                    this.showBattle(true)
                    this.heroScroll.enabled = false
                    this.selectData.node.active = false
                    this.selectData.newNode = this.getShowItem()
                    this.selectData.newNode.setPosition(pos)
                }
            }
        } else if (this.pveState == PVESTATE.skill) {
            this.skillDrag.onTouchMove(pos)
            let cancel = this.checkCancel(pos)
            this.handleScript.changeCancel(cancel)
        }
    }

    onModelTouchMove (event) { }

    onTouchEnds (event) {
        if (this.fm.isPause) { return }

        this.onModelTouchEnds(event)
        let pos = this.canvas.convertToNodeSpaceAR(event.getLocation())

        if (this.pveState == PVESTATE.ready) {
            this.checkPlace(pos)
            this.cancelLongTouch()
            this.heroScroll.enabled = true
        } else if (this.pveState == PVESTATE.skill) {
            let cancel = this.checkCancel(pos)
            this.skillDrag.onTouchEnds(pos, cancel)
            this.showEndSkill()
        }
    }

    onModelTouchEnds (event) { }

    onTouchCancel (event) {
        if (this.fm.isPause) { return }
        
        this.onModelTouchCancel(event)
        let pos = this.canvas.convertToNodeSpaceAR(event.getLocation())

        if (this.pveState == PVESTATE.ready) {
            this.checkPlace(pos)
            this.cancelLongTouch()
            this.heroScroll.enabled = true
        } else if (this.pveState == PVESTATE.skill) {
            this.skillDrag.onTouchCancel(pos)
            this.showEndSkill()
        }
    }

    onModelTouchCancel (event) { }

    // 检测放置
    checkPlace (pos: cc.Vec2) {
        this.cancelTouch = false
        if (!this.selectData || !this.selectData.newNode) { return }

        if (this.selectData.isLine) {
            if (this.downRect.contains(pos)) {
                // 下阵
                let script = this.selectData.node.getComponent(HeroActor)
                this.deleteHero(script)
            } else {
                let check = this.checkInLine(pos)
                if (check) {
                    if (check.node) {
                        // 相等表示归位
                        if (check.info.id != this.selectData.info.id) {
                            
                            // 替换
                            let script = check.node.getComponent(HeroActor)
                            this.deleteHero(script)

                            let script2 = this.selectData.node.getComponent(HeroActor)
                            this.deleteHero(script2)

                            this.createHero(check.info, this.selectData.pos, this.selectData.index)
                            this.createHero(this.selectData.info, check.pos, check.index)
                        }
                    } else {
                        // 换位
                        let script = this.selectData.node.getComponent(HeroActor)
                        this.deleteHero(script)
                        this.createHero(this.selectData.info, check.pos, check.index)
                    }
                }
            }
        } else {
            let check = this.checkInLine(pos)
            if (check) {
                if (check.node) {
                    // 替换
                    let script = check.node.getComponent(HeroActor)
                    this.deleteHero(script)
                    this.createHero(this.selectData.info, check.pos, check.index)
                } else {
                    // 上阵
                    this.createHero(this.selectData.info, check.pos, check.index)
                }
            }
        }
        
        this.isMove = false
        this.showBattle(false)
        this.refreshListRender()
        if (this.selectData) {
            this.selectData.node.active = true
            if (this.selectData.newNode) {
                this.selectData.newNode.destroy()
            }
            this.selectData = null
        }
    }

    /************************ 是否长按 ************************/

    cancelLongTouch () {
        if (!this.isLongTouch) { return }

        this.isLongTouch = false
        this.unschedule(this.longTouch);
    }
    
    longTouch () {
        this.cancelTouch = true
        let heroId = this.selectData.info.id
        this.isMove = false
        this.showBattle(false)
        if (this.selectData) {
            this.selectData.node.active = true
            if (this.selectData.newNode) {
                this.selectData.newNode.destroy()
            }
            this.selectData = null
        }

        LayerManager.pop({
            script: "FightHero",
            prefab: PATHS.common + "/fightHero",
            data: heroId,
            backClick: true,
        }) 
    }

    /************************ 释放技能状态 ************************/

    showStartSkill () {
        this.pveState = PVESTATE.skill
        this.handleScript.showCancel(true)
    }

    showEndSkill () {
        this.pveState = PVESTATE.battle
        this.handleScript.showCancel(false)
        this.skillDrag = null
    }

    // 取消施法
    checkCancel (pos: cc.Vec2) {
        if (this.cancelRect.contains(pos)) {
            return true
        }
        return false
    }
    
    /************************ 开始战斗 ************************/

    startFight () {
        let rect = this.handleScript.getCancelRect()
        let newPos: cc.Vec2 = this.canvas.convertToNodeSpaceAR(cc.v2(rect.x, rect.y))
        this.cancelRect = cc.rect(newPos.x, newPos.y, rect.width, rect.height)
        
        this.fm.startFight()
        this.handleScript.startFight()
        this.startModel()
        this.fightBtn.active = false
        this.downNode.active = false
        this.listNode.active = false
        this.pveState = PVESTATE.battle
    }

    startModel () {
        this.fightScript.startFight()
    }

    updateMonster (dt) {
        for (let i = 0; i < this.outMonsters.length; i++) {
            const item = this.outMonsters[i];
            
            if (DS(this.fm.timer) >= item.delayStep) {
                // 出怪物
                this.createMonster(item)

                this.outMonsters.splice(i,1)
                i--
            }
        }
        
        this.isOutEnd = this.outMonsters.length == 0
    }

    update (dt: number) {
        if (this.pveState != PVESTATE.battle) { return }
        if (this.fm.isPause) { return }
        
        this.fm.nextFrame()

        // move
        let sdt = DS(this.fm.gameSpeed) / 60
        this.updateMove(sdt)

        if (!this.fm.checkFrame()) { return }
        dt = this.fm.getFrame()

        this.fm.updateMonsterNum()
        this.fm.update2(dt)
        this.handleScript.update2(dt)
        this.updateMonster(dt)
        this.updateActors(dt)
        this.updateModel(dt)
        
        // 检测结束
        let ended = this.checkFightEnd()
        if (ended) { return }
        
        this.updateRefreshModel()
    }

    updateRefreshModel () {
        // 检测刷新
        if (DS(this.fm.countTime) <= 0) {
            // this.updateFightLeave()
            this.refreshStageData()
        }
    }

    // 检测刷新暂离数据
    updateFightLeave () {
        if (this.stageData.type != 2) { return }        // boss波次
        this.fm.updateFightLeave()

    }

    updateModel (dt: number) {
        this.fightScript.update(dt)
    }

    checkFightEnd (): boolean {
        // 达到怪物上限 达到缓冲上限 失败
        if (this.fm.upMonster && DS(this.fm.slowTime) <= 0) {
            this.fm.isWin = this.fm.pveLose
            this.showFightEnd()
            return true
        }
        
        // boss 倒计时结束未清场 失败
        if (this.fm.isBoss && DS(this.fm.countTime)<= 0 && DS(this.fm.curMonster) > 0) {
            this.fm.isWin = this.fm.pveLose
            this.showFightEnd()
            return true
        }
                
        // 强制结束
        if (this.fm.forceEnd) {
            this.fm.isWin = this.fm.pveLose
            this.showFightEnd()
            return true
        }

        // 胜利 最后一波 所有怪物出完 清场
        if (this.isStageEnd && this.isOutEnd && this.monsters.length == 0) {
            this.fm.isWin = this.fm.pveWin
            this.showFightEnd()
            return true
        }

        return false
    }

    // 胜利失败
    showFightEnd () {
        let isWin = this.fm.isWin == this.fm.pveWin
        let isLose = this.fm.isWin == this.fm.pveLose

        if (!isWin && !isLose) { return }
        this.pveState = PVESTATE.ended
        this.fm.setTimeScale(1);
        
        this.showEndView(isWin)
        // 清除暂离数据
        PlayerManager.clearFightLeave()
    }
    
    showEndView (isWin: boolean) {
        LayerManager.pop({
            script: "PveResult",
            prefab: PATHS.fight + "/pveResult",
            data: isWin,
            type: UIACT.drop_down,
        })   
    }

    updateMove (dt: number) {
        // monster
        for (let i = 0; i < this.monsters.length; i++) {
            let v = this.monsters[i]
            if (!v.onState(STATETYPE.finish)) {
                v.updateMove(dt)
            }
        }
        
        // bullet
        for (let i = 0; i < this.bullets.length; i++) {
            let v = this.bullets[i]
            if (v.onState(STATETYPE.finish)) {
                v.clear()
                this.bullets.splice(i,1)
                i--
            } else {
                v.update2(dt)
            }
        }
    }

    updateActors (dt: number) {
        // monster
        for (let i = 0; i < this.monsters.length; i++) {
            let v = this.monsters[i]
            if (v.onState(STATETYPE.finish)) {
                v.clear()
                this.monsters.splice(i,1)
                i--
            } else {
                v.update2(dt)
            }
        }

        // hero
        for (let i = 0; i < this.heros.length; i++) {
            let v = this.heros[i]
            if (v.onState(STATETYPE.finish)) {
                v.clear()
                this.heros.splice(i,1)
                i--
            } else {
                v.update2(dt)
            }
        }

        // launch
        for (let i = 0; i < this.launchs.length; i++) {
            let v = this.launchs[i]
            if (v.onState(STATETYPE.finish)) {
                v.clear()
                this.launchs.splice(i,1)
                i--
            } else {
                v.update2(dt)
            }
        }

        // rect
        for (let i = 0; i < this.hurtRects.length; i++) {
            let v = this.hurtRects[i]
            if (v.onState(STATETYPE.finish)) {
                v.clear()
                this.hurtRects.splice(i,1)
                i--
            } else {
                v.update2(dt)
            }
        }
    }

    /************************ 创建怪物 ************************/

    createMonster (data: MONSTERQUEUE) {
        let script = UnitManager.createMonster(this.monsterItem, data.id)
        script.setRate(data.rate, data.level)
        script.setPath(data.pathId)
        this.monsters.push(script)
        this.addMonsterSeason(script)
    }

    addMonsterSeason (monster: MonsterActor) {
        let buffs = this.fm.seasonMonsterBuffs
        if (buffs.length == 0) { return }

        let curBuff = buffs[0]
        monster._buffs.addBuffs(curBuff, monster._realValue.realFight, null, buffs.length)

    }

    createHero (data: HEROINFO, pos: cc.Vec2, index: number) {
        if (this.fm.checkUp()) {
            return
        }
        
        let hero = UnitManager.createHero(this.heroItem, data, pos)
        hero.script.setTowerIndex(index)
        this.heros.push(hero.script)

        // 重设ide
        for (let i = 0; i < this.heros.length; i++) {
            this.heros[i].setIde(i+1)
        }
        
        this.fm.addBattleIndex(index, data.id)
        this.changeHeroTower(index, true, hero.node)
        this.heroNum.string = this.heros.length + "/" + DS(this.fm.maxUp)
    }

    deleteHero (hero: HeroActor) {
        splice(this.heros, function (script: HeroActor) {
            return script.towerIndex == hero.towerIndex
        }.bind(this))

        // 重设ide
        for (let i = 0; i < this.heros.length; i++) {
            this.heros[i].setIde(i+1)
        }

        this.fm.delBattleIndex(hero.data.id)
        this.changeHeroTower(hero.towerIndex, false)
        hero.clear()
    }

    changeHeroTower (index: number, add: boolean, node?: cc.Node) {
        for (let i = 0; i < this.towers.length; i++) {
            const e = this.towers[i];
            if (e.index == index) {
                if (add) {
                    this.towers[i].node = node
                } else {
                    this.towers[i].node = null
                }
            }
        }
    }

    createBullet (data: BULLETDATA) {
        let bullet = UnitManager.createBullet(this.bulletItem, data)
        this.bullets.push(bullet)

        return bullet
    }

    createLaunch (data: launchData) {
        let launch = UnitManager.createLaunch(data)
        this.launchs.push(launch)

        return launch
    }

    createHurtRects (data: HURTRECTDATA) {
        let rect = UnitManager.createHurtRects(this.hurtRect, data)
        this.hurtRects.push(rect)

        return rect
    }

    /************************ 部分逻辑 ************************/
    
    // 击杀经验
    handExp (event) {
        for (const v of this.heros) {
            v.addExp(event.exp)
        }
    }

    // 随机事件
    handRandomLayer (event) {
        this.fm.addRandom()
    }

    // 随机事件
    handMachineLayer (event) {
        this.fm.addMachine()
    }

    /****************************** 暂离 ******************************/

    startFightLeave () {
        this.fm.backFightStart()
        this.startFight()
        this.fm.backFightEnd()
        for (let i = 0; i < this.heros.length; i++) {
            this.dispatchEvent_(Events.fight_hero_change_event, { 
                id: this.heros[i].uid,
                type: REFRESHINFOTYPE.skill,
            })
        }
    }

    /************************ 清除 ************************/
    onDestroy() {
        super.onDestroy()
        GameManager.clearFM()
        this.fm.setTimeScale(1);
    }

}
