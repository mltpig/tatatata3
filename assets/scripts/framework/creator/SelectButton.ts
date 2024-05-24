import { SELECTBTNBIGTYPE, SELECTBTNTYPE } from "../../app/other/Enum";
import Events from "../../app/other/Events";
import ViewBase from "./ViewBase";

const { ccclass, menu, property } = cc._decorator;

/**
 * 切换按钮
 */
@ccclass
@menu("creator/SelectButton")
export default class SelectButton extends ViewBase {
    @property
    selected: boolean = false;

    @property(cc.Node)
    selectIcon: cc.Node = null;
    
    //大类型
    @property({ 
        type: cc.Enum(SELECTBTNBIGTYPE), 
        tooltip: CC_DEV && '选择大类型: \n - none\n - 战斗', 
    })
    private bigType_: SELECTBTNBIGTYPE = SELECTBTNBIGTYPE.none;

    //小类型
    @property({ 
        type: cc.Enum(SELECTBTNTYPE), 
        tooltip: CC_DEV && '选择小类型: \n - none\n - 英雄\n - 道具\n - 符文', 
    })
    private type_: SELECTBTNTYPE = SELECTBTNTYPE.none;
    public set type(type: SELECTBTNTYPE) {
        this.type_ = type
    }
    
    // 回调
    private selectCallback_: Function = null;
    set selectCallback (cb: Function) {
        this.selectCallback_ = cb
    }

    onLoad() {
        this.selectIcon.active = this.selected;
        this.node.on(cc.Node.EventType.TOUCH_END, this.clickFunc, this);

        this.addEventListener_(Events.game_select_btn_event, this.selectFunc.bind(this))
    }

    showSelect (select: boolean) {
        this.selected = select
        this.selectIcon.active = select
    }

    selectFunc (event) {
        if (event.bigType != this.bigType_) { return }
        if (event.type == this.type_) { return }
        this.showSelect(false)
    }

    clickFunc() {
        if (this.selected) { return }

        this.showSelect(true)
        if (this.selectCallback_) {
            this.selectCallback_(this.type_);
        }

        this.dispatchEvent_(Events.game_select_btn_event, {
            bigType: this.bigType_,
            type: this.type_,
        })
    }
}