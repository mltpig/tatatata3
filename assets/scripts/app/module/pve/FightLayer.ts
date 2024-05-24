import List from "../../../framework/creator/List";
import SelectButton from "../../../framework/creator/SelectButton";
import TimeUtils from "../../../framework/utils/TimeUtils";
import GameManager from "../../manager/GameManager";
import MonsterActor from "../../model/monster/MonsterActor";
import { FIGHTPANELTYPE, SELECTBTNTYPE, TIPSTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { ATTRTYPE, PVESTATE, SCENETYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { DS, ES } from "../../other/Global";
import GameView from "../GameView";
import CrewItem from "./CrewItem";
import EquipItem from "./EquipItem";
import SkillLayer from "./SkillLayer";

const {ccclass, property} = cc._decorator;

/**
 * 战斗显示界面
 */
@ccclass
export default class FightLayer extends GameView {
    @property(cc.Prefab)
    crewItem: cc.Prefab = null;

    @property(cc.Prefab)
    skillLayer: cc.Prefab = null;

    @property(cc.Prefab)
    equipItem: cc.Prefab = null;

    private frontNode: cc.Node;
    private behindNode: cc.Node;

    private hideTxt: cc.Label;

    private heroBtn: SelectButton;    
    private artifactBtn: SelectButton;    
    private waveTxt: cc.Label;
    private waveCampTxt: cc.Label;
    private monsterNumTxt: cc.Label;
    private monsterNumTxt2: cc.Label;
    private stageTxt: cc.Label;
    private slowTxt: cc.Label;
    private slowNode: cc.Node;
    private eventBtn: cc.Node;
    private machineBtn: cc.Node;
    private eventTxt: cc.Label;
    private machineTxt: cc.Label;
    private skillNum: cc.Label;
    private devilBtn: cc.Node;
    private devilTxt: cc.Label;

    private heroTabNode: cc.Node;
    private heroEquipNode: cc.Node;
    private heroList: List;
    private artifactTabNode: cc.Node;
    private artifactList: List;

    private scrollNode: cc.Node;
    private heroDetails: cc.Node;
    private artifactDetails: cc.Node;
    private heroPropDes: cc.Label;
    private heroSkillBtn: cc.Node;
    private heroAttrBtn: cc.Node;
    private herohurtBtn: cc.Node;
    private heroTxtNode: cc.Node;

    private bossHp: cc.ProgressBar;
    private bossHpTxt: cc.Label;
    private bossHpNum: number = 0;

    private refreshTime: number = 0
    private tabType: SELECTBTNTYPE;
    private crewList: Array<CrewItem> = [];

    private selectEquip: SELECTHERODATA;        // 选择的技能
    private heroDetailScript: SkillLayer;
    private artifactDetailScript: SkillLayer;
    private isHide: boolean = false;
    
    private fm;
    private customEquips: Array<RUNEDATA> = [];

    onLoad () {
        super.onLoad()

        this.frontNode = this.getNode("frontNode")
        this.behindNode = this.getNode("behindNode")

        this.hideTxt = this.getCpByType("hideTxt", cc.Label)

        this.heroBtn = this.getCpByType("heroBtn", SelectButton)
        this.artifactBtn = this.getCpByType("artifactBtn", SelectButton)
        this.heroBtn.selectCallback = this.selectClick.bind(this)
        this.artifactBtn.selectCallback = this.selectClick.bind(this)

        this.heroTabNode = this.getNode("heroTabNode")
        this.heroEquipNode = this.getNode("heroEquipNode")
        this.artifactTabNode = this.getNode("artifactTabNode")
        this.scrollNode = this.getNode("scrollNode")
        this.heroPropDes = this.getCpByType("heroPropDes", cc.Label)
        this.heroSkillBtn = this.getNode("heroSkillBtn")
        this.heroAttrBtn = this.getNode("heroAttrBtn")
        this.herohurtBtn = this.getNode("herohurtBtn")
        this.heroTxtNode = this.getNode("heroTxtNode")

        this.heroList = this.getCpByType("heroList", List)
        this.artifactList = this.getCpByType("artifactList", List)

        this.slowNode = this.getNode("slowBgTxt")
        this.stageTxt = this.getCpByType("stageTxt", cc.Label)
        this.slowTxt = this.getCpByType("slowTxt", cc.Label)
        this.heroDetails = this.getNode("heroDetails")
        this.artifactDetails = this.getNode("artifactDetails")
        this.eventBtn = this.getNode("eventBtn")
        this.machineBtn = this.getNode("machineBtn")
        this.eventTxt = this.getCpByType("eventTxt", cc.Label)
        this.machineTxt = this.getCpByType("machineTxt", cc.Label)
        this.skillNum = this.getCpByType("skillNum", cc.Label)
        this.devilBtn = this.getNode("devilBtn")
        this.devilTxt = this.getCpByType("devilTxt", cc.Label)
        this.machineBtn.active = false
        this.eventTxt.node.active = false
        this.machineTxt.node.active = false
        this.devilBtn.active = false
        this.devilTxt.node.active = false

        this.waveTxt = this.getCpByType("waveTxt", cc.Label)
        this.waveCampTxt = this.getCpByType("waveCampTxt", cc.Label)
        this.monsterNumTxt = this.getCpByType("monsterNumTxt", cc.Label)
        this.monsterNumTxt2 = this.getCpByType("monsterNumTxt2", cc.Label)
        this.bossHp = this.getCpByType("bossHp", cc.ProgressBar)
        this.bossHpTxt = this.getCpByType("bossHpTxt", cc.Label)
        this.slowNode.active = false

        this.heroEquipNode.active = false
        this.heroDetails.active = false
        this.artifactDetails.active = false
        this.bossHp.node.active = false
        this.bossHpTxt.node.active = false
        this.behindNode.active = false

        this.fm = GameManager.getFM()

        if (this.fm.pveType == SCENETYPE.camp) {
            this.waveCampTxt.node.active = true
            this.waveCampTxt.string = ""
        } else if (this.fm.pveType == SCENETYPE.lord) {
            this.monsterNumTxt2.string = "尘: "
            this.monsterNumTxt.node.color = cc.Color.YELLOW
            this.monsterNumTxt.node.setPosition(280,300)
            this.monsterNumTxt.string = ""
        }

        this.addEventListener_(Events.game_rune_change_event, this.refreshRuneShow.bind(this))
    }

    start () {
        let item1 = cc.instantiate(this.skillLayer)
        item1.setPosition(0,cc.winSize.height/2)
        this.heroDetails.addChild(item1)
        this.heroDetailScript = item1.getComponent(SkillLayer)

        let item2 = cc.instantiate(this.skillLayer)
        item2.setPosition(0,cc.winSize.height/2)
        this.artifactDetails.addChild(item2)
        this.artifactDetailScript = item2.getComponent(SkillLayer)
    }
    
    startFight () {
        this.behindNode.active = true
        this.showTabItem(SELECTBTNTYPE.hero)
        this.refreshRuneShow()
    }
    
    update (dt: number) {
        if (this.fm.isPause) { return }
        
        this.refreshTime = this.refreshTime + dt
        if (this.refreshTime < 0.5) { return }

        this.refreshTime = 0
        // 随机
        this.eventBtn.active = this.fm.canRandom()
        this.machineBtn.active = this.fm.canMachineShow()
        this.eventTxt.node.active = this.eventBtn.active
        this.machineTxt.node.active = this.machineBtn.active
        this.eventTxt.string = this.fm.getRandom().toString()
        this.machineTxt.string = this.fm.getMachine().toString()
        this.refreshDevil()
        // 波数
        this.waveTxt.string = this.fm.curWaveDes

        if (this.fm.pveType == SCENETYPE.camp) {
            // 怪物数
            this.monsterNumTxt.string = DS(this.fm.curMonster) + "/" + DS(this.fm.maxMonster)

            // 倒计时
            let num = Math.ceil(DS(this.fm.campTimeLimit) - DS(this.fm.timer))
            this.stageTxt.string = TimeUtils.getTimerDes(num)

            // 杀怪剩余数
            let campStr: number = this.fm.getCampLastNum()
            if (campStr == 0) {
                this.waveCampTxt.string = ""
            } else {
                this.waveCampTxt.string = "再出" + campStr.toString() + "只怪物进入下一波"
            }

        } else if (this.fm.pveType == SCENETYPE.lord) {
            // 尘血量
            let lord = this.fm.getLord()
            if (lord) {
                this.monsterNumTxt.string = lord._realValue.getUseAttr(ATTRTYPE.hp).toString()
            }

            // 波次倒计时
            this.stageTxt.string = Math.ceil(DS(this.fm.countTime)).toString()  

            // boss
            this.refreshBossHp()
        } else {
            // 怪物数
            this.monsterNumTxt.string = DS(this.fm.curMonster) + "/" + DS(this.fm.maxMonster)
            this.monsterNumTxt.node.color = this.fm.upMonster ? cc.Color.RED : cc.Color.WHITE

            // 波次倒计时
            this.stageTxt.string = Math.ceil(DS(this.fm.countTime)).toString()  

            // 缓冲倒计时
            this.slowNode.active = this.fm.upMonster
            if (this.fm.upMonster) {
                this.slowTxt.string = Math.ceil(DS(this.fm.slowTime)).toString()
            }

            // boss
            this.refreshBossHp()
        }
    }

    refreshDevil () {
        this.devilBtn.active = this.fm.canDevil()
        this.devilTxt.node.active = this.devilBtn.active
        this.devilTxt.string = this.fm.getDevil()
    }

    /**
     * boss波次血量显示
     * 当前血量： boss波次开始后当前怪物总血量 + 未出场怪物 刷新
     * 总血量: boss波次开始后当前怪物总血量 + 未出场怪物 不变
     */
    refreshBossHp () {
        if (this.fm.isBoss) {
            if (this.bossHpNum == 0) {
                this.bossHp.node.active = true
                this.bossHpTxt.node.active = true
            }
        } else {
            if (this.bossHpNum != 0) {
                this.bossHpNum = 0
                this.bossHp.node.active = false
                this.bossHpTxt.node.active = false
            }
            return
        }

        let curHp: number = 0
        let monsters = this.fm.getMonsters() as Array<MonsterActor>
        let outMonsters = this.fm.getOutMonsters() as Array<MONSTERQUEUE>

        for (let i = 0; i < monsters.length; i++) {
            if (!monsters[i].season) {
                curHp = curHp + monsters[i]._realValue.getUseAttr(ATTRTYPE.hp)
            }
        }   

        for (let i = 0; i < outMonsters.length; i++) {
            let v = outMonsters[i]
            if (!v.season) {
                let d = this.fm.getCacheMonster(v.id.toString())
                let h = DS(d.hp) + (DS(v.level) - 1) * DS(d.hpGrow)
                curHp = curHp + h * DS(v.rate)
            }
        }
        
        curHp = Math.ceil(curHp)
        if (this.bossHpNum == 0) { 
            this.bossHpNum = curHp 
            this.bossHpNum = this.bossHpNum == 0 ? 1 : this.bossHpNum
        }
        this.bossHp.progress = curHp / this.bossHpNum
        this.bossHpTxt.string = curHp + "/" + this.bossHpNum
    }
    
    selectClick (type: SELECTBTNTYPE) {
        if (this.fm.pveState != PVESTATE.battle) { return }

        switch (type) {
            case SELECTBTNTYPE.hero:
                // 英雄
                this.showTabItem(SELECTBTNTYPE.hero)
                break;
            case SELECTBTNTYPE.artifact:
                // 符文
                this.showTabItem(SELECTBTNTYPE.artifact)
                break;
            default:
                break;
        }
    }
    
    // 展示页签信息
    showTabItem (type: SELECTBTNTYPE) {
        if (type == this.tabType) {
            return
        }

        this.heroTabNode.active = type == SELECTBTNTYPE.hero
        this.artifactTabNode.active = type == SELECTBTNTYPE.artifact

        if (this.tabType == SELECTBTNTYPE.hero) {
            this.heroList.numItems = 0
            this.scrollNode.destroyAllChildren()
            this.crewList = []
            this.heroEquipNode.active = false
        } else {
            this.artifactList.numItems = 0
        }
        this.closeSelectSkill()
        
        this.tabType = type
        switch (type) {
            case SELECTBTNTYPE.hero:
                this.showHeros()
                break;
            case SELECTBTNTYPE.artifact:
                this.showArtifact()
                break;
            default:
                break;
        }
    }

    refreshPanel (type: FIGHTPANELTYPE) {
        for (let i = 0; i < this.crewList.length; i++) {
            this.crewList[i].showPanel(type)
        }
    }

    showHeros () {
        let heros = this.fm.getHeros()
        for (let i = 0; i < heros.length; i++) {
            let item = cc.instantiate(this.crewItem)
            this.scrollNode.addChild(item)

            let script = item.getComponent(CrewItem)
            script.setHero(heros[i])
            script.equipCallBack = this.showRuneLayer.bind(this)
            this.crewList.push(script)
        }
        this.refreshPanel(FIGHTPANELTYPE.skill)
    }

    showArtifact () {
        this.artifactList.numItems = this.fm.artifacts.length
    }

    // 展示符文技能详情
    showRuneLayer (crewItem: CrewItem, heroId: string, index: number, equip: RUNEDATA) {

        if (this.selectEquip && equip) {
            return
        }

        // 已选择
        if (this.selectEquip) { 
            this.selectEquip.index = index
            return 
        }

        this.selectEquip = {
            heroId: heroId,
            index: index,
            equip: equip,
            item: crewItem,
        }

        if (equip) {
            this.heroDetails.active = true
            this.heroDetailScript.setData(equip)            
        } else {
            
            // 无装备
            this.customEquips = []

            //重复符文模式 添加去重处理
            if (this.fm.pveType == SCENETYPE.repeat) {
                let mapEquips: Map<number, RUNEDATA> = this.fm.equipProp.get(heroId)
                for (let i = 0; i < this.fm.equips.length; i++) {
                    let v: RUNEDATA = this.fm.equips[i]

                    let can = true
                    mapEquips.forEach((value, key) => {
                        if (value.id == v.id ) { can = false }
                    });

                    if (can) {
                        this.customEquips.push(v)
                    }
                }
            } else {
                this.customEquips = this.fm.equips
            }

            this.heroEquipNode.active = true
            this.heroList.numItems = this.customEquips.length
            this.heroList.selectedId = 0
            this.selectEquip.selectData = this.customEquips[0]
            this.showCrewList(true)
            this.showSelectEquip()
        }
    }

    // 展示符文技能详情
    showArtifactLayer (equip: RUNEDATA) {
        this.artifactDetails.active = true
        this.artifactDetailScript.setData(equip)
    }

    showCrewList (show: boolean) {
        if (show) {
            for (let i = 0; i < this.crewList.length; i++) {
                let ss = this.selectEquip.heroId == this.crewList[i].heroId
                this.crewList[i].node.active = ss
            }
        } else {
            for (let i = 0; i < this.crewList.length; i++) {
                this.crewList[i].node.active = true
            }
        }
        this.scrollNode.getComponent(cc.Layout).updateLayout();
        this.heroSkillBtn.active = !show
        this.heroAttrBtn.active = !show
        this.herohurtBtn.active = !show
        this.heroTxtNode.active = !show
    }

    closeSelectSkill () {
        this.heroEquipNode.active = false
        this.heroDetails.active = false
        this.artifactDetails.active = false
        this.showCrewList(false)
        this.selectEquip = null
        this.heroPropDes.string = ""
        this.artifactList.selectedId = -1
    }

    showSelectEquip () {
        if (this.selectEquip.selectData) {
            this.heroPropDes.string = this.selectEquip.selectData.des
        }
    }

    onHeroListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(EquipItem)
        cell.setData(this.customEquips[idx])
    }

    // 选择节点
    onSelectHeroListItem (item: cc.Node, selectedId: number, lastSelectedId: number, val: number) {
        this.selectEquip.selectData = this.customEquips[selectedId]
        this.showSelectEquip()
    }

    onArtifactListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(EquipItem)
        cell.setData(this.fm.artifacts[idx])
    }

    // 选择节点
    onSelectArtifactListItem (item: cc.Node, selectedId: number, lastSelectedId: number, val: number) {
        if (!item) { return }
        let data = this.fm.artifacts[selectedId]
        this.showArtifactLayer(data)
    }
    
    onTouchEnd (name: string) {
        if (this.fm.pveState != PVESTATE.battle) { return }

        switch (name) {
            case "heroSkillBtn":
                // 技能
                this.refreshPanel(FIGHTPANELTYPE.skill)
                break;
            case "heroAttrBtn":
                // 属性
                this.refreshPanel(FIGHTPANELTYPE.attr)
                break;
            case "herohurtBtn":
                // 伤害面板
                this.refreshPanel(FIGHTPANELTYPE.hurt)
                break;
            case "heroSelectBtn":
                // 选择技能装备
                if (!this.selectEquip || !this.selectEquip.selectData) { 
                    this.selectEquip = null
                    return 
                }

                this.fm.changeEquip(this.selectEquip)
                this.selectEquip.item.refreshEquip()
                this.closeSelectSkill()
                break;
            case "heroCancelBtn":
                // 选择技能装备
                this.closeSelectSkill()
                break;
            case "eventBtn":
                // 随机事件
                this.fm.selectRune()
                break;
            case "machineBtn":
                // 机械蛋
                this.fm.selectMachine()
                break;
            case "devilBtn":
                // 恶魔蛋
                if (!this.fm.canDevil()) { return }

                let self = this
                this.fm.pauseGame()
                GameUtils.addTips("**哈撒给**\n\n直接对场上除四大元素以外的怪物造成【当前生命值85%】的伤害", (confirm)=> {
                    if (confirm) {
                        self.fm.costDevil()
                        self.fm.killAll()
                        self.refreshDevil()
                    }
                    self.dispatchEvent_(Events.fight_resumeGame_event)
                }, TIPSTYPE.all)
                break;
            case "heroDetails":
            case "artifactDetails":
                // 详情关闭
                this.closeSelectSkill()
                break;
            case "hideBtn":
                this.isHide = !this.isHide
                this.heroBtn.node.active = !this.isHide
                this.artifactBtn.node.active = !this.isHide
                this.hideTxt.string = this.isHide ? "显示" : "隐藏"

                this.heroTabNode.active = !this.isHide && this.tabType == SELECTBTNTYPE.hero
                this.artifactTabNode.active = !this.isHide && this.tabType == SELECTBTNTYPE.artifact
                break;
            default:
                break;
        }
    }

    refreshRuneShow () {
        this.skillNum.string = this.fm.equips.length
    }
    
}