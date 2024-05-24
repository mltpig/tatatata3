import PlayerManager from "../manager/PlayerManager";
import StaticManager from "../manager/StaticManager";
import FightManager from "./FightManager";

/**
 * 特殊模式：变态符文
 */
class SuperFightManager extends FightManager {
    private static cinstance_: SuperFightManager
    static getInstance (): SuperFightManager {
        if (!this.cinstance_) {
            this.cinstance_ = new SuperFightManager()
        }
        return SuperFightManager.cinstance_
    }

    // 初始4个变态符文
    initModel () {
        let id = PlayerManager.getSuperTime()
        let rs: SUPERRUNEDATA = StaticManager.getRuneSuperSamsaraById(id)   

        let ids = JSON.parse(rs.runes)
        for (let i = 0; i < ids.length; i++) {
            let superData: RUNEDATA = StaticManager.getRuneSuperById(ids[i].toString())
            let runeData: RUNEDATA = StaticManager.getRuneById(superData.old_rune_id.toString())

            runeData.uid = this.uniqueId.toString()
            runeData.super = true
            runeData.superData = superData
            runeData.img = superData.img
            runeData.name = superData.name
            runeData.des = superData.des
            runeData.des2 = superData.des2
            runeData.cdTime = superData.cdTime
            
            this.addEquip(runeData)
        }
    }
}

export default SuperFightManager