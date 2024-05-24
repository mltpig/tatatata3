import DisUtils from "../../../framework/utils/DisUtils";
import GameManager from "../../manager/GameManager";
import HeroManager from "../../manager/HeroManager";
import LayerManager from "../../manager/LayerManager";
import HeroActor from "../../model/hero/HeroActor";
import PossessHeroActor from "../../model/hero/PossessHeroActor";
import { FIGHTPANELTYPE, REFRESHINFOTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { ATTRTYPE, SKILLTYPE } from "../../other/FightEnum";
import { DS, numStr, toDecimal } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 
 */
@ccclass
export default class CrewItem extends GameView {
    private skillNode: cc.Node;
    private attrNode: cc.Node;
    private hurtNode: cc.Node;

    private heroIcon: cc.Node;
    private lvTxt: cc.Label;
    private expTxt: cc.Label;
    private lvBar: cc.ProgressBar;
    private jobNameTxt: cc.Label;
    private deputyIcon: cc.Node;

    private atkTxt: cc.Label;
    private speedTxt: cc.Label;
    private critTxt: cc.Label;
    private churtTxt: cc.Label;
    private rageTxt: cc.Label;
    private recoveryTxt: cc.Label;
    private normalTxt: cc.Label;
    private skillTxt: cc.Label;
    private skillLoads: Map<string, cc.ProgressBar> = new Map();

    private hurtBar: cc.ProgressBar;
    private hurtTxt: cc.Label;
    private hurtNumTxt: cc.Label;

    public hero: HeroActor;
    private type: FIGHTPANELTYPE;
    private timer: number = 0
    public heroId: string;              // 英雄唯一id
    public deputyId: string;            // 附身id

    private jobBtn: cc.Node;
    private isJob: boolean = false

    private equipCallBack_: Function;
    public set equipCallBack (cb: Function) {
        this.equipCallBack_ = cb
    }
    private fm;
    
    onLoad () {
        super.onLoad()

        this.skillNode = this.getNode("skillNode")
        this.attrNode = this.getNode("attrNode")
        this.hurtNode = this.getNode("hurtNode")

        this.heroIcon = this.getNode("heroIcon")
        this.deputyIcon = this.getNode("deputyIcon")
        this.lvTxt = this.getCpByType("lvTxt", cc.Label)
        this.expTxt = this.getCpByType("expTxt", cc.Label)
        this.lvBar = this.getCpByType("lvBar", cc.ProgressBar)
        this.jobNameTxt = this.getCpByType("jobNameTxt", cc.Label)
        this.jobNameTxt.string = ""

        this.atkTxt = this.getCpByType("atkTxt", cc.Label)
        this.speedTxt = this.getCpByType("speedTxt", cc.Label)
        this.critTxt = this.getCpByType("critTxt", cc.Label)
        this.churtTxt = this.getCpByType("churtTxt", cc.Label)
        this.rageTxt = this.getCpByType("rageTxt", cc.Label)
        this.recoveryTxt = this.getCpByType("recoveryTxt", cc.Label)
        this.normalTxt = this.getCpByType("normalTxt", cc.Label)
        this.skillTxt = this.getCpByType("skillTxt", cc.Label)

        this.hurtBar = this.getCpByType("hurtBar", cc.ProgressBar)
        this.hurtTxt = this.getCpByType("hurtTxt", cc.Label)
        this.hurtNumTxt = this.getCpByType("hurtNumTxt", cc.Label)

        this.jobBtn = this.getNode("jobBtn")

        this.addEventListener_(Events.fight_hero_change_event, this.addListenerChange.bind(this))
        this.addEventListener_(Events.hero_job_event, this.addListenerJob.bind(this))

        this.fm = GameManager.getFM()
    }

    showPanel (type: FIGHTPANELTYPE) {
        if (this.type == type) {
            return
        }

        this.type = type
        this.skillNode.active = this.type == FIGHTPANELTYPE.skill
        this.attrNode.active = this.type == FIGHTPANELTYPE.attr
        this.hurtNode.active = this.type == FIGHTPANELTYPE.hurt

        switch (this.type) {
            case FIGHTPANELTYPE.skill:
                this.refreshEquip()
                break;
            case FIGHTPANELTYPE.attr:
                this.refreshAttr()
                break;
            case FIGHTPANELTYPE.hurt:
                this.refreshHurt()
                break;
            default:
                break;
        }
        this.addListenerJob()
    }
    
    setHero (hero: HeroActor) {
        this.hero = hero
        this.heroId = this.hero.uid
        this.deputyId = (this.hero as PossessHeroActor).deputyId
        DisUtils.replaceSprite(PATHS.hero + "/" + this.hero.data.res, this.heroIcon)
        
        if (this.deputyId) {
            this.deputyIcon.active = true
            let heroInfo = HeroManager.getHeroDataById(this.deputyId)
            DisUtils.replaceSprite(PATHS.hero + "/" + heroInfo.res, this.deputyIcon)
        }

        this.refreshLevel()
    }

    // 刷新显示
    addListenerChange (event) {
        if (event.id == this.heroId) {
            switch (event.type) {
                case REFRESHINFOTYPE.exp:
                    this.refreshLevel()
                    break;
                case REFRESHINFOTYPE.attr:
                    this.refreshAttr()
                    break;
                case REFRESHINFOTYPE.skill:
                    this.refreshEquip()
                    break;
                default:
                    break;
            }
        }
    }

    addListenerJob () {
        if (this.hero._upJob) {
            this.jobNameTxt.string = this.hero.jobData.name
            if (this.type == FIGHTPANELTYPE.attr) {
                this.refreshAttr()
            }
        }
        this.refreshJob()
    }

    refreshLevel () {
        let upExp = this.hero._realValue.getUseAttr(ATTRTYPE.upExp)
        this.lvTxt.string = "lv." + DS(this.hero._level).toString() 
        this.lvBar.progress = (DS(this.hero._exp) / upExp)
        this.expTxt.string = DS(this.hero._exp) + "/" + upExp

        this.refreshJob()
    }

    refreshJob () {
        this.fm.checkJob(DS(this.hero._level))
        let can = !this.hero._upJob && this.fm.canJob()
        this.jobBtn.active = can
    }

    // 转职相关隐藏
    setJobHide () {
        this.jobBtn.active = false
        this.isJob = true
    }

    refreshAttr () {
        this.atkTxt.string = numStr(this.hero._realValue.getUseAttr(ATTRTYPE.attack))
        this.speedTxt.string = numStr(DS(this.hero._realValue.getFinalAttr("atkSpeed")))
        this.critTxt.string = numStr(this.hero._realValue.getUseAttr(ATTRTYPE.crit)) + "%"
        this.churtTxt.string = numStr(this.hero._realValue.getUseAttr(ATTRTYPE.critHurt)) + "%"
        this.rageTxt.string = numStr(this.hero._realValue.getUseAttr(ATTRTYPE.maxRage))
        this.recoveryTxt.string = numStr(this.hero._realValue.getUseAttr(ATTRTYPE.rage))

        this.normalTxt.string = numStr(this.hero._realValue.getHurtDetails(SKILLTYPE.normal)) + "%"
        this.skillTxt.string = numStr(this.hero._realValue.getHurtDetails(SKILLTYPE.major)) + "%"
    }

    // 显示符文 减少drawcall
    refreshEquip () {
        let heroEquip = this.fm.equipProp.get(this.heroId)
        this.skillLoads.clear()
        for (let i = 0; i < 4; i++) {
            let equip = heroEquip.get(i) as RUNEDATA
            let show = equip == null ? true : false

            this.getNode("skillAdd_" + (i + 1)).active = show
            let skillLoad = this.getNode("skillLoad_" + (i + 1))
            let runeIcon = this.getNode("runeIcon_" + (i + 1))
            let nameTxt = this.getNode("nameTxt_" + (i + 1))
            let machine = this.getNode("machine_" + (i + 1))

            let opacity1 = equip == null ? 0 : 255
            runeIcon.opacity = opacity1
            nameTxt.opacity = opacity1
            machine.active = false

            if (equip) {
                this.fm.addCdList(equip.uid, equip.cdTime)
                let pro = equip.cdTime > 0
                skillLoad.opacity = pro ? 255 : 0
                if (pro) {
                    this.skillLoads.set(equip.uid, skillLoad.getComponent(cc.ProgressBar))
                }

                DisUtils.replaceSprite(PATHS.rune + "/" + equip.img, runeIcon)
                nameTxt.getComponent(cc.Label).string = equip.name

                if (equip.machine) {
                    machine.active = true
                    nameTxt.color = cc.Color.RED;
                } else {
                    nameTxt.color = new cc.Color(247,217,61,255);
                }

            } else {
                skillLoad.opacity = 0
            }
        }
    }

    update (dt: number) {
        if (this.fm.isPause) { return }
        
        this.timer = this.timer + dt
        this.showRuneProgress()
        if (this.timer < 0.3) { return }

        this.timer = 0
        this.refreshHurt()
    }

    // 显示符文时间
    showRuneProgress () {
        if (this.type != FIGHTPANELTYPE.skill) { return }

        let self = this
        this.skillLoads.forEach((value, key) => {
            let d = self.fm.getCdList(key)
            value.progress = d.progress / d.max
        });
    }

    refreshHurt () {
        let curHurt = this.fm.heroHurt.get(this.heroId)
        let allHurt = this.fm.allHurt == 0 ? 1 : this.fm.allHurt
        let progress = curHurt / allHurt
        this.hurtBar.progress = progress
        let pro = toDecimal(progress * 100, 1)
        this.hurtTxt.string = "伤害占比" + pro + "%"
        this.hurtNumTxt.string = numStr(curHurt)
    }

    onTouchEnd (name: string) {
        if (this.isJob) { return }
        
        switch (name) {
            case "skillBtn_1":
            case "skillBtn_2":
            case "skillBtn_3":
            case "skillBtn_4":
                let str = name.split("_")
                let index = parseInt(str[1]) - 1
                let heroEquip = this.fm.equipProp.get(this.heroId)
                let equip = heroEquip.get(index)

                if (this.equipCallBack_) {
                    this.equipCallBack_(this, this.heroId, index, equip)
                }
                break;
            case "jobBtn":
                // 转职
                this.fm.pauseGame()
                LayerManager.pop({
                    script: "JobLayer",
                    prefab: PATHS.fight + "/jobLayer",
                    opacity: 180,
                    data: this.hero,
                    backClick: true,
                })   
                break;
            default:
                break;
        }
    }
}