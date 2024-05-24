import { CLOUDTYPE } from "../manager/CloundKey";
import GameManager from "../manager/GameManager";
import PlayerManager from "../manager/PlayerManager";
import VER from "../manager/Ver";
import { TIPSTYPE } from "../other/Enum";
import GameUtils from "../other/GameUtils";

const {ccclass, property} = cc._decorator;
const failTips: string = "网络异常\n请重试";
const failMaxTips: string = "网络异常";

/**
 * 服务器请求处理
 */
export default class CloudCommand {
    // 函数名
    cloudName: string;
    // 数据
    data: any;
    // 回调
    callback: Function;
    // 请求类型
    type: CLOUDTYPE;
    // 失败次数
    failNum: number = 0;
    // 最大失败次数
    failMax: number = 3;
    // 等待时间(毫秒)
    waitTime: number = 5000;
    // 成功获取
    private isSuccess: boolean = false;
    // app
    private app: cloudbase.app.App;
    private auth;

    constructor (name: string, type: CLOUDTYPE, data: any, cb?: Function) {
        this.cloudName = name
        this.type = type
        this.data = data
        this.callback = cb

        // 新增：版本号
        this.data.version = VER.version
        
        this.app = GameManager.app;
        if (type == CLOUDTYPE.login) {
            this.auth = this.app.auth({persistence: "session"});
        }
        this.send()
    }

    send () {
        GameManager.addLoading()

        let self = this
        switch (this.type) {
            case CLOUDTYPE.login:
                // 登录
                this.auth.anonymousAuthProvider().signIn().then(res => {
                    PlayerManager.uid = res.user.uid
                    self.backSuccess()
                });
                break;
            case CLOUDTYPE.func:
                // 云函数
                this.app.callFunction({
                    name: self.cloudName,
                    data: self.data,
                    }).then(res => {
                        if (res.result.status === 0 && res.result.data) {
                            // 调用成功
                            self.dealTime(res.result.data.time)
                            self.backSuccess(res.result.data)
                        } else {
                            if (res.result.data && res.result.data.error) {
                                GameUtils.messageHint(res.result.data.error)
                            }
                        }
                }).catch(console.error);
                break;
            case CLOUDTYPE.data:
                // 数据库
                this.app.database()
                .collection(self.cloudName)
                .limit(100)
                .get()
                .then(function (res) {
                    self.backSuccess(res.data)
                });
                break;
            default:
                break;
        }
        this.addOnce()
    }

    backSuccess (data?: any) {
        this.isSuccess = true
        GameManager.delLoading()

        if (this.callback) {
            this.callback(data)
        }
    }

    backFail () {
        GameManager.delLoading()

        this.failNum = this.failNum + 1
        if (this.failNum >= this.failMax) {
            // 重启游戏
            GameUtils.addTips(failTips, ()=> {
                cc.game.restart()
            }, TIPSTYPE.ok)
            return
        }

        // 失败
        GameUtils.addTips(failMaxTips, (confirm)=> {
            if (confirm) {
                this.send()
            }
        }, TIPSTYPE.all)
    }

    addOnce () {
        let self = this
        setTimeout(() => {
            self.timeOut()
        }, self.waitTime);
    }

    // 超时
    timeOut () {
        if (this.isSuccess) { return }
        this.backFail()
    }

    dealTime (time: number) {
        if (time == undefined) { return }
        
        GameManager.setServerTime(time)
        PlayerManager.refreshNaturalDay(time)
    }
}