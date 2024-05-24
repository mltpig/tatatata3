import GameManager from "../manager/GameManager";
import GameView from "../module/GameView";
import { TIPSTYPE } from "../other/Enum";
import { SCENETYPE } from "../other/FightEnum";
import GameUtils from "../other/GameUtils";
import HotUpdate, {HotOptions} from "./HotUpdate";

const {ccclass, property} = cc._decorator;

/**
 * 热更新
 */
@ccclass
export default class UpdateScene extends GameView {
    @property({displayName: "project.manifest", type: cc.Asset,})
    manifest: cc.Asset = null;

    @property({displayName: "version", type: cc.Label,})
    versionLabel: cc.Label = null;

    @property({displayName: "prograss", type: cc.ProgressBar})
    updateProgress: cc.ProgressBar = null;

    @property({displayName: "tips", type: cc.Label})
    tipsLabel: cc.Label = null;

    private clearBtn: cc.Node;
    private healthy: cc.Node;

    onLoad() {
        super.onLoad()

        this.clearBtn = this.getNode("clearBtn")
        this.healthy = this.getNode("healthy")

        this.initView();

        let options = new HotOptions();
        options.OnVersionInfo = (data) => {
            let {local, server} = data;
            this.versionLabel.string = `本地版本号:${local}, 服务器版本号:${server}`;
        };
        options.OnUpdateProgress = (event: jsb.EventAssetsManager) => {
            let bytes = event.getDownloadedBytes() + "/" + event.getTotalBytes();
            let files = event.getDownloadedFiles() + "/" + event.getTotalFiles();

            let file = event.getPercentByFile().toFixed(2);
            let byte = event.getPercent().toFixed(2);
            let msg = event.getMessage();

            console.log("[update]: 进度=" + file);
            this.updateProgress.progress = parseFloat(file);
            this.tipsLabel.string = "正在更新中,请耐心等待";
            console.log(msg);
        };
        options.OnNeedToUpdate = (data) => {
            GameUtils.addTips("检测到新版本,点击确定开始更新", () => {
                HotUpdate.hotUpdate();
            }, TIPSTYPE.ok)
        };
        options.OnNoNeedToUpdate = () => {
            this.enterGame();
        };
        options.OnUpdateFailed = () => {
            this.tipsLabel.string = "更新失败";
            cc.log("热更新失败");
            GameUtils.addTips("更新失败,点击重试", () => {
                HotUpdate.checkUpdate();
            }, TIPSTYPE.ok)
        };
        options.OnUpdateSucceed = () => {
            this.tipsLabel.string = "更新成功";
            cc.log("更新成功");
            GameUtils.addTips("更新成功,点击确定重启游戏", () => {
                cc.audioEngine.stopAll();
                cc.game.restart();
            }, TIPSTYPE.ok)
        };
        HotUpdate.init(this.manifest, options);
    }

    initView() {
        this.clearBtn.active = false

        this.tipsLabel.string = "";
        this.versionLabel.string = "";
        this.updateProgress.progress = 0;
        
        this.showHealthy()
    }   

    showHealthy () {
        let self = this
        let cb = function () {
            self.checkUpdate()
        }
        cc.tween(this.healthy)
            .delay(1)
            .hide()
            .call(cb)
            .start();
    }

    // 检查更新
    checkUpdate() {
        if (GameManager.isMac || GameManager.isPc) {
            cc.log("windows和mac平台不需要热更新");
            this.enterGame();
        } else {
            if (this.manifest) {
                this.tipsLabel.string = "正在获取版本...";
                HotUpdate.checkUpdate();
            }
        }
    }
    
    enterGame() {
        cc.log("进入游戏成功");
        this.updateProgress.node.active = false;
        GameUtils.loadScene({
            name: "login",
            type: SCENETYPE.none,
        })
    }
}
