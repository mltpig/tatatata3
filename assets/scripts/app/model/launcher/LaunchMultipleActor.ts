import { getPosByAngle } from "../../../framework/utils/MoveUtil";
import { STATETYPE } from "../../other/FightEnum";
import { random1 } from "../../other/Global";
import ActorBase from "../ActorBase";
import LaunchActor from "./LaunchActor";

/**
 * 多重射击
 * 发射器类型 数量
 */
export default class LaunchMultipleActor extends LaunchActor {
    private num: number;

    setData (data: launchData) {
        super.setData(data)

        let launch = JSON.parse(data.bAttr.launch)
        this.num = launch[1]
    }

    createBullet () {
        let attacker: ActorBase = this.data.attacker
        let targets = attacker.findTarget(this.data.bAttr)
        for (let i = 0; i < this.num; i++) {
            if (i >= targets.length) { return }
            let t = targets[i]
            let bullet = this.fm.pveScene.createBullet(this.data.bAttr)
            bullet.setRealFight(this.data.fight)
            bullet.setAttacker(this.data.attacker)
            bullet.setStartPos(this.data.startPos)
            bullet.setTarget(t)
            bullet.bulletStart()
        }
    }
    
    update2 (dt: number) {
        if (!this.isLaunch) {
            this.isLaunch = true
            this.createBullet()
            this.state = STATETYPE.finish
        }
    }
}