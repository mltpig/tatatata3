import GameView from "../GameView";

/**
 * 发射器
 */
 const {ccclass, property} = cc._decorator;

 @ccclass
export default class BloodItem extends GameView {
    private hpLoad: cc.ProgressBar;
    private rageLoad: cc.ProgressBar;
    private hpLoadNode: cc.Node;
    private rageLoadNode: cc.Node;
    private hpBar: cc.Node;

    onLoad() {
        super.onLoad()
        
        this.hpLoadNode = this.getNode("hpLoad")
        this.rageLoadNode = this.getNode("rageLoad")
        this.hpBar = this.getNode("hpBar")
        this.hpLoad = this.getCpByType("hpLoad", cc.ProgressBar)
        this.rageLoad = this.getCpByType("rageLoad", cc.ProgressBar)
        this.hpLoad.progress = 0
        this.rageLoad.progress = 0
        this.hpLoadNode.active = false
        this.rageLoadNode.active = false
    }
    
    set hpProgress (progress: number) {
        this.hpLoad.progress = progress
    }

    set rageProgress (progress: number) {
        this.rageLoad.progress = progress
    }

    set active (active: boolean) {
        this.node.active = active
    }

    set hpActive (active: boolean) {
        this.hpLoadNode.active = active
    }

    set rageActive (active: boolean) {
        this.rageLoadNode.active = active
    }

    set hpColor (color: cc.Color) {
        this.hpBar.color = color
    }

}