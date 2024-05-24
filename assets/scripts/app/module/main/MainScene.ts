import { UIACT } from "../../../framework/utils/Enumer";
import LocalDataManager from "../../../framework/utils/LocalDataManager";
import LayerManager from "../../manager/LayerManager";
import PlayerManager from "../../manager/PlayerManager";
import { REDDOTTYPE, SELECTBTNTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { SCENETYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { DS, numStr } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MainScene extends GameView {
    private coinLabel: cc.Label;
    private awardRed: cc.Node;
    private backData: FIGHTBACKDATA;

    onLoad () {
        super.onLoad()

        this.coinLabel = this.getCpByType("coinLabel", cc.Label)
        this.awardRed = this.getNode("awardRed")

        PlayerManager.refreshReddotData()       // 刷新

        this.refreshGold()
        this.refreshRed()

        if (PlayerManager.review) {
            // 审核
            this.getNode("adBtn").active = false
            this.getNode("worldBtn").setContentSize(250, 380)
            this.getNode("worldBtn").setPosition(530, 39)
        }

        this.addEventListener_(Events.game_gold_change_event, this.refreshGold.bind(this))
        this.addEventListener_(Events.game_reddot_event, this.refreshRed.bind(this))
    }

    start() {
        this.addMaskUse()
    }   
    
    refreshGold () {
        this.coinLabel.string = numStr(DS(PlayerManager.playerData.gold))
    }

    refreshRed () {
        this.awardRed.active = PlayerManager.getReddot(REDDOTTYPE.award)
    }
    
    onTouchEnd (name: string) {
        switch (name) {
            case "mapBtn":
                // 关卡
                LayerManager.pop({
                    script: "MapLayer",
                    prefab: PATHS.main + "/mapLayer",
                    opacity: 255,
                    fit: true,
                    data: SELECTBTNTYPE.model_normal,
                })   
                break;
            case "worldBtn":
                // 特殊关卡
                LayerManager.pop({
                    script: "MapLayer",
                    prefab: PATHS.main + "/mapLayer",
                    opacity: 255,
                    fit: true,
                    data: SELECTBTNTYPE.model_dream,
                })   
                break;
            case "bookBtn":
                // 图鉴
                LayerManager.pop({
                    script: "BookLayer",
                    prefab: PATHS.main + "/bookLayer",
                    opacity: 255,
                    fit: true,
                })   
                break;
            case "rankBtn":
                if (PlayerManager.isOutLine) {
                    GameUtils.messageHint("离线模式无法使用该功能")
                    return 
                }
                
                // 排行
                LayerManager.pop({
                    script: "RankLayer",
                    prefab: PATHS.main + "/rankLayer",
                    opacity: 255,
                    fit: true,
                })   
                break;
            case "awardBtn":
                if (PlayerManager.isOutLine) {
                    GameUtils.messageHint("离线模式无法使用该功能")
                    return 
                }

                // 奖励
                LayerManager.pop({
                    script: "AwardLayer",
                    prefab: PATHS.main + "/awardLayer",
                    opacity: 255,
                    fit: true,
                })   
                break;
            case "setBtn":
                // 设置
                LayerManager.pop({
                    script: "PlayLayer",
                    prefab: PATHS.set + "/playLayer",
                    backClick: true,
                    type: UIACT.drop_down,
                })   
                break;
            case "clearBtn":
                // 清除
                PlayerManager.clearLocalStorage()
                cc.game.end()
                break;
            case "adBtn":
                if (PlayerManager.isOutLine) {
                    GameUtils.messageHint("离线模式无法使用该功能")
                    return 
                }

                // 瓜摊
                LayerManager.pop({
                    script: "AdLayer",
                    prefab: PATHS.main + "/adLayer",
                    opacity: 255,
                    fit: true,
                })   
                break;
            default:
                break;
        }
    }
}