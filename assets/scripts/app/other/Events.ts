// 游戏内分发事件事件
let Events = {  
    select_hero_event: "select_hero_event", // 选择英雄 

    fight_kill_exp_event: "fight_kill_exp_event",           // 击杀经验  
    fight_hero_change_event: "fight_hero_change_event",     // 英雄变化 

    game_select_btn_event: "game_select_btn_event", // 选择切换按钮

    game_logic_event: "game_logic_event",       // 逻辑变化

    game_gold_change_event: "game_gold_change_event",       // 金币刷新

    hero_level_up: "hero_level_up",     // 等阶刷新

    fight_random_event: "fight_random_event",           // 符文蛋
    fight_machine_event: "fight_machine_event",         // 机械蛋
    fight_season_event: "fight_season_event",           // 元素怪
    
    game_reddot_event: "game_reddot_event",         // 游戏红点刷新

    defend_soul_event: "defend_soul_event",         // 守卫战斗中产出灵魂

    game_show_skill: "game_show_skill",         // 战斗中释放技能
    game_refresh_shield_event: "game_refresh_shield_event",

    fight_resumeGame_event: "fight_resumeGame_event",        // 恢复战斗

    game_rune_change_event: "game_rune_change_event",       // 存在未装备符文

    hero_update_event: "hero_update_event",         // 英雄更新数据
    
    hero_job_event: "hero_job_event",   // 更新职业
    
    ad_fail_event: "ad_fail_event",          // 广告出现错误
    
    long_touch_event: "long_touch_event",       // 长按

    open_fight_season: "open_fight_season",     // 元素化开启      
}

export default Events;