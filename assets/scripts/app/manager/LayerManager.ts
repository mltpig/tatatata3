/**
 * 弹出窗ui管理
 * 
 */

import Adaptation from "../../framework/utils/Adaptation";
import DisUtils from "../../framework/utils/DisUtils";
import { UIACT, UI_ZORDER } from "../../framework/utils/Enumer";
import ResUtils from "../../framework/utils/ResUtils";
import GameView from "../module/GameView";
import Contants from "../other/Contants";
import { TSCENE } from "../other/Tool";

// act
let tweenList = function (type: UIACT, cb: Function) {
    switch (type) {
        case UIACT.none:
        default:
            return [
                cc.tween().call(cb), 
                cc.tween().call(cb), 
            ]
            break;
        case UIACT.center:
            return [
                cc.tween().to(0.3, { scale: 1 }, { easing: "backOut" }).call(cb),
                cc.tween().to(0.2, { scale: 0 }, { easing: "backIn" }).call(cb),
            ]
            break;
        case UIACT.drop_down:
            return [
                cc.tween().to(0.3, { position: cc.v2(0, 0) }, { easing: "backOut" }).call(cb),
                cc.tween().to(0.2, { position: cc.v2(0, cc.winSize.height) }, { easing: "backIn" }).call(cb)
            ]
            break;
    }
}

class LayerManager {
    private static instance_: LayerManager
    static getInstance (): LayerManager {
        if (!this.instance_) {
            this.instance_ = new LayerManager()
        }
        return LayerManager.instance_
    }

    private popList_: Map<string, cc.Node> = new Map();
    private popIndex_: number = UI_ZORDER.popupLayer;

    get popIndex (): number {
        this.popIndex_ ++
        return this.popIndex_
    }

    pop (data: POPUPDATA) {
        // bg
        let node = new cc.Node()
        let curZ: number = data.zOrder ? data.zOrder : this.popIndex
        TSCENE().addChild(node, curZ)
        data.node = node
        data.curZOrder = curZ
        data.uid = this.popIndex_.toString()

        // mask
        let self = this
        let callback = function () {}
        if (data.backClick) {
            callback = function () {
                self.close(data.uid)
            }
        }
        let opacity = data.opacity != undefined ? data.opacity : 180
        let mask = DisUtils.createMaskBg(node, callback, opacity)
        node.addChild(mask)

        // act
        let startAct = function (cb: Function) {
            switch (data.type) {
                case UIACT.none:
                    node.setPosition(0,0);
                    break;
                case UIACT.center:
                    // 从中心弹出
                    node.setPosition(0, 0);
                    node.scale = 0;
                    break;
                case UIACT.drop_down:
                    node.setPosition(0, cc.winSize.height/2);
                    break;
                default:
                    break;
            }
            let act = tweenList(data.type, cb)
            cc.tween(node).then(act[0]).start()
        }

        // node
        ResUtils.loadPreb(data.prefab, (result: cc.Node) => {
            result.setPosition(0,0)
            node.addChild(result)

            if (data.fit) { result.addComponent(Adaptation) }               // 适配
            let script = result.getComponent(data.script) as GameView;
            script.PopData = data
            startAct(script.showComplete_.bind(script))

            data.scriptClass = script
            self.popList_[data.uid] = data
        })
    }

    close (name: string) {
        let data = <POPUPDATA> this.popList_[name]
        if (!data) { return }
        
        let clear = function () {
            data.scriptClass.closeComplete_()
            data.node.destroy();
        }
        
        data.node.stopAllActions()
        let act = tweenList(data.type, clear)
        cc.tween(data.node).then(act[1]).start()

        if (data.curZOrder >= this.popIndex_) {
            this.popIndex_ --
        }
    }
}

export default LayerManager.getInstance()