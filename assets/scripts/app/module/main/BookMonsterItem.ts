import DisUtils from "../../../framework/utils/DisUtils";
import GameManager from "../../manager/GameManager";
import LayerManager from "../../manager/LayerManager";
import StaticManager from "../../manager/StaticManager";
import { BOOKLOCKTYPE } from "../../other/Enum";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BookMonsterItem extends GameView {
    private id: string;
    private monsterData: MONSTERINFO;
    private lock: boolean;
    private hide: boolean = false

    private headIcon: cc.Node;
    private nameTxt: cc.Label;

    fm = GameManager.getFM();

    onLoad () {
        super.onLoad ()

        this.headIcon = this.getNode("headIcon")
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
        this.monsterData = StaticManager.getStaticValue("static_monster", this.id) as MONSTERINFO
        DisUtils.replaceSprite(PATHS.monster + "/" + this.monsterData.res, this.headIcon)
        this.nameTxt.string = this.monsterData.name

        if (this.lock) {
            DisUtils.gray(this.headIcon.getComponent(cc.Sprite))
        } else {
            DisUtils.noGray(this.headIcon.getComponent(cc.Sprite))
        }
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "clickBtn":
                if (this.lock) { return }
                if (this.hide) { return }

                LayerManager.pop({
                    script: "BookMonsterDetail",
                    prefab: PATHS.main + "/bookMonsterDetail",
                    opacity: 180,
                    data: this.monsterData,
                    backClick: true,
                })
                break;
            default:
                break;
        }
    }
}