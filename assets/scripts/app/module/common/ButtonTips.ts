import { UIACT } from "../../../framework/utils/Enumer";
import LayerManager from "../../manager/LayerManager";
import StaticManager from "../../manager/StaticManager";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, menu, property} = cc._decorator;

/**
 * 提示组件
 */
@ccclass
@menu("utils/ButtonTips")
export default class ButtonTips extends GameView {
    //类型
    @property({ 
        type: cc.Integer, 
        tooltip: CC_DEV && '提示类型: \n 提示id', 
    })
    private tipsIndex: number = 0;
    // 大小
    @property({
        type: cc.Integer,
        tooltip: CC_DEV && '提示框高度', 
    })
    private tipsHigh: number = 300;

    onLoad () {
        super.onLoad()
        this.node.on(cc.Node.EventType.TOUCH_END, this.clickFunc, this);
    }
    
    clickFunc () {
        let str: string = ""
        let info: TIPSDATA = StaticManager.getStaticValue("static_tips_data", this.tipsIndex.toString())
        if (info) {
            str = info.des
        }

        LayerManager.pop({
            script: "TipsLayer",
            prefab: PATHS.common + "/tipsLayer",
            backClick: true,
            data: {
                hign: this.tipsHigh,
                txt: str,
            },
        })   
    }

}