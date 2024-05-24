import DisUtils from "../../../framework/utils/DisUtils";
import LayerManager from "../../manager/LayerManager";
import StaticManager from "../../manager/StaticManager";
import { BOOKLOCKTYPE } from "../../other/Enum";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BookRuneItem extends GameView {
    private id: string;
    private runeData: RUNEDATA;
    private lock: boolean;
    private hide: boolean = false

    private runeSp: cc.Node;
    private nameTxt: cc.Label;

    onLoad () {
        super.onLoad()
        
        this.runeSp = this.getNode("runeSp")
        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
    }

    setData (data: BOOKOPENDATA) {
        this.id = data.id
        this.lock = data.lock

        if (this.id == BOOKLOCKTYPE.hide.toString()) {
            this.hide = true
            this.node.opacity = 0
            return
        }

        this.hide = false
        this.node.opacity = 255
        this.runeData = StaticManager.getRuneById(this.id, data.type)
        this.nameTxt.string = this.runeData.name
        DisUtils.replaceSprite(PATHS.rune + "/" + this.runeData.img, this.runeSp)

        if (this.lock) {
            DisUtils.gray(this.runeSp.getComponent(cc.Sprite))
        } else {
            DisUtils.noGray(this.runeSp.getComponent(cc.Sprite))
        }
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "clickBtn":
                if (this.lock) { return }
                if (this.hide) { return }
                
                LayerManager.pop({
                    script: "BookRuneDetail",
                    prefab: PATHS.main + "/bookRuneDetail",
                    opacity: 180,
                    data: this.runeData,
                    backClick: true,
                })
                break;
            default:
                break;
        }
    }
}