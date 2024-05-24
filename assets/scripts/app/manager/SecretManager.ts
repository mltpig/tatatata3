import { clone, ES, sortByKey } from "../other/Global";

/**
 * 加密数据
 */
 class SecretManager {
    private static instance_: SecretManager
    static getInstance (): SecretManager {
        if (!this.instance_) {
            this.instance_ = new SecretManager()
        }
        return SecretManager.instance_
    }

    private encryptList = {
        static_hero: ["attack", "atkGrow", "atkSpeed", "crit", "critHurt", "rage", "maxRage", "upExp"],
        static_monster: ["hp", "hpGrow", "speed", "exp"],
        static_wave_data: ["monster_num_limit"],
        static_special_wave_data: ["monster_num_limit", "time_limit"],
        static_pve_stage: ["hp_rate", "lv", "monsters_times", "time_limit"],
        static_special_pve_stage: ["hp_rate", "lv", "monsters_times", "time_limit"],
        static_special_pve_stage_2: ["hp_rate", "lv", "monsters_times", "time_limit"],
        static_hero_level: ["attack", "atkGrow", "atkSpeed", "crit", "critHurt", "rage", "maxRage"],
        static_shield: ["attack", "hp", "cost"],
        static_rune: ["defendCost"],
        static_rune2: ["defendCost"],
        static_hero_level_up: ["fight_exp", "cost_gold"],
        static_ad: ["num", "total", "patch", "gold"],
    };

    secret (name: string, data) {
        let newData = [];
        let list: Array<string> = this.encryptList[name]
        if (list) {
            for (const key in data) {
                let item = clone(data[key])
                for (let i = 0; i < list.length; i++) {
                    let t = item[list[i]]
                    if (t && typeof t == "number") {
                        item[list[i]] = ES(t)
                    }
                }
                newData.push(item)
            }
        } else {
            for (const key in data) {
                newData.push(clone(data[key]))
            }
        }
        
        sortByKey(newData, "id", "up")
        return newData
    }
}

export default SecretManager.getInstance()