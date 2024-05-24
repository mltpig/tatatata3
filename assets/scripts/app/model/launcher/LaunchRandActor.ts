import { STATETYPE } from "../../other/FightEnum";
import { random1 } from "../../other/Global";
import LaunchActor from "./LaunchActor";

/**
 * 全图随机敌人
 * 发射器类型 数量 间隔
 */
export default class LaunchRandActor extends LaunchActor {
    private num: number;
    private delay: number;
    private timer: number = 0;
    private hasNum: number = 0;

    setData (data: launchData) {
        super.setData(data)

        let launch = JSON.parse(data.bAttr.launch)
        this.num = launch[1]
        this.delay = launch[2]
        this.timer = 0
    }

    createBullet () {
        // 目标
        let campType = JSON.parse(this.data.bAttr.campType)
        let targets = []
        if (campType[0] == 1) {
            targets = this.fm.getMonsters()
        } else {
            targets = this.fm.getHeros()
        }
        
        if (targets.length == 0) { return }
        let index = random1(0, targets.length)
        
        let bullet = this.fm.pveScene.createBullet(this.data.bAttr)
        bullet.setRealFight(this.data.fight)
        bullet.setAttacker(this.data.attacker)
        bullet.setStartPos(this.data.startPos)
        bullet.setTarget(targets[index])
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