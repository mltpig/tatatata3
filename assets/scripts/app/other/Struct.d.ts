/**
 * 游戏结构体
 */

// 出怪
interface MONSTERQUEUE {
    delayStep: number,
    id: string,             
    pathId: string,
    rate: string,
    level: string,
    season?: boolean,      // 元素化
}

interface LORDINFO {
    hp: string,
    size: cc.Size,
    index: number,
}

interface BATTLEINFO {
    id: string,
    index: number,
}

interface STATEDATA {
    uid?: string,
    id: number,
    pid: number,
    name?: string,
    from?: Array<number>,
    to?: string,
    pos?: number,
    skillId?: string,
    condition: Array<Array<any>>,
    mv?: string,
    sort: number,
    extra?: string;
    once?: number,
    started?: boolean,      // 启动条件判断
    ended?: boolean,        // 已经至少执行一次
}

interface ATTRDATA {
    uid?: string,
    pid?: string,  // 角色id
    attack?: string,
    hp?: string,
    maxHp?: string,
    atkSpeed?: string,
    atkSpeedNum?: string,
    speed?: string,
    hpGrow?: string,
    atkGrow?: string,
    crit?: string,
    critHurt?: string,
    rage?: string,
    maxRage?: string,
    exp?: string,
    upExp?: string,
}

interface ASYNDATA {
    type: ASYNTYPE,
    act: number,
    ended: number,
    timer: number,
    callback: Function,
    did: boolean,
}

interface launchData {
    attacker: ActorBase,
    target?: ActorBase,
    targetPos?: cc.Vec2,
    startPos: cc.Vec2,
    fight: ATTRDATA,
    bAttr: BULLETDATA,
}

interface HURTRECTDATA {
    pos: cc.Vec2,
    fight: ATTRDATA,
    bAttr: BULLETDATA,
}

interface TITLEDDATA {
    name: string,
    cb: Function,
}

interface BUFFADD {
    uid: string,
    key: string,
    value: number,
    per: boolean,
}

interface POPUPDATA {
    script: string,
    prefab: string,
    opacity ?: number,
    type ?: UIACT,
    data ?: any,
    backClick ?: boolean,
    callback ?: Function,
    zOrder ?: number,
    fit ?: boolean,
    
    node ?: cc.Node,
    curZOrder ?: number,
    scriptClass ?: GameView,
    uid?: string,    // 唯一id 用于删除节点
}

interface STATUSDATA {
    uid: string,
    type: STATUSTYPE,
}

interface ACCOUNTINFO {
    account: string,
    password: string,
}

interface DRAGDATA {
    pos: cc.Vec2,
    bAttr: BULLETDATA,
    attacker ?: ActorBase,
    type: DRAGTARGETTYPE,
    prefab: cc.Prefab,
}

interface SELECTHERODATA {
    heroId: string,         // 英雄唯一id 
    index: number,          // 位置
    equip: RUNEDATA,        // 卸下装备
    item: CrewItem;         // 对应显示
    selectData ?: RUNEDATA, // 装备上装备
}

interface RANKDATA {
    uid: string,
    name: string,
    wave: number,
    score: number,
    rank?: number,
}

interface BOOKOPENDATA {
    id: string,
    lock: boolean;
    type?: number;
}

interface HEROATTR {
    attack: number,
    atkSpeed: number,
    atkGrow: number,
    crit: number,
    critHurt: number,
    rage: number,
    maxRage: number,
}

interface SCENEDATA {
    name: string,
    type: SCENETYPE,
    waveId?: string,
    mapId?: string,
    customData?: any;
}

interface SHIELDDEFENDLIST {
    id: string,
    num: number,
}

interface TOWERDATA {
    index: number,
    pos: cc.Vec2,
    node: cc.Node,
    rect: cc.Rect,
}

interface SORTDATA {
    id: number,
    level: number,
    exp: number,
    patch: number,
}

/******************************** 本地记录数据 ********************************/

// 玩家数据
interface PLAYERDATA {
    uid: string,
    name: string,
    gold: string,
}

// 关卡
interface MAPLOCALDATA {
    id: string,             // 关卡
    waveId: string,         // 小关卡
    wave: string,
    score: string,
    endlessId: string,      // 无限波
    endlessWave: string,    
    endlessScore: string,
}   

// 图鉴
interface BOOKLOCALDATA {
    id: string,
    type: number,
}

// 英雄
interface HEROLOCALDATA {
    id: string,             
    patch: string,      // 碎片数量
    level: string,      // 等阶              
    exp: string,        // 初始经验等级
}

// 签到数据
interface SIGNLOCALDATA {
    day: string,
    date: string,
    get: boolean,
}

// 日常
interface DAILYLOCALDATA {
    id: string,
    type: DAILYTYPE,
    num: string,
    maxNum: string,
    get: boolean,
}

// 成就
interface ACHIEVELOCALDATA {
    id: string,
    type: ACHIEVETYPE,
    ntype: number,
    num: string,
    maxNum: string,
    get: boolean,
    extra: string,
}

interface ADREWARDDATA {
    id: string,
    num: string,
}

interface ADLOCALDATA {
    date: string,                           // 时间 每日刷新
    adReward: Array<ADREWARDDATA>,  
    random: string,                         // 随机数
}

interface BATTLEHEROLOCALDATA {
    index: number,
    pos: cc.Vec2,
    heroId: string,
}

// 战斗阵容
interface BATTLELOCALDATA {
    id: string,
    battle: Array<BATTLEHEROLOCALDATA>
}

// 战斗暂离数据
interface FIGHTBACKHERODATA {
    id: string,
    lv: string,
    exp: string,
    job: string,
    rage: string,
    hurt: string,
    rune: Array<string>,
    battle: BATTLEHEROLOCALDATA,
    buffAddSpecial: Array<BUFFADD>,
    otherAddAttr: Array<BUFFADD>,
}

interface FIGHTBACKDATA {
    type: SCENETYPE,
    name: string,
    mapId: string,
    waveId: string,

    timer: string,
    stageIndex: string,
    curScore: string,
    curRandom: string,
    curJob: string,
    runeRefresh: string,
    allHurt: string,
    equips: Array<string>,
    artifacts: Array<string>,

    heroData: Array<FIGHTBACKHERODATA>,
}

interface SEASONSTATE {
    type: SEASONTYPE,
    index: number,          // 进度
    cd: number,             // 2 cd
    maxCd: number,
    state: number,  // 0 未开始 1 进行中 2 cd中
    num: number,      // 当前数量
    maxNum: number,
}