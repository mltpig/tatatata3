import { STATETYPE } from "../../other/FightEnum";
import ActorBase from "../ActorBase";
import UnitBase from "../UnitBase";

/**
 * 发射器
 */
export default class LaunchActor extends UnitBase {
    public data: launchData;
    public isLaunch: boolean = false;
    public targetPos: cc.Vec2;

    setData (data: launchData) {
        this.data = data
        this.targetPos = this.data.targetPos
    }

    createBullet () {
        let bullet = this.fm.pveScene.createBullet(this.data.bAttr)
        bullet.setRealFight(this.data.fight)
        bullet.setAttacker(this.data.attacker)
        bullet.setStartPos(this.data.startPos)
        if (this.data.target) {
            bullet.setTarget(this.data.target)
        } else {
            bullet.setTargetPos(this.data.targetPos)
        }
        bullet.bulletStart()
    }

    launch () {
        this.update2(0)
    }
    
    update2 (dt: number) {
        if (!this.isLaunch) {
            this.isLaunch = true
            this.createBullet()
            this.state = STATETYPE.finish
        }
    }
}