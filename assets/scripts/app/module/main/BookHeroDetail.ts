import SelectButton from "../../../framework/creator/SelectButton";
import DisUtils from "../../../framework/utils/DisUtils";
import EventDispatcher from "../../../framework/utils/EventDispatcher";
import HeroManager from "../../manager/HeroManager";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import Contants from "../../other/Contants";
import { COMMONLOGICTYPE, SELECTBTNBIGTYPE, SELECTBTNTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import GameUtils from "../../other/GameUtils";
import { DS, mergeArray } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";
import AttrItem from "./AttrItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BookHeroDetail extends GameView {
    @property(cc.Prefab)
    attrItem: cc.Prefab = null

    private heroIcon: cc.Node;
    private stageTxt: cc.Label;
    private heroBar: cc.ProgressBar;
    private patchTxt: cc.Label;
    private nameTxt: cc.Label;
    private desTxt: cc.RichText;
    private attrNode: cc.Node;
    private costNode: cc.Node;
    private upBtn: cc.Button;
    private maxTxt: cc.Label;
    private expTxt: cc.Label;

    private heroData: HEROINFO;
    private heroLocalData: HEROLOCALDATA;

    private cost: Array<AWARDDATA>;
    private lock: boolean;
    private canUp: boolean = false;

    private selectType: SELECTBTNTYPE = SELECTBTNTYPE.none;
    private stageBtn: SelectButton;
    private lvBtn: SelectButton;

    onLoad () {
        super.onLoad()

        this.heroIcon = this.getNode("heroIcon")
        this.attrNode = this.getNode("attrNode")
        this.costNode = this.getNode("costNode")

        this.stageTxt = this.getCpByType("stageTxt", cc.Label)
        this.heroBar = this.getCpByType("heroBar", cc.ProgressBar)
        this.patchTxt = this.getCpByType("patchTxt", cc.Label)
        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
        this.desTxt = this.getCpByType("desTxt", cc.RichText)
        this.upBtn = this.getCpByType("upBtn", cc.Button) 
        this.maxTxt = this.getCpByType("maxTxt", cc.Label)
        this.expTxt = this.getCpByType("expTxt", cc.Label)

        this.stageBtn = this.getCpByType("stageBtn", SelectButton) 
        this.lvBtn = this.getCpByType("lvBtn", SelectButton) 
        this.stageBtn.selectCallback = this.clickType.bind(this)
        this.lvBtn.selectCallback = this.clickType.bind(this)
    }

    showComplete_ () {
        this.heroData = this.cusData_.heroData
        this.heroLocalData = this.cusData_.heroLocalData
        this.lock = this.cusData_.lock

        this.initView()
        this.clickType(SELECTBTNTYPE.hero_lv)
    }

    initView () {
        this.stageBtn.node.active = !this.lock
        this.lvBtn.node.active = !this.lock
        this.stageTxt.node.active = !this.lock
        this.heroBar.node.active = !this.lock
        this.patchTxt.node.active = !this.lock
        this.expTxt.node.active = !this.lock

        DisUtils.replaceSprite(PATHS.hero + "/" + this.heroData.res, this.heroIcon)

        this.nameTxt.string = this.heroData.name
        this.desTxt.string = this.heroData.des
        this.upBtn.node.active = false
    }

    clickType (type: SELECTBTNTYPE) {
        if (type == this.selectType) { return }

        // 未解锁
        if (this.lock) { return }
        this.selectType = type
        this.canUp = false
        if (type == SELECTBTNTYPE.hero_stage) {
            this.showStageUp()
        } else {
            this.showLvUp()
        }
    }

    showStageUp () {
        this.heroBar.node.active = true
        this.patchTxt.node.active = true
        this.maxTxt.node.active = false
        this.expTxt.node.active = false
        this.attrNode.destroyAllChildren()
        this.costNode.destroyAllChildren()

        this.stageTxt.string = "等阶" + DS(this.heroLocalData.level)
        let heroUpData = StaticManager.getHeroUpData(this.heroData.id, DS(this.heroLocalData.level) + 1) as HEROUPDATA

        this.showAttr(heroUpData)

        // 满阶
        if (!heroUpData) {
            this.patchTxt.string = DS(this.heroLocalData.patch) + "/满阶"
            this.heroBar.progress = 1
            this.upBtn.node.active = false
            this.maxTxt.string = "已满阶"
            this.maxTxt.node.active = true
            return
        }

        this.upBtn.node.active = true
        let cost1 = JSON.parse(heroUpData.cost_shard)
        let cost2 = JSON.parse(heroUpData.cost_gold)
        this.patchTxt.string = DS(this.heroLocalData.patch) + "/" + cost1[0].num
        this.heroBar.progress = DS(this.heroLocalData.patch) / cost1[0].num

        this.cost = mergeArray(cost1, cost2)
        GameUtils.addAward(this.cost, this.costNode, true)

        // 检测升阶
        let can1 = DS(this.heroLocalData.patch) >= cost1[0].num
        let can2 = DS(PlayerManager.playerData.gold) >= cost2[0].num
        let can = can1 && can2
        this.canUp = can
    }

    // 属性展示
    showAttr (heroUpData?: HEROUPDATA) {
        let curData: HEROATTR = HeroManager.getCurHeroData(this.heroData.id)

        for (let i = 0; i < Contants.SHOWATTR.length; i++) {
            let key = Contants.SHOWATTR[i]
            let addNum: number;
            if (heroUpData && heroUpData[key] != undefined) {
                addNum = DS(heroUpData[key])
            }

            let item = cc.instantiate(this.attrItem)
            this.attrNode.addChild(item)

            let script = item.getComponent(AttrItem)
            script.setData(key, curData[key], addNum)
        }
    }

    showLvUp () {
        this.heroBar.node.active = false
        this.patchTxt.node.active = false
        this.maxTxt.node.active = false
        this.expTxt.node.active = false
        this.costNode.destroyAllChildren()
        this.attrNode.destroyAllChildren()

        let curExpData = StaticManager.getHeroExpData(this.heroData.id, DS(this.heroLocalData.exp))
        let heroExpData = StaticManager.getHeroExpData(this.heroData.id, DS(this.heroLocalData.exp) + 1)

        let exp = curExpData ? DS(curExpData.fight_exp) : 0
        this.stageTxt.string = "初始经验" + exp
        this.stageTxt["_forceUpdateRenderData"](true);

        this.showAttr()

        // 满级
        if (!heroExpData) {
            this.upBtn.node.active = false
            this.maxTxt.string = "已满级"
            this.maxTxt.node.active = true
            return
        }

        this.expTxt.node.active = true
        this.expTxt.node.x = this.stageTxt.node.x + this.stageTxt.node.getContentSize().width + 5
        this.expTxt.string = "+" + (DS(heroExpData.fight_exp) - exp)
        this.upBtn.node.active = true
        this.cost = JSON.parse(heroExpData.cost_gold)
        GameUtils.addAward(this.cost, this.costNode, true)

        // 检测升级
        let can = DS(PlayerManager.playerData.gold) >= this.cost[0].num
        this.canUp = can
    }

    closeComplete_ () {
        super.closeComplete_()
        this.dispatchEvent_(Events.hero_update_event)
    }
    
    onTouchEnd (name: string) {
        switch (name) {
            case "upBtn":
                if (!this.canUp) {
                    GameUtils.messageHint("材料不足")                    
                    return
                }

                if (this.selectType == SELECTBTNTYPE.hero_stage) {
                    // 升阶
                    PlayerManager.costProp(this.cost)
                    this.heroLocalData = PlayerManager.heroUp(this.heroData.id)
                    this.showStageUp()

                    EventDispatcher.dispatchEvent(Events.hero_level_up)
                    
                    EventDispatcher.dispatchEvent(Events.game_logic_event, {
                        type: COMMONLOGICTYPE.level,
                        value: DS(this.heroLocalData.level),
                    })
                } else {
                    // 升级
                    PlayerManager.costProp(this.cost)
                    this.heroLocalData = PlayerManager.heroExpUp(this.heroData.id)
                    this.showLvUp()
                }
                break;
            default:
                break;
        }
    }
}