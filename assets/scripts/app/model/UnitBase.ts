import GameManager from "../manager/GameManager";
import GameView from "../module/GameView";
import { ASYNTYPE, CAMPTYPE, STATETYPE } from "../other/FightEnum";

/**
 * 基础类
 */
const {ccclass, menu, property} = cc._decorator;

@ccclass
export default class UnitBase extends GameView {
    nsize: cc.Size; 
    // 身体碰撞块
    bodyCollider: cc.BoxCollider;
    // 当前state
    state: STATETYPE = STATETYPE.none;
    // 
    fm = GameManager.getFM();
    // 阵营
    campType: CAMPTYPE;
    // 唯一id
    uid: string;
    // 异步
    asynData: ASYNDATA;
    
    onLoad () {
        super.onLoad()

        this.bodyCollider = this.node.getComponent(cc.BoxCollider)
        this.uid = this.fm.uniqueId.toString()
    }
    
    // 处于state中
    onState (state: STATETYPE) {
        return this.state == state
    }

    setAsynData (data: ASYNDATA) {
        if (this.asynData) {
            if (this.asynData.type >= data.type) {
                return
            }
        }
        this.asynData = data
    }
    
    updateAsyn (dt: number) {
        if (this.asynData) {
            this.asynData.timer = this.asynData.timer + dt

            // check
            if (!this.asynData.did) {
                if (this.asynData.timer >= this.asynData.act) {
                    this.asynData.did = true
                    this.asynData.callback()
                }
            }

            if (this.asynData.timer >= this.asynData.ended) {
                this.asynData = null
                return
            }
        }
    }

    update2 (dt: number) {
        this.updateAsyn(dt)
    }

    clear () {
        this.node.destroy()
    }

    /****************************** 碰撞处理 ******************************/

    onCollisionEnter (other, self) {
    }

    onCollisionExit (other, self) {
    }

}