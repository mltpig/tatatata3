import { UI_ZORDER } from "../../framework/utils/Enumer"
import GameManager from "../manager/GameManager"
import Contants from "../other/Contants"
import { BULLETTYPE, LAUNCHTYPE, NODEPOOLTYPE } from "../other/FightEnum"
import { TSCENE } from "../other/Tool"
import ActorBase from "./ActorBase"
import BulletActor from "./bullet/BulletActor"
import BulletBase from "./bullet/BulletBase"
import BulletCellActor from "./bullet/BulletCellActor"
import BulletCoreActor from "./bullet/BulletCoreActor"
import BulletFullActor from "./bullet/BulletFullActor"
import BulletGunActor from "./bullet/BulletGunActor"
import BulletHalo from "./bullet/BulletHalo"
import BulletHcircle from "./bullet/BulletHcircle"
import BulletLaser from "./bullet/BulletLaser"
import BulletRangeActor from "./bullet/BulletRangeActor"
import BulletShootActor from "./bullet/BulletShootActor"
import HurtRect from "./bullet/HurtRect"
import HeroActor from "./hero/HeroActor"
import PossessHeroActor from "./hero/PossessHeroActor"
import ShieldActor from "./hero/ShieldActor"
import LaunchActor from "./launcher/LaunchActor"
import LaunchCircleActor from "./launcher/LaunchCircleActor"
import LaunchLineActor from "./launcher/LaunchLineActor"
import LaunchMultipleActor from "./launcher/LaunchMultipleActor"
import LaunchRandActor from "./launcher/LaunchRandActor"
import LordActor from "./lord/LordActor"
import CloneMonsterActor from "./monster/CloneMonsterActor"
import DefendMonsterActor from "./monster/DefendMonsterActor"
import MonsterActor from "./monster/MonsterActor"

/**
 * 角色创建逻辑处理
 */
class UnitManager {
    private static instance_: UnitManager
    static getInstance (): UnitManager {
        if (!this.instance_) {
            this.instance_ = new UnitManager()
        }
        return UnitManager.instance_
    }
    
    /*************************************** monster ***************************************/

    createMonster (node: cc.Prefab, id: string): MonsterActor {
        let actor = GameManager.getFM().getPool(NODEPOOLTYPE.monster, node)
        TSCENE().addChild(actor, UI_ZORDER.actorZoder)
        
        let script = actor.addComponent(MonsterActor)
        script.setId(id)
        
        return script
    }

    createDefendMonster (node: cc.Prefab, id: string): DefendMonsterActor {
        let actor = GameManager.getFM().getPool(NODEPOOLTYPE.monster, node)
        TSCENE().addChild(actor, UI_ZORDER.actorZoder)
        
        let script = actor.addComponent(DefendMonsterActor)
        script.setId(id)
        
        return script
    }
    
    createCloneMonster (node: cc.Prefab, id: string): CloneMonsterActor {
        let actor = GameManager.getFM().getPool(NODEPOOLTYPE.monster, node)
        TSCENE().addChild(actor, UI_ZORDER.actorZoder)
        
        let script = actor.addComponent(CloneMonsterActor)
        script.setId(id)
        
        return script
    }
    
    /*************************************** lord ***************************************/

    createLord (node: cc.Prefab, data:LORDINFO): LordActor {
        let actor = cc.instantiate(node)
        TSCENE().addChild(actor, UI_ZORDER.actorZoder)

        let script = actor.addComponent(LordActor)
        script.setData(data)

        return script
    }

    /*************************************** hero ***************************************/

    createHero (node: cc.Prefab, data: HEROINFO, pos: cc.Vec2) {
        let actor = cc.instantiate(node)
        actor.setPosition(pos)
        TSCENE().addChild(actor, UI_ZORDER.heroZoder + pos.y)

        let script = actor.addComponent(HeroActor)
        script.setData(data)

        return {
            script: script,
            node: actor,
        } 
    }
    
    createPossessHero (node: cc.Prefab, data: HEROINFO, pos: cc.Vec2) {
        let actor = cc.instantiate(node)
        actor.setPosition(pos)
        TSCENE().addChild(actor, UI_ZORDER.heroZoder + pos.y)

        let script = actor.addComponent(PossessHeroActor)
        script.setData(data)

        return {
            script: script,
            node: actor,
        } 
    }

    /*************************************** bullet ***************************************/

    createBullet (node: cc.Prefab, data: BULLETDATA) {
        let bullet = GameManager.getFM().getPool(NODEPOOLTYPE.bullet, node)
        TSCENE().addChild(bullet, UI_ZORDER.bulletZoder)

        let script: BulletBase;
        switch (data.type) {
            case BULLETTYPE.one:
                script = bullet.addComponent(BulletActor)
                break;
            case BULLETTYPE.cell:
                script = bullet.addComponent(BulletCellActor)
                break;
            case BULLETTYPE.shoot:
                script = bullet.addComponent(BulletShootActor)
                break;
            case BULLETTYPE.gun:
                script = bullet.addComponent(BulletGunActor)
                break;
            case BULLETTYPE.full:
                script = bullet.addComponent(BulletFullActor)
                break;
            case BULLETTYPE.range:
                script = bullet.addComponent(BulletRangeActor)
                break;
            case BULLETTYPE.core:
                script = bullet.addComponent(BulletCoreActor)
                break;
            case BULLETTYPE.hcircle:
                script = bullet.addComponent(BulletHcircle)
                break;
            case BULLETTYPE.laser:
                script = bullet.addComponent(BulletLaser)
                break;
            case BULLETTYPE.halo:
                script = bullet.addComponent(BulletHalo)
                break;
            default:
                break;
        }
        script.setData(data)

        return script
    }

    /*************************************** launch ***************************************/

    createLaunch (data: launchData) {
        let node = new cc.Node()
        TSCENE().addChild(node)

        let launch = JSON.parse(data.bAttr.launch) 
        let script: LaunchActor
        switch (launch[0]) {
            case LAUNCHTYPE.one:
                script = node.addComponent(LaunchActor)
                break;
            case LAUNCHTYPE.line:
                script = node.addComponent(LaunchLineActor)
                break;
            case LAUNCHTYPE.circle:
                script = node.addComponent(LaunchCircleActor)
                break;
            case LAUNCHTYPE.rand:
                script = node.addComponent(LaunchRandActor)
                break;
            case LAUNCHTYPE.multiple:
                script = node.addComponent(LaunchMultipleActor)
                break;
            default:
                break;
        }
        script.setData(data)
        script.launch()

        return script
    }

    /*************************************** hurtRect ***************************************/

    createHurtRects (item: cc.Prefab, data: HURTRECTDATA) {
        let node = cc.instantiate(item)
        node.setPosition(data.pos)
        TSCENE().addChild(node)

        let script: HurtRect = node.addComponent(HurtRect)
        script.setData(data)

        return script
    }

    /*************************************** shield ***************************************/

    createShield (node: cc.Prefab, data: SHIELDDATA, pos: cc.Vec2): ShieldActor {
        let actor = cc.instantiate(node)
        actor.setPosition(pos)
        TSCENE().addChild(actor, UI_ZORDER.actorZoder)

        let script = actor.addComponent(ShieldActor)
        script.setData(data)

        return script
    }

}

export default UnitManager.getInstance()