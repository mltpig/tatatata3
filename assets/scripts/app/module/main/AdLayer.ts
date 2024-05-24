import List from "../../../framework/creator/List";
import DisUtils from "../../../framework/utils/DisUtils";
import EventDispatcher from "../../../framework/utils/EventDispatcher";
import TimeUtils from "../../../framework/utils/TimeUtils";
import AdManager from "../../../sdk/AdManager";
import HeroManager from "../../manager/HeroManager";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import { COMMONLOGICTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import GameUtils from "../../other/GameUtils";
import { arrayGet, DS, ES, random1 } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";
import AdHeroItem from "./AdHeroItem";

const {ccclass, property} = cc._decorator;

interface ADITEM {
    id: string, 
    select: cc.Node,
    limit: cc.Label,
    type: number,
    count: string,      // 当前次数
    num: string,        // 次数上限
    total: string,      // 累计类型次数
    max: string,        // 计数
    rewardType: number, // 1 看广告 2 达到上限 3 领取奖励 4 未达成
}

const adInterval: number = 5;

/**
 * 广告界面
 */
@ccclass
export default class AdLayer extends GameView {
    private adList: cc.Node;
    private heroList: List;
    private adItem: cc.Node;
    private lookBtn: cc.Button;
    private lookTxt: cc.Label;
    private tips4Txt: cc.Label;
    
    private heroData: Array<HEROINFO>;
    private adLocalData: ADLOCALDATA;
    private adData: Array<ADDATA>;
    private selectAdIndex: number;          // 选择的广告index
    private selectId: string;               // 选择的英雄id 
    private adIdList: Array<ADITEM> = [];
    public adPause: boolean = false;

    onLoad() {
        super.onLoad()

        this.adList = this.getNode("adList")
        this.adItem = this.getNode("adItem")
        this.heroList = this.getCpByType("heroList", List)
        this.lookBtn = this.getCpByType("lookBtn", cc.Button)
        this.lookTxt = this.getCpByType("lookTxt", cc.Label)
        this.tips4Txt = this.getCpByType("tips4Txt", cc.Label)
        this.tips4Txt.node.active = false
        this.tips4Txt.string = ""

        this.addTitleLayer_({
            name: "瓜摊",
            cb: this.close_.bind(this)
        })

        this.adData = StaticManager.getStaticValues("static_ad")
        this.heroData = HeroManager.heroData

        this.checkAdShow()
        this.initView()
        this.refreshShow()
        this.showAdSelect(0)

        this.addEventListener_(Events.ad_fail_event, this.onAdFailed.bind(this))
    }

    // 广告加载失败
    onAdFailed (errorCode: number) {
        let str: string = "其他错误";
        switch (errorCode) {
            case 0:
                str = "其他错误";
                break;
            case 1:
                // 成功
                return
            case 2:
                str = "其他错误";
                break;
            case 3:
                str = "加载超时";
                break;
            case 4:
                str = "其他错误";
                break;
            case 5:
                str = "广告未准备好";
                break;
            case 6:
                str = "网络链接异常";
                break;
            case 7:
                str = "网络链接异常";
                break;
            case 8:
                str = "其他错误";
                break;
            case 9:
                str = "其他错误";
                break;
            case 10:
                str = "其他错误";
                break;
            case 11:
                str = "其他错误";
                break;
            case 12:
                str = "其他错误";
                break;
            case 13:
                str = "其他错误";
                break;
            case 14:
                str = "展示广告失败";
                break;
            case 15:
                str = "其他错误";
                break;
            case 16:
                str = "其他错误";
                break;
            case 17:
                str = "其他错误";
                break;
            case 18:
                str = "其他错误";
                break;
            case 19:
                str = "其他错误";
                break;
            case 101:
                str = "其他错误";
                break;
            case 102:
                str = "其他错误";
                break;
            default:
                break;
        }
        str = str + "  广告错误码：" + errorCode
        GameUtils.messageHint(str)
    }
    
    initView () {
        // 瓜摊
        for (let i = 0; i < this.adData.length; i++) {
            let v = this.adData[i]
            let node: cc.Node
            if (i == 0) {
                node = this.adItem
            } else {
                node = cc.instantiate(this.adItem)
                this.adList.addChild(node)
            }
            
            node.name = "adItem_" + i
            node.on(cc.Node.EventType.TOUCH_END, this.clickAd, this)
            this.adIdList.push({
                select: node.getChildByName("selectImage"),
                id: v.id.toString(),
                limit: node.getChildByName("proTxt").getComponent(cc.Label),
                type: v.type,
                count: ES(0),
                num: v.num,
                max: ES(0),
                total: v.total,
                rewardType: 1,
            })

            DisUtils.replaceSprite(PATHS.prop + "/" + v.res, node.getChildByName("adIcon"))
            node.getChildByName("nameTxt").getComponent(cc.Label).string = v.name
            node.getChildByName("awardTxt").getComponent(cc.Label).string = v.des
        }

        // 英雄
        this.heroList.numItems = this.heroData.length
        this.heroList.selectedId = 0
    }

    refreshShow () {
        this.adLocalData = PlayerManager.adData

        let rewardData: Array<ADREWARDDATA> = this.adLocalData.adReward
        let maxNum: number = 0
        for (let i = 0; i < rewardData.length; i++) {
            maxNum = maxNum + DS(rewardData[i].num)
        }

        for (let i = 0; i < this.adIdList.length; i++) {
            let t: ADREWARDDATA = arrayGet(rewardData, "id", this.adIdList[i].id)
            let num = t ? t.num : ES(0)
            
            this.adIdList[i].count = num      
            this.adIdList[i].max = ES(maxNum)
            let v = this.adIdList[i]

            let str = ""
            if (v.type == 2) {
                let max: number = DS(v.max) > DS(v.total) ? DS(v.total) : DS(v.max)
                str = "每日领取限制" + DS(v.count) + "/" + DS(v.num) + "\n广告次数达到" + max + "/" + DS(v.total) + ",直接领取"
                if (DS(v.count) >= DS(v.num)) {
                    this.adIdList[i].rewardType = 2
                } else if (DS(v.max) < DS(v.total)) {
                    this.adIdList[i].rewardType = 4
                } else {
                    this.adIdList[i].rewardType = 3
                }
            } else {
                str = "每日领取限制" + DS(v.count) + "/" + DS(v.num)
                if (DS(v.count) >= DS(v.num)) {
                    this.adIdList[i].rewardType = 2
                } else {
                    this.adIdList[i].rewardType = 1
                }
            }
            v.limit.string = str
        }
    }

    clickAd (event) {
        let name = event.target.name
        let str = name.split("_")
        this.showAdSelect(parseInt(str[1]))
    }

    // 广告选择
    showAdSelect (index: number) {
        this.selectAdIndex = index
        for (let i = 0; i < this.adIdList.length; i++) {
            this.adIdList[i].select.opacity = i == index ? 255 : 0
        }
        let str = ""
        let can: boolean = false
        switch (this.adIdList[index].rewardType) {
            case 1:
                str = "观看广告"
                can = true;
                break;
            case 2:
                str = "达到上限"
                break;
            case 3:
                str = "领取奖励"
                can = true;
                break;
            case 4:
                str = "未达成"
                break;
            default:
                break;
        }
        this.lookTxt.string = str
        this.lookBtn.interactable = can

        this.lookBtn.node.active = !this.adPause
        this.tips4Txt.node.active = this.adPause
    }

    checkAdShow () {
        if (AdManager.adTime != 0) {
            let ntime = PlayerManager.serverTime - AdManager.adTime
            if (ntime <= adInterval) {
                this.adPause = true
            }
        }
    }

    update (dt: number) {
        if (this.adPause) {
            let ntime = PlayerManager.serverTime - AdManager.adTime
            if (ntime <= adInterval) {
                // let str = TimeUtils.getTimerDes(adInterval - ntime)
                this.tips4Txt.string = "00:0" + Math.ceil(adInterval - ntime)
            } else {
                this.adPause = false
                this.tips4Txt.string = ""
                this.lookBtn.node.active = true
                this.tips4Txt.node.active = false
            }
        }
    }

    onHeroListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(AdHeroItem)
        cell.setData(this.heroData[idx])
    }

    // 英雄选择
    onSelectHeroListItem (item: cc.Node, selectedId: number, lastSelectedId: number, val: number) {
        if (!item) { return }
        this.selectId = this.heroData[selectedId].id.toString()
    }
    
    delayReward (ad: boolean = true) {
        this.scheduleOnce(()=> {
            this.getReward(ad)
        }, 0.2);
    }
    
    // 获取奖励
    getReward (ad: boolean = true) {
        // 检测超出上限
        let d: ADITEM = this.adIdList[this.selectAdIndex]
        if (DS(d.count) >= DS(d.num)) { return }

        let vd: ADDATA = StaticManager.getStaticValue("static_ad", d.id)
        let itemId: number = StaticManager.getItemIdByHero(this.selectId)
        let reward: Array<AWARDDATA> = [
            {
                bid: itemId,
                type: 5,
                num: DS(vd.patch),
            },
            {
                bid: 14001,
                type: 4,
                num: DS(vd.gold),
            }
        ]
        PlayerManager.addProp(reward, true)
        // 刷新广告数据
        this.adLocalData.random = ES(random1(0,100))
        
        let has: boolean = false
        for (let i = 0; i < this.adLocalData.adReward.length; i++) {
            let v = this.adLocalData.adReward[i]
            if (v.id == d.id) {
                this.adLocalData.adReward[i].num = ES(DS(v.num) + 1)
                has = true
                break
            }
        }
        if (!has) {
            this.adLocalData.adReward.push({
                id: d.id,
                num: ES(1),
            })
        }

        PlayerManager.refreshAdData(this.adLocalData)

        // 广告任务
        if (ad) {
            EventDispatcher.dispatchEvent(Events.game_logic_event, {
                type: COMMONLOGICTYPE.ad,
            })

            AdManager.adTime = PlayerManager.serverTime
            this.checkAdShow()
        }


        this.refreshShow()
        this.showAdSelect(this.selectAdIndex)
    }
    
    onTouchEnd (name: string) {
        switch (name) {
            case "lookBtn":
                let d: ADITEM = this.adIdList[this.selectAdIndex]
                switch (d.rewardType) {
                    case 1:
                        // 观看广告
                        let pro = DS(PlayerManager.adData.random)
                        if (pro < 10) {
                            // 概率跳过广告
                            GameUtils.messageHint("幸运的你跳过了广告!")
                            this.getReward()
                        } else {
                            AdManager.showAd(this.delayReward.bind(this))
                        }
                        break;
                    case 3:
                        // 领取奖励
                        this.getReward(false)
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    }
}