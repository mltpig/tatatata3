import DisUtils from "../../../framework/utils/DisUtils";
import { MONSTERTYPE } from "../../other/FightEnum";
import { PATHS } from "../../other/Paths";
import CloneFightManager from "../CloneFightManager";
import MonsterActor from "./MonsterActor";

const bossScale: number = 1.2
/**
 * 特殊模式：克隆大作战
 * 怪物
 */
 const {ccclass, menu, property} = cc._decorator;

 @ccclass
 export default class CloneMonsterActor extends MonsterActor {

    resetIcon () {}

    setIdModel () {
        let cdata = (this.fm as CloneFightManager).cloneData

        if (this.data.type == MONSTERTYPE.boss) {
            this.nsize = cc.size(cdata.size.width * bossScale, cdata.size.height * bossScale)
        } else {
            this.nsize = cdata.size
        }
        this.bodyCollider.size = this.nsize
        this.headIcon.setContentSize(this.nsize)
        
        if (this.data.type == MONSTERTYPE.random) {
            DisUtils.replaceSprite(PATHS.monster + "/" + this.data.res, this.headIcon)
        } else {
            DisUtils.replaceSprite(PATHS.hero + "/" + cdata.res, this.headIcon)
        }
    }
}