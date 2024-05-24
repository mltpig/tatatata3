import DisUtils from "../../../framework/utils/DisUtils";
import GameManager from "../../manager/GameManager";
import LayerManager from "../../manager/LayerManager";
import StaticManager from "../../manager/StaticManager";
import FightManager from "../../model/FightManager";
import HeroActor from "../../model/hero/HeroActor";
import Events from "../../other/Events";
import { MONSTERTYPE, PVESTATE, SCENETYPE, SEASONTYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { DS, ES, random1 } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 战斗操作界面
 */
@ccclass
export default class HandleLayer extends GameView {
    private frontNode: cc.Node;
    private behindNode: cc.Node;

    private cancelBg: cc.Node;
    private skillDesBg: cc.Node;
    private skillDesTxt: cc.Label;
    private pauseTxt: cc.Label;
    private pauseIcon: cc.Node;
    private speedTxt: cc.Label;
    private autoTxt: cc.Label;
    private openTxt: cc.Label;
    private heroNode: cc.Node;
    private autoNode: cc.Node;
    private autoList: Map<string, cc.Toggle> = new Map();
    private autoBtn: cc.Node;

    private seasonNode: cc.Node;
    private season_sp1: cc.Sprite;
    private season_sp2: cc.Sprite;
    private season_sp3: cc.Sprite;
    private season_sp4: cc.Sprite;
    private season_lv_txt1: cc.Label;
    private season_lv_txt2: cc.Label;
    private season_lv_txt3: cc.Label;
    private season_lv_txt4: cc.Label;
    private season_txt1: cc.Label;
    private season_txt2: cc.Label;
    private season_txt3: cc.Label;
    private season_txt4: cc.Label;
    private season_kill_txt1: cc.Label;
    private season_kill_txt2: cc.Label;
    private season_kill_txt3: cc.Label;
    private season_kill_txt4: cc.Label;

    // 元素化当前类型
    private seasonIndex: number = -1;        
    // 元素化等级
    private seasonLv: string = ES(1);
    // 元素化状态
    private seasonState: number = 0;
    // 元素怪物数量
    private seasonNum: string = ES(0);
    // 元素击杀数据
    private seasonMap: Map<SEASONTYPE, number> = new Map()

    private seasonTime: number = 0

    private auto: boolean = false;
    private open: boolean = true;
    private fm: FightManager;

    onLoad () {
        super.onLoad()

        this.frontNode = this.getNode("frontNode")
        this.behindNode = this.getNode("behindNode")

        this.cancelBg = this.getNode("cancelBg")
        this.skillDesBg = this.getNode("skillDesBg")
        this.skillDesTxt = this.getCpByType("skillDesTxt", cc.Label)
        this.pauseTxt = this.getCpByType("pauseTxt", cc.Label)
        this.pauseIcon = this.getNode("pauseIcon")
        this.speedTxt = this.getCpByType("speedTxt", cc.Label)
        this.heroNode = this.getNode("heroNode")
        this.autoNode = this.getNode("autoList")
        this.seasonNode = this.getNode("seasonNode")
        this.autoTxt = this.getCpByType("autoTxt", cc.Label)
        this.openTxt = this.getCpByType("openTxt", cc.Label)
        this.autoBtn = this.getNode("autoBtn")

        this.season_sp1 = this.getCpByType("season_sp1", cc.Sprite)
        this.season_sp2 = this.getCpByType("season_sp2", cc.Sprite)
        this.season_sp3 = this.getCpByType("season_sp3", cc.Sprite)
        this.season_sp4 = this.getCpByType("season_sp4", cc.Sprite)
        this.season_lv_txt1 = this.getCpByType("season_lv_txt1", cc.Label)
        this.season_lv_txt2 = this.getCpByType("season_lv_txt2", cc.Label)
        this.season_lv_txt3 = this.getCpByType("season_lv_txt3", cc.Label)
        this.season_lv_txt4 = this.getCpByType("season_lv_txt4", cc.Label)
        this.season_txt1 = this.getCpByType("season_txt1", cc.Label)
        this.season_txt2 = this.getCpByType("season_txt2", cc.Label)
        this.season_txt3 = this.getCpByType("season_txt3", cc.Label)
        this.season_txt4 = this.getCpByType("season_txt4", cc.Label)
        this.season_kill_txt1 = this.getCpByType("season_kill_txt1", cc.Label)
        this.season_kill_txt2 = this.getCpByType("season_kill_txt2", cc.Label)
        this.season_kill_txt3 = this.getCpByType("season_kill_txt3", cc.Label)
        this.season_kill_txt4 = this.getCpByType("season_kill_txt4", cc.Label)

        this.behindNode.active = false
        this.seasonNode.active = false
        this.showCancel(false)
        for (let i = 1; i <= 4; i++) {
            this["season_txt" + i].node.active = false
            this["season_lv_txt" + i].string = "lv.1"
            this["season_kill_txt" + i].string = "击杀0"
        }
        
        this.fm = GameManager.getFM()

        this.addEventListener_(Events.fight_resumeGame_event, this.goFight.bind(this))
        this.addEventListener_(Events.open_fight_season, this.showSeasonOpen.bind(this))
        this.addEventListener_(Events.fight_season_event, this.updateSeason.bind(this))
    }

    startFight () {
        this.frontNode.active = false
        this.behindNode.active = true
        this.initAutoList()
    }

    showCancel (show: boolean) {
        this.cancelBg.opacity = 180
        this.cancelBg.active = show
        this.skillDesBg.active = show
        this.dispatchEvent_(Events.game_show_skill, show)
        
        if (!this.fm || !this.fm.seasonOpen) { return }
        this.seasonNode.active = !show
    }

    showSeasonOpen () {
        this.seasonNode.active = true
    }

    changeCancel (show: boolean) {
        let op = show ? 255 : 180
        this.cancelBg.opacity = op
    }

    showSkillDes (des: string) {
        this.skillDesTxt.string = des
    }
    
    getCancelRect (): cc.Rect {
        return this.cancelBg.getBoundingBoxToWorld()
    }
    
    // 继续战斗
    goFight () {
        this.pauseTxt.string = "暂停"
        this.pauseIcon.color = cc.Color.WHITE
        this.pauseTxt.node.color = cc.Color.WHITE
        this.fm.resumeGame()
    }

    initAutoList () {
        let heros = this.fm.getHeros() as Array<HeroActor>
        if (heros.length == 0) {
            this.heroNode.active = false
            return
        }

        for (let i = 0; i < heros.length; i++) {
            let node: cc.Node
            if (i == 0) {
                node = this.heroNode
            } else {
                node = cc.instantiate(this.heroNode)
                this.autoNode.addChild(node)
            }
            let icon = node.getChildByName("heroIcon")
            DisUtils.replaceSprite(PATHS.hero + "/" + heros[i].data.res, icon)

            let toggle = node.getChildByName("heroToggle").getComponent(cc.Toggle)
            toggle.node.on('toggle', this.changeAuto, this);
            this.autoList.set(heros[i].uid, toggle)
        }
    }

    changeAuto () {
        let autos: Map<string, boolean> = new Map()
        this.autoList.forEach((value, key) => {
            autos.set(key, value.isChecked)
        });
        this.fm.updateAuto(autos)
    }
    
    onTouchEnd (name: string) {
        switch (name) {
            case "backBtn":
                // 退出战斗
                GameUtils.loadScene({
                    name: "main",
                    type: SCENETYPE.none,
                })
                break;
            default:
                break;
        }
        
        if (this.fm.pveState != PVESTATE.battle) { return }

        switch (name) {
            case "closeBtn":
                // 结算退出
                this.fm.pauseGame()
                LayerManager.pop({
                    script: "PveSet",
                    prefab: PATHS.fight + "/pveSet",
                    opacity: 180,
                })
                break;
            case "pauseBtn":
                // 暂停 | 继续
                if (this.fm.isPause) {
                    this.goFight()
                } else {
                    this.pauseTxt.string = "继续"
                    this.pauseIcon.color = cc.color(102, 195, 252, 255)
                    this.pauseTxt.node.color = cc.color(102, 195, 252, 255)
                    this.fm.pauseGame()
                }
                break;
            case "autoBtn":
                // 自动施法处理
                if (this.auto) {
                    this.autoTxt.string = "全自动"
                    this.autoList.forEach((value, key) => {
                        value.uncheck()
                    });
                } else {
                    this.autoTxt.string = "全手动"
                    this.autoList.forEach((value, key) => {
                        value.check()
                    });
                }
                this.auto = !this.auto
                this.changeAuto()
                break;
            case "openBtn":
                if (this.open) {
                    this.openTxt.string = "展开"
                } else {
                    this.openTxt.string = "收缩"
                }
                this.open = !this.open
                this.autoNode.active = this.open
                this.autoBtn.active = this.open
                break;
            case "speedBtn":
                // 游戏加速
                if (DS(this.fm.speed) == 1) {
                    this.fm.speed = ES(2)
                    this.speedTxt.string = "x2"
                    this.fm.setTimeScale(2);
                }else if (DS(this.fm.speed) == 2) {
                    this.fm.speed = ES(3)
                    this.speedTxt.string = "x3"
                    this.fm.setTimeScale(3);
                } else {
                    this.fm.speed = ES(1)
                    this.speedTxt.string = "x1"
                    this.fm.setTimeScale(1);
                }
                break;
            case "season_bg1":
                // 元素1
                if (this.checkSeason(SEASONTYPE.water)) {
                    this.openSeason(SEASONTYPE.water)
                }
                break;
            case "season_bg2":
                // 元素2
                if (this.checkSeason(SEASONTYPE.fire)) {
                    this.openSeason(SEASONTYPE.fire)
                }
                break;
            case "season_bg3":
                // 元素3
                if (this.checkSeason(SEASONTYPE.thunder)) {
                    this.openSeason(SEASONTYPE.thunder)
                }
                break;
            case "season_bg4":
                // 元素4
                if (this.checkSeason(SEASONTYPE.electric)) {
                    this.openSeason(SEASONTYPE.electric)
                }
                break;
            default:
                break;
        }
    }

    // 检查可元素化中
    checkSeason (type: SEASONTYPE): boolean {
        // 达上限
        let data = StaticManager.getElementStage(DS(this.seasonLv), type) as SEASONDATA
        if (!data) {
            GameUtils.messageHint("元素怪被你打完了，求求你别打了")
            return false
        }

        return this.seasonState == 0
    }

    // 遍历cd
    update2 (dt: number) {
        if (!this.fm || !this.fm.seasonOpen) { return }
        if (this.seasonIndex < 0) { return }
        if (this.seasonState != 2) { return }

        let cd: number = DS(this.fm.seasonCd)
        if (cd < 0) {
            this.seasonState = 0;
            this.fm.seasonCd = ES(0);
            this.seasonTime = 0
            this["season_txt" + this.seasonIndex].string = "";
            this["season_txt" + this.seasonIndex].node.active = false;

            for (let i = 1; i <= 4; i++) {
                if (i != this.seasonIndex) {
                    DisUtils.noGray(this["season_sp" + i])
                }
                this["season_lv_txt" + i].node.active = true;
            }
            this.seasonIndex = -1
        } else {
            if (this.seasonTime <= 0) {
                this.seasonTime = 1
                this["season_txt" + this.seasonIndex].string = Math.ceil(cd).toString();
            } else {
                this.seasonTime = this.seasonTime - dt
            }
        }
    }

    // 开启某个类型元素化
    openSeason (type: SEASONTYPE) {
        // 已开启
        if (this.seasonIndex > 0) { return }

        let index: number = DS(this.seasonLv)
        let outMonsters: Array<MONSTERQUEUE> = [];
        let paths: Array<number> = JSON.parse(this.fm.getStageData().route)
        let data = StaticManager.getElementStage(index, type) as SEASONDATA
        let out = JSON.parse(data.monsters)
        let delay = data.monsters_times
        let maxNum: number = 0
        for (let i = 0; i < out.length; i++) {
            let id = out[i][0]
            let num = out[i][1]
            maxNum = maxNum + num
            for (let j = 0; j < num; j++) {
                let t = {
                    delayStep: DS(this.fm.timer) + j * delay,
                    id: id,
                    pathId: paths[random1(0,paths.length)].toString(),
                    rate: ES(data.hp_rate),
                    level: ES(data.lv),
                    season: true,
                }
                outMonsters.push(t)
            }
        }
        this.fm.addOutMonsters(outMonsters)

        this.seasonLv = ES(index + 1);
        this.seasonIndex = type;
        this.seasonState = 1;
        this.seasonNum = ES(maxNum)
        
        this["season_lv_txt" + this.seasonIndex].string = "进行中"
        for (let i = 1; i <= 4; i++) {
            if (i != this.seasonIndex) {
                DisUtils.gray(this["season_sp" + i])
                this["season_lv_txt" + i].node.active = false
                this["season_lv_txt" + i].string = "lv." + DS(this.seasonLv)
            }
        }
    }

    // 开启中怪物全部被击杀，则进入cd
    // 刷新显示
    updateSeason (event) {
        let type: SEASONTYPE;
        switch (event) {
            case MONSTERTYPE.water:
                type = SEASONTYPE.water
                break;
            case MONSTERTYPE.fire:
                type = SEASONTYPE.fire
                break;
            case MONSTERTYPE.thunder:
                type = SEASONTYPE.thunder
                break;
            case MONSTERTYPE.electric:
                type = SEASONTYPE.electric
                break;
            default:
                break;
        }
        if (!type) { return }

        let m: number = DS(this.seasonNum) - 1
        this.seasonNum = ES(m)
        if (m <= 0) {
            // 触发奖励
            switch (type) {
                case SEASONTYPE.water:
                    // 获取2金蛋
                    this.fm.addRandom(5)
                    break;
                case SEASONTYPE.fire:
                    // 增加英雄伤害
                    this.fm.addSeasonHeroBuffs(["90002"])
                    break;
                case SEASONTYPE.thunder:
                    // 怪物受到伤害增加
                    this.fm.addSeasonMonsterBuffs(["90003"])
                    break;
                case SEASONTYPE.electric:
                    // 获取恶魔蛋
                    this.fm.addDevil()
                    break;
                default:
                    break;
            }

            this.seasonState = 2
            this.fm.seasonCd = ES(60);
            this["season_txt" + this.seasonIndex].string = "";
            this["season_txt" + this.seasonIndex].node.active = true;
            this["season_lv_txt" + this.seasonIndex].node.active = false
            this["season_lv_txt" + this.seasonIndex].string = "lv." + DS(this.seasonLv)

            let num = this.seasonMap.get(type)
            num = num ? num : 0
            num = num + 1
            this.seasonMap.set(type, num)
            this["season_kill_txt" + type].string = "击杀" + num
        }
    }
}
