import GameManager from "../../manager/GameManager";
import { BUFFTYPE, STATETYPE } from "../../other/FightEnum";
import ActorBase from "../ActorBase";

export default class BuffBase {
    public target: ActorBase;
    public data: BUFFDATA;
    public timer: number = 0;
    public state: STATETYPE = STATETYPE.wait;
    public fight: ATTRDATA;
    public bAttr: BULLETDATA = null;
    public delay: number;
    public num: number = 0;
    public interval: number = 0;
    public allTime: number = 0;
    public triggerNum: number = 0;
    public maxNum: number = 0;
    public specialType: boolean = false;
    public id: string;
    public fm = GameManager.getFM();
    public uid = this.fm.uniqueId.toString();

    setData (data: BUFFDATA) {
        this.data = data
        this.id = data.id.toString()
        this.delay = data.delay
        this.interval = data.interval
        // 持续时间
        this.allTime = data.ntime == -1 ? Infinity : data.ntime
        // 触发次数
        this.triggerNum = data.num == -1 ? Infinity : data.num
        // 叠加上限
        this.maxNum = data.maxNum == -1 ? Infinity : data.maxNum
        /**
         * 清理工作
         * clear == 0
         * 1 持续时间无穷 触发次数为1 叠加上限无穷
         * 2 持续时间无穷 触发次数无穷
         * 固定生效 且从buff列表中移除 减少性能消耗
         * 
         * clear == 1
         * 特殊 不会被清除
         * 
         * clear == 2
         * 特殊 强制清除
         */
        
        if (this.data.clear == 1) {
            this.specialType = false
        } else if (this.data.clear == 2) {
            this.specialType = true
        } else {
            let special1 = this.allTime == Infinity && this.triggerNum == 1 && this.maxNum == Infinity
            let special2 = this.allTime == Infinity && this.triggerNum == Infinity
            this.specialType = special1 || special2
        }
    }

    setTarget (target: ActorBase) {
        this.target = target
    }

    setFight (fight: ATTRDATA) {
        this.fight = fight
    }

    setBAttr (bAttr: BULLETDATA) {
        this.bAttr = bAttr
    }

    // 处于state中
    onState (state: STATETYPE) {
        return this.state == state
    }

    update2 (dt: number) {
        if (this.state == STATETYPE.finish) { return }

        this.timer = this.timer + dt
        if (this.timer >= this.allTime) {   
            this.clear()
            return
        }

        if (this.num >= this.triggerNum ) { return }

        if (this.timer >= this.delay) {
            let m = this.delay + this.num * this.interval
            if (this.timer >= m) {
                this.trigger()
                this.num = this.num + 1

                if (this.specialType) {
                    this.specialClear()
                }
            }
        }
    }

    // 触发
    trigger () { }

    clear () {
        if (this.state == STATETYPE.finish) { return }
        this.state = STATETYPE.finish
    }   

    specialClear () {
        if (this.state == STATETYPE.finish) { return }
        this.state = STATETYPE.finish
    }
}