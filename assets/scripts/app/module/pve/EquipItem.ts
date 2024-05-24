import ListItem from "../../../framework/creator/ListItem";
import PropItem from "../common/PropItem";

const {ccclass, property} = cc._decorator;

/**
 * 战斗内道具显示
 */
@ccclass
export default class EquipItem extends ListItem {
    @property(cc.Prefab)
    propItem: cc.Prefab = null
    
    private propNode: cc.Node;
    private selectNode: cc.Node;
    private numTxt: cc.Label;

    private data: RUNEDATA;
    private propScript: PropItem;

    onLoad () {
        super.onLoad()

        this.selectNode = this.getNode("selectNode")
        this.selectNode.active = false

        this.propNode = this.getNode("propNode")
        let node = cc.instantiate(this.propItem)
        this.propNode.addChild(node)

        this.propScript = node.getComponent(PropItem)
        this.numTxt = this.getCpByType("numTxt", cc.Label)
        this.numTxt.string = ""
    }

    setData (data: RUNEDATA) {
        this.data = data
        this.propScript.setData(data)
        if (data.num) {
            this.numTxt.string = data.num.toString()
        }
    }
}