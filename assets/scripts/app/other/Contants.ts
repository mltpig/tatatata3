import { ES } from "./Global";

// 游戏常量
const Contants = {
    
    // 逻辑考虑
    // 1倍速 第3帧执行 前两帧休息
    // 2倍速 第2 3帧执行 前一帧休息
    // 3倍速 全3帧执行

    // 限制帧
    FRAME: 1/20,

    ROTARY_MAX: 8,

    MAXSTAGE: ES(30),   // 满阶
    P2S: ES(10),        // 碎片转化为灵魂
    S2P: ES(30),        // 灵魂转化为碎片
    
    // tiledmap
    MAX_ROAD_NUM: 10,       // 最大路径数
    MAP_WIDTH: 16,          // 长个数
    MAP_HEIGHT: 12,         // 宽个数
    MAP_LEN: 75,            // 单个长度
    MAP_CLEN: 37.5,           // 单个长度一半
    MAP_WLEN: 16 * 75,
    MAP_HLEN: 12 * 75,
    MAP_CW: 16 * 75 / 2,
    MAP_CH: 12 * 75 / 2,
    MAP_CW_OFFSET: 275,
    
    GROUP: {
        monster: "monster",
        lord: "lord",
        hero: "hero",
        bullet: "bullet",
        drag: "drag",
    },
    
    ATTRINFO: [
        "hp",
        "maxHp",
        "attack",
        "atkSpeed",
        "speed",
        "hpGrow",
        "atkGrow",
        "crit",
        "critHurt",
        "rage",
        "maxRage",
        "exp",
        "upExp",
    ],

    // 英雄展示属性
    SHOWATTR: [
        "attack",
        "atkSpeed",
        "atkGrow",
        "crit",
        "critHurt",
        "rage",
        "maxRage",
    ],

    ATTRLABEL: {
        hp: "血量",
        maxHp: "最大血量",
        attack: "攻击",
        atkSpeed: "攻速",
        speed: "速度",
        hpGrow: "血量成长",
        atkGrow: "攻击成长",
        crit: "暴击",
        critHurt: "暴伤",
        rage: "能量回复",
        maxRage: "最大能量",
        exp: "经验",
    },

}

export default Contants;