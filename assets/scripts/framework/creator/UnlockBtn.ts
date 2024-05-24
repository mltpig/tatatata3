const { ccclass, menu } = cc._decorator;
/** 疏通输入事件,该组件要放在包含监听触摸事件组件的后面 */

@ccclass
@menu("creator/UnlockBtn")
export default class UnlockBtn extends cc.Component {
    /** 是否吞噬事件 */
    private _isSwallow: boolean = false;

    onEnable() {
        if (this.node["_touchListener"]) {
            this.node["_touchListener"].setSwallowTouches(this._isSwallow);
        }
    }
}