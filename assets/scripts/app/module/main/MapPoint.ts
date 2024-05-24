import DisUtils from "../../../framework/utils/DisUtils";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MapPoint extends GameView {
    private data: MAPDATA;
    private mapName: cc.Label;
    private mapDes: cc.Label;
    private bossImage: cc.Node;

    private callback_: Function;
    set callback (callback: Function) {
        this.callback_ = callback
    }

    onLoad () {
        super.onLoad()

        this.bossImage = this.getNode("bossImage")
        this.mapName = this.getCpByType("mapName", cc.Label)
        this.mapDes = this.getCpByType("mapDes", cc.Label)
    }

    setData (data: MAPDATA) {
        this.data = data
        this.mapName.string = data.name
        this.mapDes.string = data.des

        DisUtils.replaceSprite(PATHS.monster + "/" + data.img, this.bossImage)
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "mapBtn":
                if (this.callback_) {
                    this.callback_(this.data)
                }
                break;
            default:
                break;
        }
    }
}