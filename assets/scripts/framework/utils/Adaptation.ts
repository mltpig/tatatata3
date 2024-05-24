const { ccclass, menu, property } = cc._decorator;

// 游戏固定比例
const ratio: number = 2

/**
 * 游戏适配
 */
@ccclass
@menu("utils/Adaptation")
export default class Adaptation extends cc.Component {

    start () {
        // 严格按照2:1的尺寸来
        let pro = cc.winSize.width / cc.winSize.height;
        let isNotFit = pro <= ratio

        let canvas = this.node.getComponent(cc.Canvas);
        if (canvas && isNotFit) {
            canvas.fitHeight = false;
            canvas.fitWidth = true;
        }

        let bg = this.node.getChildByName("gameBg")
        if (bg) {
            let scale: number = 1
            if (isNotFit) {
                scale = cc.winSize.height / (cc.winSize.width / ratio)
            } else {
                scale = cc.winSize.width / (cc.winSize.height * ratio)
            }
            bg.scale = scale
        }
    }
}