import EventDispatcher from "../framework/utils/EventDispatcher";
import AdManager from "../sdk/AdManager";
import AudioManager from "./manager/AudioManager";
import GameManager from "./manager/GameManager";
import LogicManager from "./manager/LogicManager";

const {ccclass, menu, property, executionOrder} = cc._decorator;

// 强制开启自动图集
cc.macro.CLEANUP_IMAGE_CACHE = false;
cc.dynamicAtlasManager.enabled = true;
cc.dynamicAtlasManager.maxFrameSize = 512;

@ccclass
@menu("ui/StartGame")
@executionOrder(-1000)
export default class StartGame extends cc.Component {
    
    onLoad () {
        // 调试
        cc.debug.setDisplayStats(false);
        // 开启调试自动图集
        // cc.dynamicAtlasManager.showDebug(true);
        // 关闭多点触摸
        cc.macro.ENABLE_MULTI_TOUCH = false;
        // 同步组件和游戏速率的逻辑处理
        this.synchroGameSpeed()

        /**
         * 自定义
         */
        EventDispatcher.init()
        GameManager.init()
        LogicManager.init()
        AudioManager.init()
    }   

    synchroGameSpeed () {
        let scheduler: cc.Scheduler = cc.director["_scheduler"];
        let schedulerUpdateFunc = scheduler.update;
        scheduler.update = function (dt: number) {
            schedulerUpdateFunc.call(scheduler, this._timeScale === 0 ? 0 : dt / this._timeScale);
        }
        let _deltaTime: number = 0;
        let timeScaleAttibute = cc.js.getPropertyDescriptor(cc.director, "_deltaTime");
        Object.defineProperty(cc.director, "_deltaTime", {
            get: () => {
                let r = _deltaTime * cc.director.getScheduler().getTimeScale();
                return r; 
            },
            set: (value) => { 
                _deltaTime = value;
            },
            enumerable: true,
            configurable: true
        });
    }

}   
