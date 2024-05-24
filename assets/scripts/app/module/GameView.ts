import ViewBase from "../../framework/creator/ViewBase";
import ResUtils from "../../framework/utils/ResUtils";
import LayerManager from "../manager/LayerManager";
import { PATHS } from "../other/Paths";
import TitledLayer from "./common/TitledLayer";

const {ccclass, property} = cc._decorator;

const TITLE_ZODER = 1000

@ccclass
export default class GameView extends ViewBase {
    public popData_: POPUPDATA;            // 弹出窗数据
    public cusData_: any;                  // 传入数据
    
    set PopData (data: POPUPDATA) {
        this.popData_ = data
        this.cusData_ = data.data
    }
    
    // android 11 mask 不兼容
    addMaskUse () {
        let cam = new cc.Node("CameraClearStencil")
        let c = cam.addComponent(cc.Camera)
        
        cc.find("Canvas").addChild(cam)
        cam.groupIndex = 1;
        c.clearFlags = cc.Camera.ClearFlags.DEPTH || cc.Camera.ClearFlags.STENCIL;
        c.depth = 10;
        c.cullingMask = 0;
    }

    // 添加标题框
    addTitleLayer_ (data: TITLEDDATA) {
        ResUtils.loadPreb(PATHS.common + "/titledLayer", (result: cc.Node) => {
            result.setPosition(0,0)
            this.node.addChild(result, TITLE_ZODER)
            let script = result.getComponent(TitledLayer)
            script.setData(data)
        })
    }

    // 弹出动作结束
    showComplete_ () {}

    // 关闭弹出窗结束
    closeComplete_ () {
        if (this.popData_ && this.popData_.callback) {
            this.popData_.callback()
        }
    }
    
    // 关闭界面
    close_ () {
        if (this.popData_ && this.popData_.uid) {
            LayerManager.close(this.popData_.uid)
        }
    }
}