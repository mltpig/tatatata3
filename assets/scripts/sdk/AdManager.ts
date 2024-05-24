import GameManager from "../app/manager/GameManager";
import Events from "../app/other/Events";
import GameUtils from "../app/other/GameUtils";
import EventDispatcher from "../framework/utils/EventDispatcher";
import { initAdSdk, showAd } from "./native/NativeUtils";

/**
 * 聚合广告管理类
 */
class AdManager {
    private static instance_: AdManager
    static getInstance (): AdManager {
        if (!this.instance_) {
            this.instance_ = new AdManager()
        }
        return AdManager.instance_
    }

    init () {
        // 初始化广告sdk
        this.initAdSdk()
    }
    
    // 奖励获取成功
    private rewardBack: Function;

    // sdk是否初始化
    private isInit: boolean = false;

    public adTime: number = 0;

    /******************** ts调用java ********************/

    initAdSdk () {
        if (GameManager.isPc || GameManager.isMac) { return }
        
        if (this.isInit) { return }
        this.isInit = true
        initAdSdk()
    }

    showAd (cb: Function) {
        this.rewardBack = cb
        if (GameManager.isPc || GameManager.isMac) {
            this.onAdReward()
        } else {
            showAd()
        }
    }

    /******************** java调用ts ********************/

    // 广告未准备好
    onAdReadyError() {
        GameUtils.messageHint("广告未准备好，请稍后再试")
    }   

    // 广告加载成功
    onAdLoaded () {
    }

    // 广告被点击
    onAdClicked () {
    }

    // 广告被展示
    onAdImpression () {
    }

    // 广告加载失败
    onAdFailed (errorCode: number) {
        EventDispatcher.dispatchEvent(Events.ad_fail_event, errorCode)
    }
    
    // 广告被关闭
    onAdClosed () {
    }

    // 视频播放失败
    onAdVideoError () {
        GameUtils.messageHint("广告播放失败")
    }
    
    // 获取奖励成功
    onAdReward () {
        if (this.rewardBack) {
            this.rewardBack()
            this.rewardBack = null
        }
    }

}

// 全局 用于java调用
window["AdManager"] = AdManager.getInstance();

export default AdManager.getInstance()