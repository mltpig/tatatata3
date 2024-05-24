import DisUtils from "../../../framework/utils/DisUtils";
import GameManager from "../../manager/GameManager";
import StaticManager from "../../manager/StaticManager";
import HeroActor from "../../model/hero/HeroActor";
import { FIGHTPANELTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { JOBTYPE, SCENETYPE } from "../../other/FightEnum";
import { checkArrayIn, DS } from "../../other/Global";
import GameView from "../GameView";
import CrewItem from "./CrewItem";

const {ccclass, property} = cc._decorator;

/**
 * 转职界面
 */
@ccclass
export default class JobLayer extends GameView {
    @property(cc.Prefab)
    crewItem: cc.Prefab = null;

    private heroNode: cc.Node;   
    private numTxt: cc.Label;
    private jobDesTxt: cc.Label;
    private tipsTtx: cc.Label;
    private hero: HeroActor;
    private jobBtn: cc.Button;

    public jobData: JOBDATA;
    private fm = GameManager.getFM();
    public selectList: Array<number> = [];
    private desList: Array<string> = [];

    onLoad () {
        super.onLoad()

        this.heroNode = this.getNode("heroNode")
        this.numTxt = this.getCpByType("numTxt", cc.Label)
        this.jobDesTxt = this.getCpByType("jobDesTxt", cc.Label)
        this.tipsTtx = this.getCpByType("tipsTtx", cc.Label)
        this.jobBtn = this.getCpByType("jobBtn", cc.Button)

        for (let i = 1; i <= JOBTYPE.length; i++) {
            this.getNode("selectBg_" + i).opacity = 0
        }
    }

    // 弹出动作结束
    showComplete_ () {
        this.hero = this.cusData_

        let first = this.hero.uid == this.fm.getHeros()[0].uid
        for (let i = 1; i <= JOBTYPE.length; i++) {
            if (first && i == JOBTYPE.rune) {
                // 首位不可选择符文大师
                this.desList[i] = "第一个上阵的英雄无法获得该能力"
                DisUtils.gray(this.getCpByType("jobSp_Icon_" + i, cc.Sprite))
                continue
            }

            if ((i == JOBTYPE.rune || i == JOBTYPE.energy) && this.fm.pveType == SCENETYPE.repeat) {
                // 特殊模式不可选择符文大师/能源专家
                if (i == JOBTYPE.rune) {
                    this.desList[i] = "该模式下无法觉醒符文大师"
                } else if (i == JOBTYPE.energy) {
                    this.desList[i] = "该模式下无法觉醒符文能源"
                }

                DisUtils.gray(this.getCpByType("jobSp_Icon_" + i, cc.Sprite))
                continue
            }

            if (!checkArrayIn(this.fm.jobList, i)) {
                this.selectList.push(i)
                this.desList[i] = ""
            } else {
                this.desList[i] = "当前能力已被其他角色觉醒"
                DisUtils.gray(this.getCpByType("jobSp_Icon_" + i, cc.Sprite))
            }
        }

        this.initView()
    }

    initView () {
        this.numTxt.string = DS(this.fm.curJob).toString()

        let initIndex = this.selectList[0]
        this.selectJob(initIndex)

        let item = cc.instantiate(this.crewItem)
        this.heroNode.addChild(item)

        let script = item.getComponent(CrewItem)
        script.setHero(this.hero)
        script.showPanel(FIGHTPANELTYPE.skill)
        script.setJobHide()
    }

    selectJob (index: number) {
        let data = StaticManager.getJobData(index)
        this.jobDesTxt.string = data.des
        for (let i = 0; i < this.selectList.length; i++) {
            let v = this.selectList[i]
            this.getNode("selectBg_" + v).opacity = v == index ? 255 : 0
        }

        let can: boolean = checkArrayIn(this.selectList, index)
        this.jobBtn.interactable = can 
        this.tipsTtx.string = this.desList[index]
        if (can) {
            this.jobData = data
        }
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "jobSp_1":
            case "jobSp_2":
            case "jobSp_3":
            case "jobSp_4":
            case "jobSp_5":
            case "jobSp_6":
            case "jobSp_7":
            case "jobSp_8":
            case "jobSp_9":
                let strList = name.split("_")
                this.selectJob(parseInt(strList[1]))
                break;
            case "jobBtn":
                // 确认转职
                this.fm.setJob(this.hero, this.jobData)
                this.close_()
                this.dispatchEvent_(Events.fight_resumeGame_event)
                break;
            default:
                break;
        }
    }
}