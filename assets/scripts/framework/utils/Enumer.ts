/**
 * 框架里枚举
 */

// ui弹出
enum UIACT {
    none = 0,
    center = 1,         // 中心弹出
    drop_down = 2,      // 自上而下    
}

// 层级
enum UI_ZORDER {
    hitDownZoder = 16000,
    actorZoder = 17000,
    heroZoder = 18000,
    hitUpZoder = 19000,
    selectZoder = 20000,
    bulletZoder = 20500,

    dialog = 21900,
    dragZoder = 22000,
    dragUpZoder = 23000,
    flyZoder = 24000,
    
    popupLayer = 25000,
    awardShower = 26000,
    popupDesTips = 27000,
    popupMessageHint = 28000,
    popupLoadWait = 29000,
    popupGuideMask = 30000,
    popupGuideTaskView = 31000,
    max = 32766
    // 最大值 cc.macro.MAX_ZINDEX 32767
}

export {
    UIACT,
    UI_ZORDER,
}