import BuffBase from "./BuffBase";

export default class BuffRune extends BuffBase {

    //复制符文给第一位英雄
    trigger () {
        let heros = this.fm.getHeros()
        let heroId = this.target.uid
        let heroEquip = this.fm.equipProp.get(heroId)

        let uid = heros[0].uid
        for (let i = 0; i < 4; i++) {
            let equip = heroEquip.get(i) as RUNEDATA
            if (equip) {
                let buffs = JSON.parse(equip.value)
                this.fm.addStrengthen(uid, buffs)
            }
        }
    }
}