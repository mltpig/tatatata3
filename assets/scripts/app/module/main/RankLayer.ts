import List from "../../../framework/creator/List";
import SelectButton from "../../../framework/creator/SelectButton";
import { CLOUDTYPE } from "../../manager/CloundKey";
import StaticManager from "../../manager/StaticManager";
import CloudCommand from "../../net/CloudCommand";
import { SELECTBTNTYPE } from "../../other/Enum";
import GameUtils from "../../other/GameUtils";
import GameView from "../GameView";
import RankItem from "./RankItem";
import RankTab from "./RankTab";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RankLayer extends GameView {
    @property(cc.Prefab)
    rankTab = null;

    private mapNode: cc.Node;
    private noRankTxt: cc.Node;
    private rankList: List;
    private scrollView: cc.ScrollView;
    private normalBtn: SelectButton;
    private specialBtn: SelectButton;
    private normal2Btn: SelectButton;
    private special2Btn: SelectButton;

    private rankTabs: Array<RankTab> = [];
    private mapList: Map<number, Array<RANKDATA>> = new Map();
    private mapArray: Array<RANKDATA>;
    private mapData: Array<MAPDATA>;
    private tabType: SELECTBTNTYPE = SELECTBTNTYPE.none;
    private mapIndex: number = -1;   // 关卡index

    private normalData: Array<MAPDATA> = [];
    private specialData: Array<MAPDATA> = [];
    private normalData2: Array<MAPDATA> = [];
    private specialData2: Array<MAPDATA> = [];

    onLoad () {
        super.onLoad()

        this.mapNode = this.getNode("mapNode")
        this.noRankTxt = this.getNode("noRankTxt")
        this.rankList = this.getCpByType("rankList", List)
        this.scrollView = this.getCpByType("rankList", cc.ScrollView)
        this.normalBtn = this.getCpByType("normalBtn", SelectButton)
        this.specialBtn = this.getCpByType("specialBtn", SelectButton)
        this.normal2Btn = this.getCpByType("normal2Btn", SelectButton)
        this.special2Btn = this.getCpByType("special2Btn", SelectButton)

        this.normalBtn.selectCallback = this.showModel.bind(this)
        this.specialBtn.selectCallback = this.showModel.bind(this)
        this.normal2Btn.selectCallback = this.showModel.bind(this)
        this.special2Btn.selectCallback = this.showModel.bind(this)

        this.normalData = StaticManager.getStaticValues("static_map_data")
        this.noRankTxt.active = false
        this.normalData2 = this.normalData

        // 特殊
        this.specialData = StaticManager.getStaticValues("static_special_map_data")
        this.specialData.shift()
        this.specialData2 = this.specialData

        this.addTitleLayer_({
            name: "排行",
            cb: this.close_.bind(this),
        })
    }
    
    start () {
        this.showModel(SELECTBTNTYPE.model_normal)
    }

    showModel (type: SELECTBTNTYPE) {
        if (type == this.tabType) {
            return
        }

        this.tabType = type
        if (type == SELECTBTNTYPE.model_normal) {
            this.mapData = this.normalData
        } else if (type == SELECTBTNTYPE.model_dream) {
            this.mapData = this.specialData
        } else if (type == SELECTBTNTYPE.model_normal2) {
            this.mapData = this.normalData2
        } else if (type == SELECTBTNTYPE.model_dream2) {
            this.mapData = this.specialData2
        }
        this.rankTabs = []
        this.mapArray = []
        this.mapList.clear()
        this.mapIndex = -1
        this.mapNode.destroyAllChildren()
        this.initView()
        this.showTab(0)
    }
    
    initView () {
        let high = 10 + this.mapData.length * 65 + (this.mapData.length - 1) * 10
        this.mapNode.setContentSize(250, high)
        this.mapNode.parent.parent.setContentSize(250, high)

        for (let i = 0; i < this.mapData.length; i++) {
            const ele = this.mapData[i];

            let item = cc.instantiate(this.rankTab)
            this.mapNode.addChild(item)

            let script = item.getComponent(RankTab) as RankTab
            this.rankTabs.push(script)
            script.setData(ele, i)
            script.setCallBack(this.showTab.bind(this))
        }
    }

    showTab (tab: number) {
        if (tab == this.mapIndex) {
            return
        }
        
        this.mapIndex = tab
        this.scrollView.stopAutoScroll();
        this.rankList.numItems = 0
        for (let i = 0; i < this.rankTabs.length; i++) {
            this.rankTabs[i].showSelect(i == this.mapIndex)
        }
        
        this.mapArray = this.mapList.get(this.mapIndex)
        if (this.mapArray) {
            this.showList()
        } else {
            
            let comepare = function (a, b) {
                if (Number(b.wave) == Number(a.wave)) {
                    return Number(b.score) - Number(a.score)
                } else {
                    return Number(b.wave) - Number(a.wave)
                }
            }

            let self = this
            let cb = function (t) {
                if (!t) { return }
                t.sort(comepare)
                for (let i = 0; i < t.length; i++) {
                    t[i].rank = i + 1
                }
                
                self.mapArray = t,
                self.mapList.set(self.mapIndex, t)
                self.showList()
            }

            let databaseName = "rankFive_" + this.mapData[tab].index
            if (this.tabType == SELECTBTNTYPE.model_normal2 || this.tabType == SELECTBTNTYPE.model_dream2) {
                databaseName = "rankFive2_" + this.mapData[tab].index
            }
            new CloudCommand(databaseName, CLOUDTYPE.data, {}, cb)
        }
    }

    showList () {
        this.rankList.numItems = this.mapArray.length
        this.noRankTxt.active = this.mapArray.length == 0
    }

    onRankListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(RankItem)
        cell.setData(this.mapArray[idx])
    }

}