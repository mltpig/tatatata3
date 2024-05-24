import List from "../../../framework/creator/List";
import SelectButton from "../../../framework/creator/SelectButton";
import GameManager from "../../manager/GameManager";
import StaticManager from "../../manager/StaticManager";
import { FIGHTPANELTYPE, SELECTBTNTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { DEFENDSHOPTYPE, PVESTATE, RUNETYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { checkArrayIn, DS, random1 } from "../../other/Global";
import GameView from "../GameView";
import CrewItem from "../pve/CrewItem";
import EquipItem from "../pve/EquipItem";
import SkillLayer from "../pve/SkillLayer";
import ShieldIcon from "./ShieldIcon";
import ShopItem from "./ShopItem";

const {ccclass, property} = cc._decorator;

/**
 * 特殊关卡：防守
 * 显示界面
 */
@ccclass
export default class DefendLayer extends GameView {
    @property(cc.Prefab)
    crewItem: cc.Prefab = null;

    @property(cc.Prefab)
    skillLayer: cc.Prefab = null;

    @property(cc.Prefab)
    equipItem: cc.Prefab = null;

    @property(cc.Prefab)
    shopItem: cc.Prefab = null;

    private frontNode: cc.Node;
    private behindNode: cc.Node;

    private heroBtn: SelectButton;    
    private artifactBtn: SelectButton;    
    private shopBtn: SelectButton;    

    private heroTabNode: cc.Node;
    private heroEquipNode: cc.Node;
    private heroList: List;
    private artifactTabNode: cc.Node;
    private artifactList: List;
    private shopTabNode: cc.Node;
    private shopLayout: cc.Node;

    private scrollNode: cc.Node;
    private heroDetails: cc.Node;
    private artifactDetails: cc.Node;
    private heroPropDes: cc.Label;
    private timeTxt: cc.Label;
    private soulTxt: cc.Label;
    private costNum: cc.Label;

    private refreshTime: number = 0
    private tabType: SELECTBTNTYPE;
    private crewList: Array<CrewItem> = [];

    private selectEquip: SELECTHERODATA;        // 选择的技能
    private heroDetailScript: SkillLayer;
    private artifactDetailScript: SkillLayer;
    
    private fm;
    private shopRune: Array<RUNEDATA> = [];
    private shopList: Array<ShopItem> = [];

    private shieldListNode: cc.Node;
    private shieldListScroll: cc.ScrollView;
    public shieldList: List;

    onLoad () {
        super.onLoad()

        this.frontNode = this.getNode("frontNode")
        this.behindNode = this.getNode("behindNode")

        this.heroBtn = this.getCpByType("heroBtn", SelectButton)
        this.artifactBtn = this.getCpByType("artifactBtn", SelectButton)
        this.shopBtn = this.getCpByType("shopBtn", SelectButton)
        this.heroBtn.selectCallback = this.selectClick.bind(this)
        this.artifactBtn.selectCallback = this.selectClick.bind(this)
        this.shopBtn.selectCallback = this.selectClick.bind(this)

        this.heroTabNode = this.getNode("heroTabNode")
        this.heroEquipNode = this.getNode("heroEquipNode")
        this.artifactTabNode = this.getNode("artifactTabNode")
        this.scrollNode = this.getNode("scrollNode")
        this.shopTabNode = this.getNode("shopTabNode")
        this.shopLayout = this.getNode("shopLayout")
        this.heroPropDes = this.getCpByType("heroPropDes", cc.Label)
        this.timeTxt = this.getCpByType("timeTxt", cc.Label)
        this.soulTxt = this.getCpByType("soulTxt", cc.Label)
        this.costNum = this.getCpByType("costNum", cc.Label)
        this.shieldListNode = this.getNode("shieldList")
        this.shieldListScroll = this.getCpByType("shieldList", cc.ScrollView)

        this.heroList = this.getCpByType("heroList", List)
        this.artifactList = this.getCpByType("artifactList", List)
        this.shieldList = this.getCpByType("shieldList", List)

        this.heroDetails = this.getNode("heroDetails")
        this.artifactDetails = this.getNode("artifactDetails")

        this.heroEquipNode.active = false
        this.heroDetails.active = false
        this.artifactDetails.active = false
        this.behindNode.active = false

        this.fm = GameManager.getFM()

        this.addEventListener_(Events.game_show_skill, this.showShieldList.bind(this))
        this.addEventListener_(Events.game_refresh_shield_event, this.refreshShopItem.bind(this))
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
        this.costNum.string = DS(this.fm.refreshCost).toString()
        this.shopRune = this.getShopRuneData(3)
    }
    
    update (dt: number) {
        if (this.fm.isPause) { return }

        this.refreshTime = this.refreshTime + dt
        if (this.refreshTime < 0.5) { return }

        this.refreshTime = 0
        
        this.timeTxt.string = Math.ceil(DS(this.fm.maxTime) - DS(this.fm.timer)).toString() 
        this.soulTxt.string = DS(this.fm.soulNum).toString()
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
            case SELECTBTNTYPE.shop:
                // 商店
                this.showTabItem(SELECTBTNTYPE.shop)
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
        this.shopTabNode.active = type == SELECTBTNTYPE.shop

        if (this.tabType == SELECTBTNTYPE.hero) {
            this.heroList.numItems = 0
            this.scrollNode.destroyAllChildren()
            this.crewList = []
            this.heroEquipNode.active = false
        } else if (this.tabType == SELECTBTNTYPE.artifact) {
            this.artifactList.numItems = 0
        } else {
            this.shopLayout.destroyAllChildren()
            this.shopList = []
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
            case SELECTBTNTYPE.shop:
                this.showShop()
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

    showShop () {
        // 盾牌
        let shields = StaticManager.getStaticValues("static_shield") as Array<SHIELDDATA>
        for (let i = 0; i < 3; i++) {
            let item = cc.instantiate(this.shopItem)
            this.shopLayout.addChild(item)

            let script = item.getComponent(ShopItem)
            script.setType(DEFENDSHOPTYPE.shield, i)
            script.setShield(shields[i])
            script.refreshCallback = this.refreshShopItem.bind(this)
            this.shopList.push(script)
        }

        // 符文神器
        for (let i = 0; i < 3; i++) {
            let item = cc.instantiate(this.shopItem)
            this.shopLayout.addChild(item)

            let script = item.getComponent(ShopItem)
            script.setType(DEFENDSHOPTYPE.rune, i+3)
            script.setRuneData(this.shopRune[i])
            script.refreshCallback = this.refreshShopItem.bind(this)
            this.shopList.push(script)
        }
    }
    
    refreshShopItem (event) {
        let type = event.type
        let index = event.index
        if (type == DEFENDSHOPTYPE.shield) {
            this.shieldList.numItems = this.fm.shieldDefendList.length
        } else {
            for (let i = 0; i < this.shopList.length; i++) {
                if (i == index) {
                    let runeData = this.getShopRuneData(1)
                    this.shopList[i].setRuneData(runeData[0])
                    break;
                }
            }
        }
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
            this.heroEquipNode.active = true
            this.heroList.numItems = this.fm.equips.length
            this.heroList.selectedId = 0
            this.selectEquip.selectData = this.fm.equips[0]
            this.showCrewList(true)
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
    }

    closeSelectSkill () {
        this.heroEquipNode.active = false
        this.heroDetails.active = false
        this.artifactDetails.active = false
        this.showCrewList(false)
        this.selectEquip = null
    }

    showSelectEquip () {
        if (this.selectEquip.selectData) {
            this.heroPropDes.string = this.selectEquip.selectData.des
        }
    }

    onHeroListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(EquipItem)
        cell.setData(this.fm.equips[idx])
    }

    // 选择节点
    onSelectHeroListItem (item: cc.Node, selectedId: number, lastSelectedId: number, val: number) {
        this.selectEquip.selectData = this.fm.equips[selectedId]
        this.showSelectEquip()
    }

    onArtifactListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(EquipItem)
        cell.setData(this.fm.artifacts[idx])
    }

    // 选择节点
    onSelectArtifactListItem (item: cc.Node, selectedId: number, lastSelectedId: number, val: number) {
        let data = this.fm.artifacts[selectedId]
        this.showArtifactLayer(data)
    }

    // 盾
    onShieldListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(ShieldIcon)
        cell.setData(this.fm.shieldDefendList[idx])
    }

    // 刷新
    getShopRuneData (num: number): Array<RUNEDATA> {
        let list: Array<RUNEDATA> = []
        let runeDatas = StaticManager.getRune() as Array<RUNEDATA>
        // 去重
        for (let i = 0; i < runeDatas.length; i++) {
            if (runeDatas[i].type == RUNETYPE.rune) {
                if (checkArrayIn(this.fm.gainEquips, runeDatas[i].id)) {
                    runeDatas.splice(i,1)
                    i--
                }
            }
        }
        // 随机
        for (let i = 0; i < 3; i++) {
            let index = random1(0, runeDatas.length)
            let runeData = runeDatas[index]
            if (runeData) {
                list.push(runeData)
                runeDatas.splice(index,1)
            }
        }
        return list
    }

    showShieldList (event) {
        this.shieldListNode.opacity = event ? 255 : 0
        // this.shieldListScroll.enabled = event
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
                if (!this.selectEquip.selectData) { 
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
            case "heroDetails":
            case "artifactDetails":
                // 详情关闭
                this.closeSelectSkill()
                break;
            case "shopRefreshBtn":
                // 商店刷新
                if (!this.fm.checkSoul(DS(this.fm.refreshCost))) {
                    GameUtils.messageHint("灵魂点不足!")
                    return 
                }

                this.fm.costSoul(DS(this.fm.refreshCost))

                this.shopRune = this.getShopRuneData(3)
                this.tabType = SELECTBTNTYPE.none
                this.showTabItem(SELECTBTNTYPE.shop)
                break;
            default:
                break;
        }
    }
}