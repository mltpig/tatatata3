import EventDispatcher from "../../framework/utils/EventDispatcher";
import { ACHIEVETYPE, COMMONLOGICTYPE, DAILYTYPE } from "../other/Enum";
import Events from "../other/Events";
import PlayerManager from "./PlayerManager";

/**
 * 游戏内所有状态逻辑的处理
 */
class LogicManager {
    private static instance_: LogicManager
    static getInstance (): LogicManager {
        if (!this.instance_) {
            this.instance_ = new LogicManager()
        }
        return LogicManager.instance_
    }
    
    init () {
        EventDispatcher.addEventListener(Events.game_logic_event, this.commonDeal, this)
    }
    
    commonDeal (data) {
        switch (data.type) {
            case COMMONLOGICTYPE.login:
                break;
            case COMMONLOGICTYPE.ad:
                this.dealAd()
                break;
            case COMMONLOGICTYPE.map:
                this.dealMap()
                break;
            case COMMONLOGICTYPE.kill:
                this.dealKill()
                break;
            case COMMONLOGICTYPE.rune:
                this.dealRune()
                break;
            case COMMONLOGICTYPE.box:
                this.dealBox()
                break;
            case COMMONLOGICTYPE.pass:
                this.dealWavePass(data)
                break;
            case COMMONLOGICTYPE.wave:
                this.dealWave(data)
                break;
            case COMMONLOGICTYPE.hurt:
                this.dealHurt(data)
                break;
            case COMMONLOGICTYPE.level:
                this.dealHeroLv(data)
                break;
            case COMMONLOGICTYPE.diff:
                this.dealWaveDiff(data)
                break;
            default:
                break;
        }

        // * 非战斗相关
        // 检测刷新任务数据和红点 
        switch (data.type) {
            case COMMONLOGICTYPE.login:
            case COMMONLOGICTYPE.ad:
            case COMMONLOGICTYPE.box:
            case COMMONLOGICTYPE.level:
            case COMMONLOGICTYPE.wave:
                PlayerManager.updateTaskState()
                break;
            default:
                break;
        }
    }

    // 登录
    // 观看广告
    dealAd () {
        PlayerManager.updateDailyData(DAILYTYPE.ad, 1)
        PlayerManager.updateAchieveData(ACHIEVETYPE.ad, 1)
    }
    // 挑战关卡
    dealMap () {
        PlayerManager.updateDailyData(DAILYTYPE.map, 1)
        PlayerManager.updateAchieveData(ACHIEVETYPE.map, 1)
    }
    // 击杀怪物
    dealKill () { 
        PlayerManager.updateDailyData(DAILYTYPE.kill, 1)
        PlayerManager.updateAchieveData(ACHIEVETYPE.kill, 1)
    }
    // 获取遗物
    dealRune () { 
        PlayerManager.updateDailyData(DAILYTYPE.rune, 1)
        PlayerManager.updateAchieveData(ACHIEVETYPE.rune, 1)
    }
    // 开宝箱
    dealBox () { 
        PlayerManager.updateAchieveData(ACHIEVETYPE.box, 1)
    }
    // 无限波波次
    dealWavePass (data) { 
        PlayerManager.updateAchieveData2(ACHIEVETYPE.pass, data.value)
    }
    dealWave (data) { 
        PlayerManager.updateAchieveData2(ACHIEVETYPE.wave, data.value)
    }
    // 单次伤害
    dealHurt (data) { 
        PlayerManager.updateAchieveData2(ACHIEVETYPE.hurt, data.value)
    }
    // 英雄等级
    dealHeroLv (data) { 
        PlayerManager.updateAchieveData2(ACHIEVETYPE.level, data.value)
    }
    // 通关难度
    dealWaveDiff (data) { 
        PlayerManager.updateAchieveData3(ACHIEVETYPE.diff, data.value, data.mapId)
    }
}

export default LogicManager.getInstance();