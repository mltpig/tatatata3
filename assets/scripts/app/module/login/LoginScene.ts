import AdManager from "../../../sdk/AdManager";
import AssetManager from "../../manager/AssetManager";
import { CLOUDFUN, CLOUDTYPE } from "../../manager/CloundKey";
import GameManager from "../../manager/GameManager";
import HeroManager from "../../manager/HeroManager";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import VER from "../../manager/Ver";
import CloudCommand from "../../net/CloudCommand";
import { TIPSTYPE } from "../../other/Enum";
import { SCENETYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class LoginScene extends GameView {
    private txtLoad: cc.Label;
    private loginBtn: cc.Node;
    private loginBg: cc.Node;
    private taptap: cc.Node;
    private updateBtn: cc.Node;
    private updateTxt: cc.Label;
    private lineBtn: cc.Node;

    onLoad () {
        super.onLoad()
        this.txtLoad = this.getCpByType("txtLoad", cc.Label)
        this.loginBtn = this.getNode("loginBtn")
        this.loginBg = this.getNode("loginBg")
        this.taptap = this.getNode("taptap")
        this.updateBtn = this.getNode("updateBtn")
        this.updateTxt = this.getCpByType("updateTxt", cc.Label)
        this.lineBtn = this.getNode("lineBtn")

        this.loginBtn.active = false
        this.updateBtn.active = false
        this.lineBtn.active = false
        this.txtLoad.string = "本地数据加载中..."
    }

    start () {
        this.addMaskUse()
        
        cc.tween(this.taptap)
            .delay(1)
            .to(0.5, {opacity: 80})
            .start()

        cc.tween(this.loginBg)
            .delay(1.6)
            .removeSelf()
            .start()
        
        this.scheduleOnce(()=>{
            this.loadFile()
        },1.6)
    }

    // 初始化数据
    readyGame (data) {
        // if (data.review) {
        //     PlayerManager.review = data.review
        // }

        PlayerManager.serverVer = data.ver
        PlayerManager.isNewVer = data.verNum <= VER.version
        
        if (data.verNum > VER.version) {
            let act1 = cc.tween()
                        .to(1, { scale: 1.1 })
                        .to(1, { scale: 1 })

            cc.tween(this.updateBtn)
                .repeatForever(act1)
                .start()
            this.updateTxt.string = "最新版本" + data.ver + "\n当前版本" + VER.ver
            this.updateBtn.active = true
        }
        
        // 版本过期
        // if (GameManager.loginTime >= PlayerManager.testTime) {
        //     this.txtLoad.string = "测试版本已过期"
        //     return
        // }
        
        // 初始化广告sdk
        AdManager.init()

        this.txtLoad.string = "进入游戏"
        let act = cc.tween()
                    .to(1, { scale: 1.1 })
                    .to(1, { scale: 1 })

        cc.tween(this.txtLoad.node)
            .repeatForever(act)
            .start()
        this.loginBtn.active = true
    }

    loadFile () {
        let getServerTime = () => {
            new CloudCommand(CLOUDFUN.getServerTime, CLOUDTYPE.func, {}, (data) => {
                this.readyGame(data)
            })
        }

        let initGame = () => {
            PlayerManager.init()
            HeroManager.init()
            AssetManager.init()
            this.lineBtn.active = true
            this.txtLoad.string = "服务器连接中..."
            new CloudCommand("",CLOUDTYPE.login, {}, getServerTime)
        }
        StaticManager.loadFile(initGame)
    }
    
    onTouchEnd (name: string) {
        switch (name) {
            case "loginBtn":
                GameUtils.loadScene({
                    name: "main",
                    type: SCENETYPE.none,
                })
                break;
            case "updateBtn":
                // 前往更新
                cc.sys.openURL("https://www.taptap.com/app/222245")
                break;
            case "lineBtn":
                // 离线模式
                GameUtils.addTips("离线模式\n\n1.开启后将不需要连接网络\n2.部分与服务器相关的功能将无法使用", (confirm)=> {
                    if (confirm) {
                        PlayerManager.initOutLine()
                        GameUtils.loadScene({
                            name: "main",
                            type: SCENETYPE.none,
                        })
                    }
                }, TIPSTYPE.all)
                break;
            default:
                break;
        }
    }
}
