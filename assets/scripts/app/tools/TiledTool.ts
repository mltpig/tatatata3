import GameView from "../module/GameView";
import Contants from "../other/Contants"

const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("tools/TiledTool")
export default class TiledTool extends GameView {
    private txtComplete: cc.Node;
    private btnStart: cc.Node;
    private tiledMap: cc.TiledMap;
    private maps: Array<string> = [];
    private index: number = 0;
    private twoIndex: number = 1;
    private loading: boolean = false;
    private offset: cc.Vec2;
    private tiledNode: cc.Node;
    private mapSize: cc.Size;

    start () {
        this.txtComplete = this.getNode("txtComplete")
        this.btnStart = this.getNode("btnStart")
        this.tiledNode = this.getNode("tiledNode")
        this.tiledMap = this.getCpByType("tiledNode", cc.TiledMap)
        this.txtComplete.active = false

        this.maps = [
            "map001",
        ]
    }

    analysis () {
        let layer = this.tiledMap.getLayer("road" + this.twoIndex)
        if (!layer) {
            this.loading = false
            this.twoIndex = 1
            // this.onStart()
            return
        }


        this.twoIndex++
        let laySize = layer.getLayerSize()
        for (let i = 0; i < laySize.width; i++) {
            for (let j = 0; j < laySize.height; j++) {
                let tiled = layer.getTiledTileAt(i, j, true)
                if (tiled.gid != 0) {
                    let node = tiled.node
                    let item = new cc.Node()
                    let x = node.x - this.offset.x + 16 
                    let y = node.y - this.offset.y
                    item.setPosition(cc.v2(x, y)) 
                    item.parent = this.tiledNode
                    item.color = cc.color(255,0,0)

                    let txt = item.addComponent(cc.Label)
                    txt.string = (i * this.mapSize.width + j).toString()
                    txt.fontSize = 12
                }
            }
        }

        this.analysis()
    }

    onStart () {
        if (this.loading) {
            this.analysis()
        } else {
            if (this.index >= this.maps.length) {
                this.txtComplete.active = true
                this.btnStart.active = false
                return
            }

            let self = this
            let path = "map/" + this.maps[this.index]
            cc.resources.load(path, function (error, map) {
                self.tiledMap.tmxAsset = <any>map
                let tiledSize = self.tiledMap.getTileSize()
                self.mapSize = self.tiledMap.getMapSize()
                self.offset = cc.v2(self.mapSize.width * tiledSize.width / 2, self.mapSize.height * tiledSize.height / 2)
                self.analysis()
                self.index++;
            })
        }
    }
}