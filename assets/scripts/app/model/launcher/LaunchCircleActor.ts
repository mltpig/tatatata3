import { getPosByAngle } from "../../../framework/utils/MoveUtil";
import { STATETYPE } from "../../other/FightEnum";
import LaunchActor from "./LaunchActor";

/**
 * 圆形区域内随机位置发射器
 * 发射器类型 数量 间隔 半径
 */
export default class LaunchCircleActor extends LaunchActor {
    private num: number;
    private delay: number;
    private timer: number = 0;
    private hasNum: number = 0;
    private radius: number;

    setData (data: launchData) {
        super.setData(data)

        let launch = JSON.parse(data.bAttr.launch)
        this.num = launch[1]
        this.delay = launch[2]
        this.radius = launch[3]
        this.timer = 0
    }

    createBullet () {
        let m = Math.random() * this.radius
        let angle = Math.random() * 360
        let p = getPosByAngle(this.targetPos.x, this.targetPos.y, angle, m)

        let bullet = this.fm.pveScene.createBullet(this.data.bAttr)
        bullet.setRealFight(this.data.fight)
        bullet.setAttacker(this.data.attacker)
        bullet.setStartPos(this.data.startPos)
        bullet.setTargetPos(p)
        bullet.bulletStart()
    }
    
    update2 (dt: number) {
        this.timer = this.timer + dt

        if (this.timer >= this.delay) {
            this.timer = 0
            this.createBullet()
            this.hasNum = this.hasNum + 1

            if (this.hasNum >= this.num) {
                this.state = STATETYPE.finish
            }
        }
    }
}