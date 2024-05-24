import EventDispatcher from "../../framework/utils/EventDispatcher";
import Events from "../other/Events";
import { DEFENDSHOPTYPE } from "../other/FightEnum";
import { DS, ES } from "../other/Global";
import FightManager from "./FightManager";

/**
 * 特殊模式：防守类
 */
class DefendFightManager extends FightManager {
    private static cinstance_: DefendFightManager
    static getInstance (): DefendFightManager {
        if (!this.cinstance_) {
            this.cinstance_ = new DefendFightManager()
        }
        return DefendFightManager.cinstance_
    }

    // 灵魂点
    public soulNum: string;
    // 最大时间
    public maxTime: string;
    // 刷新货币
    public refreshCost: string;
    // 盾牌
    public shieldDefendList: Array<SHIELDDEFENDLIST>;

    initModel () {
        super.initModel()

        this.soulNum = ES(0);
        this.maxTime = ES(300);
        this.refreshCost = ES(100);
        this.shieldDefendList = [];
    }

    addSoul (num: number) {
        this.soulNum = ES(DS(this.soulNum) + num)
    }

    // 检测
    checkSoul (cost: number): boolean {
        return DS(this.soulNum) >= cost
    }

    // 消耗
    costSoul (cost: number) {
        this.soulNum = ES(DS(this.soulNum) - cost)
    }
    
    addShiled (id: string) {
        id = id.toString()

        let has = false
        for (let i = 0; i < this.shieldDefendList.length; i++) {
            if (this.shieldDefendList[i].id == id) {
                this.shieldDefendList[i].num = this.shieldDefendList[i].num + 1
                has = true
                break
            }
        }
        if (!has) {
            this.shieldDefendList.push({
                id: id,
                num: 1,
            })
        }
    }

    delShiled (id: string) {
        for (let i = 0; i < this.shieldDefendList.length; i++) {
            if (this.shieldDefendList[i].id == id) {
                this.shieldDefendList[i].num = this.shieldDefendList[i].num - 1
                if (this.shieldDefendList[i].num <= 0) {
                    this.shieldDefendList.splice(i, 1)
                }
                EventDispatcher.dispatchEvent(Events.game_refresh_shield_event, {
                    type: DEFENDSHOPTYPE.shield,
                })
                break
            }
        }
    }
}

export default DefendFightManager