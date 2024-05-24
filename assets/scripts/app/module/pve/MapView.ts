import StaticManager from "../../manager/StaticManager";
import Contants from "../../other/Contants";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class MapView extends GameView {
    private tiledMap: cc.TiledMap;      
    private tiledSize: cc.Size;             // 格子的大小
    private mapSize: cc.Size;               // 地图大小
    private mapContentSize: cc.Size;        // 地图实际大小
    private offset: cc.Vec2;                // 偏移

    private roads_ : Array<number> = [];
    private towers_ : Array<number> = [];
    private lords_: Array<number> = [];

    get roads () { return this.roads_ }
    get towers () { return this.towers_ }
    get lords () { return this.lords_ }

    init () {
        this.tiledMap = this.node.getComponent(cc.TiledMap);
        this.tiledSize = this.tiledMap.getTileSize()
        this.mapSize = this.tiledMap.getMapSize()
        this.mapContentSize = cc.size(this.mapSize.width * this.tiledSize.width, this.mapSize.height * this.tiledSize.height)
        this.offset = cc.v2(this.tiledSize.width / 2, this.tiledSize.height / 2)

        this.initRoad()
        this.initTower()
        // this.initLords()
    }

    initRoad () {
        for (let index = 0; index < Contants.MAX_ROAD_NUM; index++) {
            let layer = this.tiledMap.getLayer("road" + (index + 1))
            if (!layer) { break }

            let laySize = layer.getLayerSize()
            for (let i = 0; i < laySize.width; i++) {
                for (let j = 0; j < laySize.height; j++) {
                    let tiled = layer.getTiledTileAt(i, j, true)
                    if (tiled.gid != 0) {
                        let key = i * this.mapSize.width + j
                        this.roads_.push(key)               
                    }
                }
            }
        }
    }

    initTower () {
        let layer = this.tiledMap.getLayer("tower")
        let laySize = layer.getLayerSize()

        for (let i = 0; i < laySize.width; i++) {
            for (let j = 0; j < laySize.height; j++) {
                let tiled = layer.getTiledTileAt(i, j, true)
                if (tiled.gid != 0) {
                    let index = i * this.mapSize.width + j
                    this.towers_.push(index)               
                }
            }
        }
    }

    // 无领主
    // initLords () {
        // let layer = this.tiledMap.getLayer("lord")
        // let laySize = layer.getLayerSize()

        // for (let i = 0; i < laySize.width; i++) {
        //     for (let j = 0; j < laySize.height; j++) {
        //         let tiled = layer.getTiledTileAt(i, j, true)
        //         if (tiled.gid != 0) {
        //             this.lords_.push(i * this.mapSize.width + j)               
        //         }
        //     }
        // }
    // }
}
