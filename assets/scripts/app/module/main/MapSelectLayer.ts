import DisUtils from "../../../framework/utils/DisUtils";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import { SCENETYPE, PVETYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { DS, ES } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

interface WAVEDETIAL {
    select: cc.Node,
    lock: boolean,
    infinite: boolean,
}

@ccclass
export default class MapSelectLayer extends GameView {
    private propNode: cc.Node;
    private bossImage: cc.Node;
    private mapName: cc.Label;
    private mapWave: cc.Label;
    private mapDes: cc.Label;
    private mapType: cc.Label;

    private selectData: MAPDATA;
    private mapData: MAPLOCALDATA;
    private waveId: string;
    private waveData: WAVEDATA;     // 选择的关卡
    private waveLock: boolean = false;

    private waveMoreBtn: cc.Node;
    private waveContent: cc.Node;
    private waveBtn: cc.Node;
    private waveList: Map<string, WAVEDETIAL> = new Map();

    onLoad () {
        super.onLoad()

        this.propNode = this.getNode("propNode")
        this.bossImage = this.getNode("bossImage")
        this.mapName = this.getCpByType("mapName", cc.Label)
        this.mapWave = this.getCpByType("mapWave", cc.Label)
        this.mapDes = this.getCpByType("mapDes", cc.Label)
        this.mapType = this.getCpByType("mapType", cc.Label)

        this.waveMoreBtn = this.getNode("waveMoreBtn")
        this.waveContent = this.getNode("waveContent")
        this.waveBtn = this.getNode("waveBtn")
    }

    showComplete_ () {
        this.selectData = this.cusData_

        this.mapName.string = this.selectData.name
        this.mapDes.string = this.selectData.des
        GameUtils.addAward(JSON.parse(this.selectData.drop), this.propNode)
        DisUtils.replaceSprite(PATHS.monster + "/" + this.selectData.img, this.bossImage)

        // 本地记录
        let d = PlayerManager.mapData
        for (let i = 0; i < d.length; i++) {
            if (d[i].id == this.selectData.id) {
                this.mapData = d[i]
                break
            }
        }
        this.waveId = this.mapData.waveId

        // 关卡列表
        let waveData = StaticManager.getWaveData(this.selectData.waveNormal) as WAVEDATA
        let max: number = this.selectData.waveNormalNum + 1
        for (let i = 0; i < max; i++) {
            let waveNode: cc.Node;
            if (i == 0) {
                waveNode = this.waveBtn
            } else if (i == max - 1) {
                waveNode = this.waveMoreBtn
                waveData = StaticManager.getWaveData(waveData.nextId) as WAVEDATA
            } else {
                waveNode = cc.instantiate(this.waveBtn)
                this.waveContent.addChild(waveNode)
                waveData = StaticManager.getWaveData(waveData.nextId) as WAVEDATA
            }
            let selectNode = waveNode.getChildByName("waveSelect")
            selectNode.active = i == 0
            waveNode.name = "wave_" + waveData.id
            waveNode.getChildByName("waveTxt").getComponent(cc.Label).string = waveData.name

            let lock: boolean = true
            if (waveData.type == PVETYPE.endless) {
                lock = parseInt(this.waveId) <= parseInt(this.selectData.waveNormal)
            } else {
                lock = parseInt(waveData.id) > parseInt(this.waveId)
            }
            waveNode.getChildByName("lockImage").active = lock

            waveNode.on(cc.Node.EventType.TOUCH_END, this.clickWave, this)
            this.waveList.set(waveData.id.toString(), {
                select: selectNode,
                lock: lock,
                infinite: waveData.type == PVETYPE.endless,
            })
        }

        this.showWaveData(this.waveId)
    }

    // 关卡数据
    showWaveData (waveId: string) {
        this.waveData = StaticManager.getWaveData(waveId) as WAVEDATA
        let endless = this.waveData.type == PVETYPE.endless
        this.mapType.string = this.waveData.name

        // 检测解锁
        this.waveList.forEach((value, key) => { 
            value.select.active = key == waveId
        }) 
        let d: WAVEDETIAL = this.waveList.get(waveId)
        if (!d.lock) {
            if (d.infinite) {
                this.mapWave.string = "历史最高积分: " + DS(this.mapData.endlessScore).toString()
            } else {
                if (parseInt(waveId) == parseInt(this.waveId)) {
                    this.mapWave.string = "历史最高波次: " + DS(this.mapData.wave).toString()
                } else {
                    this.mapWave.string = "已通关" 
                }
            }
        } else {
            this.mapWave.string = this.waveData.unlock_des
        }
    }

    clickWave (event) {
        let name = event.target.name
        let str = name.split("_")
        let id = str[1].toString()
        this.showWaveData(id)
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "challengeBtn":
                if (PlayerManager.isOutLine) {
                    if (this.waveData.pveType == SCENETYPE.clone || this.waveData.pveType == SCENETYPE.super) {
                        GameUtils.messageHint("离线模式无法使用该玩法")
                        return 
                    }
                }
                
                // 挑战
                let id = this.waveData.id.toString()
                let d: WAVEDETIAL = this.waveList.get(id)
                if (d.lock) {
                    GameUtils.messageHint("暂未解锁关卡")   
                } else {
                    GameUtils.loadScene({
                        type: this.waveData.pveType,
                        name: "pve",
                        mapId: this.selectData.id,
                        waveId: id,
                    })
                }
                break;
            default:
                break;
        }
    }
}