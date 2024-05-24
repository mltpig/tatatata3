import { getMoveAngle, getPosByAngle } from "../../../framework/utils/MoveUtil";
import { STATETYPE } from "../../other/FightEnum";
import LaunchActor from "./LaunchActor";

/**
 * 分散发射器
 * 发射器类型 波数 每波子弹数 间隔角度 每波延迟
 */
export default class LaunchLineActor extends LaunchActor {
    private num: number;
    private bNum: number;
    private angle: number;
    private delay: number;
    private timer: number = 0;
    private hasNum: number = 0;
    private curAngle: number = 0;
    private startAngle: number = 0;

    setData (data: launchData) {
        super.setData(data)

        let launch = JSON.parse(data.bAttr.launch)
        this.num = launch[1]
        this.bNum = launch[2]
        this.angle = launch[3]
        this.delay = launch[4]
        this.timer = this.delay

        this.curAngle = getMoveAngle(this.data.startPos.x, this.data.startPos.y, this.targetPos.x, this.targetPos.y)

        let isSingle = this.bNum % 2 != 0
        let value = Math.floor(this.bNum / 2)
        if (isSingle) {
            this.startAngle = this.curAngle - value * this.angle
        } else {
            this.startAngle = this.curAngle - (value - 0.5) * this.angle
        }
    }

    createBullet () {
        for (let i = 0; i < this.bNum; i++) {
            let bullet = this.fm.pveScene.createBullet(this.data.bAttr)
            bullet.setRealFight(this.data.fight)
            bullet.setAttacker(this.data.attacker)
            bullet.setStartPos(this.data.startPos)

            let rotate = (i - 1) * this.angle + this.startAngle
            let p = getPosByAngle(this.data.startPos.x, this.data.startPos.y, rotate, 2000)
            bullet.setTargetPos(p)
            bullet.bulletStart()
        }
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