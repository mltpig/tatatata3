/**
 * 表格结构体
 */

// 大关卡数据
interface WAVEDATA {
    id: string,
    name: string,
    des: string,
    nextId: string,
    type: PVETYPE,
    pveType: SCENETYPE,
    showMonster: string,
    map: string,
    stage_id: number,
    stage_open_limit: string,
    monster_num_limit: string,
    unlock_des: string,
    difficulty: number,
    time_limit: string,
}

// 波次出怪表格
interface WAVESTAGEDATA {
    id: string,
    next_id: number,
    waves_des: string,
    hp_rate: string,
    lv: string,
    monsters: string,
    monsters_times: string,
    route: string;
    type: number;
    time_limit: string;
    round: number,
    award: string,
}

// 怪物信息
interface MONSTERINFO {
    id: string,
    name: string,
    des: string,
    res: string,
    type: MONSTERTYPE,
    hp: string,
    hpGrow: string,
    speed: string,
    size: string,
    exp: string,
}

// 英雄信息
interface HEROINFO {
    id: string,
    name: string,
    des: string,
    attack: string,
    atkGrow: string,
    atkSpeed: string,
    crit: string,
    critHurt: string,
    rage: string,
    maxRage: string,
    upExp: string,
    size: cc.Size,
    normalSkill: string,
    initiativeSkill: string,
    extraStates: Array<string>,
    res: string,
    atkRange: number,
}

// 守卫者
interface SHIELDDATA {
    id: string,
    name: string,
    des: string,
    res: string,
    attack: string,
    hp: string,
    size: string,
    extraStates: string,
    cost: string,
}

// 子弹
interface BULLETDATA {
    id: string,
    name: string,
    des: string,
    type: BULLETTYPE,
    search: SEARCHTYPE,
    jump: number,
    launch: string,
    skillType: SKILLTYPE,
    atk: number,
    crit: number,
    atkBuff: string,
    killCondition: string,
    killBuff: string,
    buff: string,
    dragType: DRAGTYPE,
    dragData: string,
    actTime: number,
    endTime: number,
    range: number,
    speed: number,
    hurtRect: string,
    hurtTime: string,
    hurtBuff: string,
    campType: string,
    extra: string,
    size: string,
    res: string,
    res_dir: number,
    hitUpEffect: string,
    hitDownEffect: string,
    hitEffect: string,
    effectDelay: number,
    launchSound: string,    // 攻击音效
    hitSound: string,       // 受击音效
}

// buff
interface BUFFDATA {
    id: string,
    name: string,
    des: string,
    type: number,
    clear: number,
    key: string,
    value: number,
    percent: number,
    harmType: number,
    ntime: number,
    stable: number,
    delay: number,
    interval: number,
    num: number,
    maxNum: number,
    extra: string,
    entry: ENTRYTYPE,
    condition: string,
    effect: string,
    wrapMode: number,
    profit: number,
}

// 事件块
interface RECTDATA {
    id: string,
    type: number,
}

// 道具信息
interface PROPDATA {
    id: string,
    name: string,
    des: string,
    type: ITEMTYPE,
    value: string,
    img: string,
}

// 遗物信息
interface RUNEDATA {
    uid?: string,
    machine?: boolean,
    heroUid?: string,
    index?: number,
    num?: number,

    old_rune_id?: string,
    super?: boolean,
    superData?: RUNEDATA,
    
    id: string,
    name: string,
    des: string,
    type: RUNETYPE,
    value: string,
    img: string,
    cdTime: number,
    defendCost: string,
    value2: string,     // 机械化
    des2: string,
}

// 强化表
interface ADDITIONDATA {
    id: string,
    name: string,
    des: string,
    type: ADDITIONTYPE,
    key: string,
    value: string,
    extra: string,
    ctype: CALCULATIONTYPE,
}

// 特性数据
interface SPECIALDATA {
    id: string,
    type: SPECIALTYPE,
    value: string,
}

// 关卡数据
interface MAPDATA {
    id: string,
    name: string,
    waveNormal: string,
    waveInfinite: string,
    waveNormalNum: number,
    drop: string,
    des: string,
    img: string,
    index: number,
    small_des?: string,
}

// 签到数据
interface SIGNDATA {
    id: string,
    prop: string,
    name: string,
    des: string,
}

// 日常任务
interface DAILYDATA {
    id: string,
    name: string,
    des: string,
    type: DAILYTYPE,
    num: number,
    extra: string,
    prop: string,
}

// 成就数据
interface ACHIEVEDATA {
    id: string,
    name: string,
    des: string,
    type: ACHIEVETYPE,
    ntype: number,
    num: number,
    extra: string,
    prop: string,
    nextId: string,
}

// 通用奖励格式
interface AWARDDATA {
    bid: number,
    type: number,
    num: number,
}

// 宝箱格式奖励
interface BOXDATA {
    id: string,
    box: string,
    type: number,
    item: string,
    num: string,
    weight: number,
}

// 英雄外部升级
interface HEROUPDATA {
    id: string,
    hero: string,
    level: number,
    attack: string,
    atkGrow: string,
    atkSpeed: string,
    crit: string,
    critHurt: string,
    rage: string,
    maxRage: string,
    cost_shard: string,
    cost_gold: string,
}

// 英雄外部初始化经验处理
interface HEROEXPDATA {
    id: string,
    hero: string,
    level: number,
    fight_exp: string,
    cost_gold: string,
}

// 提示
interface TIPSDATA {
    id: string,
    des: string,
}

interface ADDATA {
    id: string,
    name: string,
    res: string,
    num: string,
    total: string,
    type: number,
    des: string,
    patch: string,
    gold: string,
}

interface MAPINFO {
    id: string,
    data: string,
}

interface JOBDATA {
    id: string,
    name: string,
    type: JOBTYPE,
    res: string,
    buff: string,
    des: string,
}

interface SEASONDATA {
    id: string,
    element: number,
    element_lv: number,
    lv: number,
    monsters: string,
    monsters_times: number,
    hp_rate: number,
}

interface SUPERRUNEDATA {
    id: string,
    runes: string,
}

