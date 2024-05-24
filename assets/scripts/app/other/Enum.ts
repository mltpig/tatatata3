// 游戏枚举
enum MESSAGETYPE {
    client,
    server,
}

// 弹出窗类型
enum TIPSTYPE {
    ok,
    all,
}

enum SELECTBTNBIGTYPE {
    none,
    fight,
    book,
    award, 
    rank,
    model,          //  关卡模式
    hero,
}

enum SELECTBTNTYPE {
    none = 0,

    // SELECTBTNBIGTYPE.fight
    hero = 1,
    artifact = 2,
    shop = 3,
    
    // SELECTBTNBIGTYPE.book
    book_hero = 10,
    book_rune = 11,
    book_monster = 12,
    book_rune2 = 13,

    // SELECTBTNBIGTYPE.award
    award_sign = 20,
    award_daily = 21,
    award_achieve = 22,

    // SELECTBTNBIGTYPE.model
    model_normal = 30,
    model_dream = 31,
    model_normal2 = 32,
    model_dream2 = 33,

    // SELECTBTNBIGTYPE.hero
    hero_stage = 40,
    hero_lv = 41,
}

// 刷新界面
enum REFRESHINFOTYPE {
    exp,        
    attr,
    skill,
}

enum FIGHTPANELTYPE {
    skill,
    attr,
    hurt,
}

// 图鉴类型
enum BOOKTYPE {
    hero        = 1,
    rune        = 2,
    monster     = 3,
}

enum BOOKLOCKTYPE {
    hide        = -1,           // 隐藏
    open        = -100,         // 已解锁
    lock        = -200,         // 未解锁
    rune        = -300,
    artifact    = -400, 
}

//成就
enum ACHIEVETYPE {
    map     = 7,        
    kill    = 8,   
    rune    = 9,   
    box     = 10,        
    ad      = 11, 
    pass    = 12,       // 通过关卡
    wave    = 13,       // 无限波波次
    hurt    = 14,       
    level   = 15,       
    diff    = 16,       // 通关难度
}

//日常
enum DAILYTYPE {
    login   = 1,
    ad      = 2,
    map     = 3,
    kill    = 4,
    rune    = 5,
    all     = 10,
}

// 通用规则处理
enum COMMONLOGICTYPE {
    login,
    ad,
    map,
    kill,
    rune,
    box,
    pass,
    wave,
    hurt,
    level,
    diff,
}

enum ITEMTYPE {
    gold = 4,           // 金币
    patch = 5,          // 碎片
    box = 6,            // 宝箱
}

// 红点
enum REDDOTTYPE {
    award               = 0,
    sign                = 1,
    daily               = 2,
    achieve             = 3,
    heroUp              = 4,
    length              = 5,
}

export {
    MESSAGETYPE,
    TIPSTYPE,
    SELECTBTNBIGTYPE,
    SELECTBTNTYPE,
    REFRESHINFOTYPE,
    FIGHTPANELTYPE,
    BOOKTYPE,
    ACHIEVETYPE,
    DAILYTYPE,
    COMMONLOGICTYPE,
    ITEMTYPE,
    BOOKLOCKTYPE,
    REDDOTTYPE,
}