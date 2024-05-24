import GameView from "../GameView";
import AwardItem from "./AwardItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AwardPanel extends GameView {
    @property(cc.Prefab)
    awardItem: cc.Prefab = null;

    private data: Array<AWARDDATA>;
    private addNode: cc.Node;
    private cost: boolean = false;

    onLoad () {
        super.onLoad()
        this.addNode = this.getNode("addNode")
    }

    setData (data: Array<AWARDDATA>, cost: boolean = false) {
        this.data = data
        this.cost = cost
        this.initView()
    }

    initView () {
        for (let i = 0; i < this.data.length; i++) {
            let v = this.data[i];
            
            let item = cc.instantiate(this.awardItem)
            this.addNode.addChild(item)
            
            let script: AwardItem = item.getComponent(AwardItem)
            script.setData(v, this.cost)
        }
    }
}