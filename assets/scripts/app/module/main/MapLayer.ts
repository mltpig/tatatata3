import List from "../../../framework/creator/List";
import SelectButton from "../../../framework/creator/SelectButton";
import GameManager from "../../manager/GameManager";
import LayerManager from "../../manager/LayerManager";
import StaticManager from "../../manager/StaticManager";
import { SELECTBTNTYPE } from "../../other/Enum";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";
import MapPoint from "./MapPoint";
import MapPoint2 from "./MapPoint2";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MapLayer extends GameView {
    @property(cc.Prefab)
    mapPoint: cc.Prefab = null;

    private mapData: Array<MAPDATA>;            // 普通
    private specialData: Array<MAPDATA>;        // 特殊
    private mapNode: cc.Node;
    private mapList2: List;

    private normalBtn: SelectButton;
    private specialBtn: SelectButton;
    private normal2Btn: SelectButton;
    private special2Btn: SelectButton;
    private tabType: SELECTBTNTYPE = SELECTBTNTYPE.none;

    private mapStart1: boolean = false
    private mapStart2: boolean = false

    onLoad () {
        super.onLoad()

        this.normalBtn = this.getCpByType("normalBtn", SelectButton)
        this.specialBtn = this.getCpByType("specialBtn", SelectButton)
        this.normal2Btn = this.getCpByType("normal2Btn", SelectButton)
        this.special2Btn = this.getCpByType("special2Btn", SelectButton)

        this.normalBtn.selectCallback = this.showTab.bind(this)
        this.specialBtn.selectCallback = this.showTab.bind(this)
        this.normal2Btn.selectCallback = this.showTab.bind(this)
        this.special2Btn.selectCallback = this.showTab.bind(this)

        this.mapNode = this.getNode("mapNode")
        this.mapList2 = this.getCpByType("mapList2", List)

        this.mapNode.active = false
        this.mapList2.node.active = false

        this.addTitleLayer_({
            name: "关卡选择",
            cb: this.close_.bind(this)
        })

        this.mapData = StaticManager.getStaticValues("static_map_data")
        this.specialData = StaticManager.getStaticValues("static_special_map_data")
    }
    
    start () {
        let type: SELECTBTNTYPE = this.popData_.data
        type = type ? type : SELECTBTNTYPE.model_normal
        switch (type) {
            case SELECTBTNTYPE.model_normal:
                this.normalBtn.clickFunc()
                break;
            case SELECTBTNTYPE.model_dream:
                this.specialBtn.clickFunc()
                break;
            default:
                break;
        }
    }

    showTab (type: SELECTBTNTYPE) {
        if (type == this.tabType) {
            return
        }

        this.tabType = type

        if (type == SELECTBTNTYPE.model_normal || type == SELECTBTNTYPE.model_dream) {
            GameManager.runeType = 1
        } else {
            GameManager.runeType = 2
        }
        
        this.mapNode.active = this.tabType == SELECTBTNTYPE.model_normal || this.tabType == SELECTBTNTYPE.model_normal2
        this.mapList2.node.active = this.tabType == SELECTBTNTYPE.model_dream || this.tabType == SELECTBTNTYPE.model_dream2
        if (this.tabType == SELECTBTNTYPE.model_normal || this.tabType == SELECTBTNTYPE.model_normal2) {
            if (!this.mapStart1) {
                this.initNormalView()
            }
        } else {
            if (!this.mapStart2) {
                this.initSpecialView()
            }
        }
    }

    initNormalView () {
        this.mapStart1 = true
        for (let i = 0; i < this.mapData.length; i++) {
            let v = this.mapData[i];

            let item = cc.instantiate(this.mapPoint)
            this.mapNode.addChild(item)

            let script = item.getComponent(MapPoint)
            script.setData(v)
            script.callback = this.clickMap.bind(this)
        }
    }
    
    initSpecialView () {
        this.mapStart2 = true
        this.mapList2.numItems = this.specialData.length
    }

    onListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(MapPoint2)
        cell.setData(this.specialData[idx])
        cell.callback = this.clickMap.bind(this)
    }

    clickMap (data: MAPDATA) {
        LayerManager.pop({
            script: "MapSelectLayer",
            prefab: PATHS.main + "/mapSelectLayer",
            opacity: 180,
            data: data,
            backClick: true,
        })
    }
}