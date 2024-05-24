import Base64 from "../../../framework/utils/Base64";
import { UIACT } from "../../../framework/utils/Enumer";
import EventDispatcher from "../../../framework/utils/EventDispatcher";
import AdManager from "../../../sdk/AdManager";
import { CLOUDFUN, CLOUDTYPE } from "../../manager/CloundKey";
import GameManager from "../../manager/GameManager";
import LayerManager from "../../manager/LayerManager";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import CloudCommand from "../../net/CloudCommand";
import { COMMONLOGICTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { SCENETYPE, PVETYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { DS, ES } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 特殊关卡：通用的特殊关卡结算
 * 战斗结算
 */
@ccclass
export default class PveCommonResult extends GameView {
    private winTxt: cc.Label;
    private waveTxt: cc.Label;
    private scoreTxt: cc.Label;
    private awardNode: cc.Node;
    private exitBtn: cc.Node;
    private fightBtn: cc.Node;
    private adBtn: cc.Node;
    private adTxt: cc.Label;

    private isWin: boolean;
    private rewardData: Array<AWARDDATA>;
    private getAward: boolean = false;
    private normal: boolean;
    
    private fm = GameManager.getFM();

    onLoad () {
        super.onLoad()

        this.winTxt = this.getCpByType("winTxt", cc.Label)
        this.waveTxt = this.getCpByType("waveTxt", cc.Label)
        this.scoreTxt = this.getCpByType("scoreTxt", cc.Label)
        this.awardNode = this.getNode("awardNode")
        this.exitBtn = this.getNode("exitBtn")
        this.fightBtn = this.getNode("fightBtn")

        this.adBtn = this.getNode("adBtn")
        this.adTxt = this.getCpByType("adTxt", cc.Label)
        this.adBtn.active = false
    }

    showComplete_ () {
        this.isWin = this.cusData_
        this.initView()
        
        // 广告出现规则
        if (this.normal) {
            if (!this.isWin) { return }
        } else {
            if (DS(this.fm.curWave) < 50) { return }
        }

        // 审核
        if (PlayerManager.review) { return }

        // 检测广告限制
        if (PlayerManager.adLimit < 3) {
            this.adBtn.active = true
            this.adTxt.string = "看广告再拿奖励(" + PlayerManager.adLimit + "/3)"
        }
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "exitBtn":
                GameUtils.loadScene({
                    name: "main",
                    type: SCENETYPE.none,
                })
                break;
            case "fightBtn":
                // 重新战斗
                GameUtils.loadScene({
                    name: "pve",
                    type: this.fm.pveType,
                    mapId: this.fm.mapId,
                    waveId: this.fm.waveId,
                })
                break;
            case "hurtBtn":
                // 数据统计
                LayerManager.pop({
                    script: "HurtLayer",
                    prefab: PATHS.fight + "/hurtLayer",
                    backClick: true,
                    type: UIACT.drop_down,
                    opacity: 0,
                })   
                break;
            case "adBtn":
                // 广告
                AdManager.showAd(this.delayReward.bind(this))
                break;
            default:
                break;
        }
    }

    delayReward (ad: boolean = true) {
        this.scheduleOnce(()=> {
            this.getReward(ad)
        }, 0.2);
    }

    // 获取奖励
    getReward (ad: boolean = true) {
        if (this.getAward) { return }

        this.getAward = true
        this.adBtn.active = false
        PlayerManager.addAdLimit()
        PlayerManager.addProp(this.rewardData, true)
        
        // 广告任务
        if (ad) {
            EventDispatcher.dispatchEvent(Events.game_logic_event, {
                type: COMMONLOGICTYPE.ad,
            })
        }
    }

    initView () {
        this.winTxt.string = this.isWin ? "战斗胜利" : "战斗失败"
        this.waveTxt.string = "结算波次：" + DS(this.fm.curWave)
        this.scoreTxt.string = "总计积分：" + DS(this.fm.curScore)

        let mapId = this.fm.mapId;
        let waveId = this.fm.waveId;
        let awards = this.fm.awards                                // 随机奖励
        let lastAwards = PlayerManager.addProp(awards, false)           // 最终奖励
        this.rewardData = lastAwards
        GameUtils.addAward(lastAwards, this.awardNode)

        // 结算
        let d = StaticManager.getWaveData(waveId) as WAVEDATA
        this.normal = d.type != PVETYPE.endless
        let locald = PlayerManager.mapData
        let data: MAPLOCALDATA;
        for (let i = 0; i < locald.length; i++) {
            if (locald[i].id == mapId) {
                data = locald[i]
                break
            }
        }
        
        let fix: boolean = false
        if (this.isWin) {
            if (this.normal) {
                // 打当前已解锁最大关卡
                if (parseInt(waveId) == parseInt(data.waveId)) {
                    data.waveId = d.nextId.toString()
                    data.wave = ES(0)
                    data.score = ES(0)
                    fix = true
                }
            }
        } else {
            if (this.normal) {
                let change = DS(this.fm.curWave) > DS(data.wave)
                data.wave = change ? this.fm.curWave : data.wave
                data.score = change ? this.fm.curScore : data.score
                fix = change
            } else {
                let change = DS(this.fm.curScore) > DS(data.endlessScore)
                data.endlessWave = change ? this.fm.curWave : data.endlessWave
                data.endlessScore = change ? this.fm.curScore : data.endlessScore
                fix = change
            }
        }
        // 本地数据更新
        if (fix) {
            PlayerManager.mapCommand(data)
        }
        PlayerManager.updateTaskState()

        if (this.fm.pveType == SCENETYPE.common) { return }
        
        let self = this
        let updateEnd = function () {
            self.exitBtn.active = true
            self.fightBtn.active = true
        }
        
        if (this.normal) {
            updateEnd()
            return
        }
        
        // 离线模式
        if (PlayerManager.isOutLine) {
            updateEnd()
            return 
        }
        
        let mapData: MAPDATA = StaticManager.getStaticValue("static_special_map_data", mapId)
        let index = mapData.index

        let secret = Base64.encode(PlayerManager.uid + DS(this.fm.curWave) + DS(this.fm.curScore))
        new CloudCommand(CLOUDFUN.updateServerRank, CLOUDTYPE.func, {
            uid: PlayerManager.uid,
            index: index,
            runeType: GameManager.runeType,
            data: {
                uid: PlayerManager.uid,
                name: PlayerManager.playerData.name,
                wave: DS(this.fm.curWave),
                score: DS(this.fm.curScore),
                secret: secret,
            }
        }, updateEnd)

    }
}