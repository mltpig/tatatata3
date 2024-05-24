import { UI_ZORDER } from "../../framework/utils/Enumer";
import ResUtils from "../../framework/utils/ResUtils";
import CampFightManager from "../model/CampFightManager";
import CloneFightManager from "../model/CloneFightManager";
import DefendFightManager from "../model/DefendFightManager";
import FightManager from "../model/FightManager";
import LordFightManager from "../model/LordFightManager";
import MoreFightManager from "../model/MoreFightManager";
import PossessFightManager from "../model/PossessFightManager";
import RepeatFightManager from "../model/RepeatFightManager";
import SelectFightManager from "../model/SelectFightManager";
import SuperFightManager from "../model/SuperFightManager";
import { SCENETYPE } from "../other/FightEnum";
import { PATHS } from "../other/Paths";
import { TSCENE } from "../other/Tool";
import GameSchedulerScript from "./scheduler/GameSchedulerScript";

/**
 * 游戏主体管理类
 */
class GameManager {
    private static instance_: GameManager
    static getInstance (): GameManager {
        if (!this.instance_) {
            this.instance_ = new GameManager()
        }
        return GameManager.instance_
    }
    
    /************** 腾讯云 **************/
    
    private app_: cloudbase.app.App;
    get app (): cloudbase.app.App {
        return this.app_
    }

    /************** 玩家账号 **************/

    private accountKey: string = "_ACCOUNT_KEY_"
    public accountInfo: ACCOUNTINFO;

    saveAccountInfo (account: string, password: string) {
        let data: ACCOUNTINFO = {
            account: account,
            password: password,
        }
        cc.sys.localStorage.setItem(this.accountKey, JSON.stringify(data));
    }

    /************** 平台 **************/

    public isAndroid: boolean;
    public isIos: boolean;
    public isPc: boolean;
    public isMac: boolean;

    init () {
        this.isAndroid = cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID
        this.isIos = cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS
        this.isPc = cc.sys.isNative && cc.sys.os == cc.sys.OS_WINDOWS
        this.isMac = cc.sys.isNative && cc.sys.os == cc.sys.OS_OSX

        // 腾讯云
        this.app_ = cc.cloud && cc.cloud.initialize();

        // 账号信息（不可用LocalDataManager）
        // let data = cc.sys.localStorage.getItem(this.accountKey)
        // if (data) {
        //     this.accountInfo = JSON.parse(data)
        // }

        this.addSchedulerNode()
    }

    /************** 常驻节点 定时器 **************/
    
    private schedulerNode: cc.Node;
    public loginTime: number;

    addSchedulerNode () {
        this.schedulerNode = new cc.Node()
        cc.game.addPersistRootNode(this.schedulerNode);
        this.schedulerNode.addComponent(GameSchedulerScript)
    }

    setServerTime (time: number) {
        this.loginTime = time
        this.schedulerNode.getComponent(GameSchedulerScript).setServerTime(time)
    }

    /************** loading **************/

    private isLoading: boolean = false;
    private loadNode: cc.Node = null;

    addLoading () {
        if (this.isLoading) { return }

        this.isLoading = true
        let self = this
        ResUtils.loadPreb(PATHS.common + "/loading", (result: cc.Node) => {
            if (!this.isLoading) {
                return
            }
            TSCENE().addChild(result, UI_ZORDER.popupLoadWait)
            self.loadNode = result
        })
    }

    delLoading () {
        this.isLoading = false
        if (this.loadNode) {
            this.loadNode.destroy();
            this.loadNode = null;
        }
    }

    /************** FightManager **************/

    // 符文类型 2种
    public runeType: number = 1;

    private fm: FightManager | 
        DefendFightManager | 
        CloneFightManager | 
        CampFightManager | 
        MoreFightManager | 
        PossessFightManager |
        LordFightManager |
        SuperFightManager |
        RepeatFightManager |
        SelectFightManager;
        
    setFM (type: SCENETYPE) {
        switch (type) {
            case SCENETYPE.pveDefend:
                this.fm = DefendFightManager.getInstance()
                break;
            case SCENETYPE.common:
                this.fm = FightManager.getInstance()
                break;
            case SCENETYPE.clone:
                this.fm = CloneFightManager.getInstance()
                break;
            case SCENETYPE.select:
                this.fm = SelectFightManager.getInstance()
                break;
            case SCENETYPE.camp:
                this.fm = CampFightManager.getInstance()
                break;
            case SCENETYPE.more:
                this.fm = MoreFightManager.getInstance()
                break;
            case SCENETYPE.possess:
                this.fm = PossessFightManager.getInstance()
                break;
            case SCENETYPE.lord:
                this.fm = LordFightManager.getInstance()
                break;
            case SCENETYPE.super:
                this.fm = SuperFightManager.getInstance()
                break;
            case SCENETYPE.repeat:
                this.fm = RepeatFightManager.getInstance()
                break;
            default:
                this.fm = FightManager.getInstance()
                break;
        }
    }
    getFM (): FightManager | 
        DefendFightManager | 
        CloneFightManager | 
        CampFightManager | 
        MoreFightManager | 
        PossessFightManager |
        LordFightManager |
        SuperFightManager |
        RepeatFightManager |
        SelectFightManager 
        {
            return this.fm;
    }
    clearFM () {
        this.fm.clear()
        this.fm = undefined
    }

}

export default GameManager.getInstance()