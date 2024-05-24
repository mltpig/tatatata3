// state状态
enum STATETYPE {
    none,
    walk,
    wait,
    skill,
    dead,
    revive,
    finish,
}

// 瞬时状态
enum INSTANTTYPE {
    start = 10,              // 起始
    buff = 10,
    tSkill = 11,
    halo = 12,
    special = 13,
    dialog = 14,
}

enum PVESTATE {
    ready,
    battle,
    skill,
    ended,
}

enum CONDITIONTYPE {
    hp = 1,                             // 血量百分比
    cd = 2,                             // cd
    aim = 3,                            // 普攻存在目标
    atkSpeed = 4,                       // cd(攻速)
    skill = 5,                          // 释放对应类型技能
    kill = 6,                           // 击杀
    pro = 7,                            // 概率(一般填在其他条件后面 失败后清除记录)
    target = 8,                         // 其他技能存在攻击目标
    timer = 9,                          // 进场时间
    home = 10,                          // 回归
    monsterType = 11,                   // 怪物类型(适用于怪物)
    atkNum = 12,                        // 攻击次数（所有造成伤害全部算）
    rangeMonster = 13,                  // 范围内存在敌人
}

enum ADDITIONTYPE {
    skillType = 1,                      // 全部技能类型强化
    normalSkill = 2,                    // 普攻强化
    skillLaunch = 3,                    // 指定技能id
    activeSkill = 4,                    // 主动/被动强化
}

enum SKILLTYPE {
    normal  = 1,
    major   = 2,
    passive = 3,
}

enum ATTRTYPE {
    hp,
    maxHp,
    attack,
    atkSpeed,
    speed,             
    hpGrow,
    atkGrow,
    crit,
    critHurt,
    rage,
    maxRage,
    exp,
    upExp,
    length,             // 用于长度
}

enum CAMPTYPE {
    hero = 0,
    monster = 1,
    lord = 2,
    shield = 3,     
    length,
}

enum ASYNTYPE {
    skill,
    hand,
    dead,
}

enum BULLETTYPE {
    one = 1,                // 单体
    cell = 2,               // 范围伤害(子弹飞行到目标点)
    gun = 4,                // 直线
    full = 5,               // 全图
    range = 6,              // 范围伤害(直接出现在目标点)
    core = 7,               // 以攻击者为中心的范围伤害
    hcircle = 9,            // 扇形伤害
    laser = 11,             // 激光
    halo = 12,              // 光环

    // 暂无
    shoot = 3,              // 弹射
    boomerang = 8,          // 回旋镖
    chain = 10,             // 闪电链
}

// 检索目标类型
enum SEARCHTYPE {
    call,       // 普通查询敌人和释放
    enemy,      // 范围内存在敌人时 才会原地释放
    out,        // 无论有没有敌人 都原地释放
}

enum LAUNCHTYPE {
    one = 1,                // 单体 单子弹
    line = 2,               // 多角度 多子弹 类似于女枪大招
    circle = 3,             // 圆形范围内随机打击
    rand = 4,               // 全图随机敌人
    multiple = 5,           // 多重射击
}

// 技能拖动类型
enum DRAGTYPE {
    one = 1,                // 单体
    circle = 2,             // 圆形
    fan = 3,                // 扇形
    full = 4,               // 全屏
    line = 5,               // 直线
    rect = 6,               // 横向/竖向
    self = 7,               // 对自身施法时
}

enum DRAGTARGETTYPE {
    hero,                       // 英雄释放    
}

enum ROOMTYPE { 
    rand            = 1,            // 随机
    relic           = 2,            // 遗物房间
    special         = 3,            // 特殊房间
    rest            = 4,            // 休息房间
    shop            = 5,            // 商店
    monster         = 6,            // 怪物房间  
    elite           = 7,            // 精英房间
    boss            = 8,            // boss房间 
    length          = 8,        
}

enum TALENTTYPE {
    buff            = 1,                // 加buff
    normal          = 2,                // 强化普攻
    rect            = 3,                // 陷阱
    skill           = 4,                // 随机释放技能
    state           = 5,                // 添加state
    rage            = 6,                // 能量储存
    secret          = 7,                // 额外附带秘术位
    rect_num        = 8,                // 陷阱术增加
    add_skill       = 9,                // 强化主动技能
}

enum TALENTTARGETTYPE {
    none            = 0,                // 无
    hero            = 1,                // 我方英雄
    hero_rand       = 2,                // 随机英雄
    monster         = 3,                // 敌方怪物
    call            = 4,                // 召唤物
    monster_rand    = 5,                // 随机敌人
}

enum BUFFTYPE {
    attr            = 1,                // 属性
    grow            = 2,                // 其他增幅(增伤)
    rage            = 3,                // 能量 / 金币等
    unselect        = 4,                // 无法选中
    state           = 5,                // 目标添加 state
    blood           = 6,                // 掉血/治疗
    status          = 7,                // 添加状态
    addition        = 8,                // 目标添加 强化
    special         = 9,                // 目标添加 特性
    refresh         = 10,               // 数值刷新形buff
    rune            = 11,               // 符文复制一份给第一位英雄
    condi           = 12,               // 条件性开始和结束buff
    egg             = 13,               // 概率加金蛋
    hide            = 14,               // 隐藏当前符文装备
    randHide         = 15,              // 隐藏随机英雄随机一件装备
}

// 增幅buff
enum BUFFGROWTYPE {
    hurt            = 1,                // 增伤/减伤
    normalHurt      = 2,                // 增伤/减伤普通攻击伤害
    boss            = 3,                // 受击目标为boss时
    skillHurt       = 4,                // 增伤/减伤技能攻击伤害
    season          = 5,                // 受击目标为元素怪时
    atkHurt         = 6,                // 攻击者攻击力固定增伤害
}

enum SKYTYPE {
    hot             = 1,                // 炎热
    snow            = 2,                // 下雪
    rain            = 3,                // 雨水
    length          = 3,                
}

enum MONSTERTYPE {
    normal          = 1,                // 普通
    random          = 2,                // 符文怪物
    boss            = 3,                // boss
    machine         = 4,                // 机械怪物
    water           = 5,                // 元素怪物1 
    fire            = 6,                // 元素怪物2
    thunder         = 7,                // 元素怪物3
    electric        = 8,                // 元素怪物4
}

enum EFFECTTYPE {
    curtain             = 1,            // 闭幕：斩杀低于血量值的敌人
}

enum RECTTRIGGERTYPE {
    hit                 = 1,            // 碰撞触发
    ntime               = 2,            // 时间触发
}

enum RECTTYPE {
    monster             = 1,            // 召唤怪物
    buff                = 2,            // 添加buff
    skill               = 3,            // 触发技能
}

enum ENTRYTYPE {
    fire                = 1,            // 点燃
}

enum STATUSTYPE {
    unselect                = 1,            // 无法选中
    fixed                   = 2,            // 眩晕 控制
    immune                  = 3,            // 免疫debuff
}

// 飘血
enum FLYTYPE {
    hurt,
    treat,
    crit,
}

// 对象池
enum NODEPOOLTYPE {
    bullet,
    monster,
    effect,                 // 暂无
    fly,
    attr,
    length,                 // 长度
}

// 计算方式
enum CALCULATIONTYPE {
    add = 1,                // 加
    minus = 2,              // 减
    ride = 3,               // 乘
    except = 4,             // 除
    replace = 5,            // 替换
    arr = 6,                // 数组组合
}

// 道具显示类型
enum PROPTYPE {
    mount = 1,                  // 可以镶嵌的
    use = 2,                    // 可使用道具
    fixed = 3,                  // 不可使用的道具
}

// 所有强化类型
enum PROPADDTYPE {
    buff = 1,                   // buff 
}

// 特殊类型
enum SPECIALTYPE {
    skill_crit = 1,             // 主动技能暴击
    skill_pro = 2,              // 主动技能额外释放
    distance = 3,               // 普攻附带距离的伤害
    campAtk = 4,                // 攻击对应阵营角色
    appear = 5,                 // 怪物出场
    skill_normal = 6,           // 普通攻击额外释放
    crit = 7,                   // 暴击率倍率
    critHurt = 8,               // 暴击伤害倍率
    runeCd = 9,                 // 降低符文cd
    rage2Atk = 10,              // 耗能放技能
    activeSkill = 11,           // 主动技能释放处理(所有角色)
    activeHurt = 12,            // 主动技能释放造成伤害(所有角色)
    lv2Atk = 13,                // 等级转化为攻击力
    skillDistance = 14,         // 技能附带距离的伤害
    super = 15,                 // 该角色获取的第一个符文变为变态效果
    kill = 16,                  // 斩杀
    s2nor = 17,                 // 将所有伤害处理时转化为普攻类型
    atkSpeed = 18,              // 攻速倍率
    hurt2Normal = 19,           // 伤害的百分比转化为普攻伤害
    lvAddCritHurt = 20,         // 升级增加暴击伤害
    length, 
}

// 范围伤害
enum HURTBUFFTYPE {
    num     = 1,            // 数量
}

// 对话内容
enum DIALOGTYPE {   
    skill           = 1,            // 主动技能
}

enum PVETYPE {
    normal      = 1,
    endless     = 2,
}

enum RUNETYPE {
    rune        = 1,
    artifact    = 2,
}

enum MONSTERTYPE {
    none = 1,
    defend = 2,
}

enum SCENETYPE {
    none,
    pve,            // 普通
    pveDefend,      // 防守
    common,         // 通用
    clone,          // 克隆
    select,         // 自选
    camp,           // 营地
    more,           // 多人
    possess,        // 附身
    lord,           // 领主
    super,          // 变态版
    repeat,         // 重复符文
}

enum DEFENDSHOPTYPE {
    shield,
    rune,
}

enum GROUPTYPE {
    default,
    monster,
    lord,
    hero,
    bullet,
    drag,
    shield
}

enum JOBTYPE {
    hunter          = 1,
    magic           = 2,
    assassin        = 3,
    rune            = 4,
    power           = 5,  
    god             = 6,
    space           = 7,
    energy          = 8,
    awesome         = 9,
    length          = 9,
}

enum RUNESELECTTYPE {
    single,
    more,
}

// 元素化（水火雷电）
enum SEASONTYPE {
    water = 1,
    fire = 2,   
    thunder = 3,
    electric = 4,   
}

export {
    STATETYPE,
    INSTANTTYPE,
    PVESTATE,
    CONDITIONTYPE,
    ADDITIONTYPE,
    SKILLTYPE,
    ATTRTYPE,
    CAMPTYPE,
    ASYNTYPE,
    BULLETTYPE,
    SEARCHTYPE,
    LAUNCHTYPE,
    DRAGTYPE,
    DRAGTARGETTYPE,
    ROOMTYPE,
    TALENTTYPE,
    BUFFTYPE,
    SKYTYPE,
    MONSTERTYPE,
    RECTTRIGGERTYPE,
    RECTTYPE,
    ENTRYTYPE,
    STATUSTYPE,
    FLYTYPE,
    NODEPOOLTYPE,
    CALCULATIONTYPE,
    PROPTYPE,
    PROPADDTYPE,
    SPECIALTYPE,
    BUFFGROWTYPE,
    HURTBUFFTYPE,
    DIALOGTYPE,
    PVETYPE,
    RUNETYPE,
    SCENETYPE,
    DEFENDSHOPTYPE,
    GROUPTYPE,
    JOBTYPE,
    RUNESELECTTYPE,
    SEASONTYPE,
}