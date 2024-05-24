import ListItem from "../../../framework/creator/ListItem";
import { BOOKLOCKTYPE } from "../../other/Enum";
import BookRuneItem from "./BookRuneItem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BookRuneNode extends ListItem {
    @property(cc.Prefab)
    bookRuneItem: cc.Prefab = null;

    private bookNode: cc.Node;
    private lockNode: cc.Node;
    private lockTxt: cc.Label;

    private data: Array<BOOKOPENDATA>; 

    onLoad () {
        super.onLoad()

        this.bookNode = this.getNode("bookNode")
        this.lockNode = this.getNode("lockNode")
        this.lockTxt = this.getCpByType("lockTxt", cc.Label)
    }

    setData (data: Array<BOOKOPENDATA>) {
        this.data = data

        this.bookNode.destroyAllChildren()
        this.bookNode.opacity = 0
        this.lockNode.opacity = 0
        let index: number = 0;
        for (let i = 0; i < data.length; i++) {
            let m = parseInt(data[i].id)
            if (m <= BOOKLOCKTYPE.open) {
                index = m
                break
            }
        }

        if (index < 0) {
            this.lockNode.opacity = 255
            this.node.setContentSize(this.node.getContentSize().width, 80)
            let str = index == BOOKLOCKTYPE.rune ? "<-------------------------- 符文 -------------------------->" : "<-------------------------- 神器 -------------------------->"
            this.lockTxt.string = str
            return
        }

        this.bookNode.opacity = 255
        for (let i = 0; i < data.length; i++) {
            let item = cc.instantiate(this.bookRuneItem)
            this.bookNode.addChild(item)

            let script = item.getComponent(BookRuneItem)
            script.setData(data[i])
        }
    }
}