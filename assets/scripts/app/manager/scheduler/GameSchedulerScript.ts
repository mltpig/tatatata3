import PlayerManager from "../PlayerManager";

const {ccclass, property} = cc._decorator;

/**
 * 处理时间相关函数
 * 记录服务器时间倒计时第二天逻辑处理
 */
@ccclass
export default class GameSchedulerScript extends cc.Component {
    private _serverTime: number;                 // 服务器时间
    private countTime: number;                  // 隔天倒计时
    private isClock: boolean = false;

    setServerTime (time: number) {
        this.isClock = true

        let timer: number = time
        let date: Date = new Date(timer);
        let oldTime = date.getTime()
        date.setDate(date.getDate() + 1)
        date.setHours(0, 0, 0, 0)
        let newTime = date.getTime()
        this.countTime = newTime - oldTime
        this.serverTime = oldTime
    }

    update (dt: number) {
        if (!this.isClock) { return }

        this.serverTime = this._serverTime + dt
        this.countTime = this.countTime - dt
        if (this.countTime <= 0) {
            // 隔天
            this.countTime = 24 * 60 * 60
            PlayerManager.refreshNaturalDay(this.serverTime)
        }
    }

    set serverTime (ntime: number) {
        this._serverTime = ntime
        PlayerManager.serverTime = this._serverTime
    }

    get serverTime () : number {
        return this._serverTime
    }

}