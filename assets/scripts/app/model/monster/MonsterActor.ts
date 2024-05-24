import DisUtils from "../../../framework/utils/DisUtils";
import { UI_ZORDER } from "../../../framework/utils/Enumer";
import EventDispatcher from "../../../framework/utils/EventDispatcher";
import { getMoveVector } from "../../../framework/utils/MoveUtil";
import AudioManager from "../../manager/AudioManager";
import Events from "../../other/Events";
import { ATTRTYPE, CAMPTYPE, MONSTERTYPE, NODEPOOLTYPE, SKILLTYPE, SPECIALTYPE, STATETYPE } from "../../other/FightEnum";
import { DS, ES } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import ActorBase from "../ActorBase";
import { monsterState } from "../states/StateBase";

interface posData {
    movePoint: cc.Vec2,
    angle: number,
}

/**
 * 怪物
 */
const {ccclass, menu, property} = cc._decorator;

@ccclass
@menu("model/MonsterActor")
export default class MonsterActor extends ActorBase {
    private id: string;
    public data: MONSTERINFO;
    // 路径
    private pathId;
    private paths: Array<number>;

    private curIndex: number = 0
    private endIndex: number = 0
    private startPos: cc.Vec2;

    public headIcon: cc.Node;
    private isStart: boolean = false;
    public season: boolean = false; // 元素化

    /************************** 属性 **************************/

    onLoad () {
        super.onLoad()

        this.headIcon = this.getNode("headIcon")
    }

    setId (id: string) {
        this.id = id
        this.data = this.fm.getCacheMonster(id, true)
        let size = JSON.parse(this.data.size)
        this.nsize = cc.size(size[0], size[1])
        this._pid = this.data.id.toString()

        this.bodyCollider.size = this.nsize
        this.headIcon.setContentSize(this.nsize)

        this.headIcon.scaleX = -1
        this.resetIcon()

        this.bloodItem = this.addBloodItem()
        this.bloodItem.hpActive = true
        this.bloodItem.hpProgress = 1
        
        this.states = this.fm.getStates(monsterState)
        this.checkWinkStates()

        this.campType = CAMPTYPE.monster

        let eles = [MONSTERTYPE.water, MONSTERTYPE.fire, MONSTERTYPE.thunder, MONSTERTYPE.electric]
        if (eles.indexOf(this.data.type) >= 0) {
            this.season = true
        }

        this.setIdModel()
    }
    
    resetIcon () {
        DisUtils.replaceSprite(PATHS.monster + "/" + this.data.res, this.headIcon)
    }

    setIdModel () {}

    // 设置等级和系数
    setRate (rate: string, level: string) {
        this._level = level
        let nhp = DS(this.data.hp) + (DS(level) - 1) * DS(this.data.hpGrow)
        this.data.hp = ES(DS(rate) * nhp)

        this._realValue.initBaseData(this.data)
    }

    setPath (id: string) {
        this.pathId = id
        let d = this.fm.getCacheMap(id)
        this.paths = JSON.parse(d.data) 
        this.endIndex = this.paths.length

        let index = this.paths[this.curIndex]
        let pos = this.fm.getCachPos(index)
        this.startPos = pos
        this.node.setPosition(pos)
        this.isStart = true
    }

    /************************** update **************************/

    update2 (dt: number) {
        super.update2(dt)
        this.updateState()
        this.updateWinkStates()
    }

    checkAppear () {
        this.fm.dealGlobalSpecial(SPECIALTYPE.appear, {
            target: this
        })
    }

    getNextPos (speed: number): posData {

        let nextIndex = this.curIndex + 1
        if (nextIndex >= this.endIndex) {
            // 从头开始
            this.curIndex = 0
            this.isStart = true
            return {
                movePoint: this.startPos,
                angle: 0,
            }
        }

        let point = this.paths[nextIndex]
        let newPos = this.fm.getCachPos(point)

        let d = getMoveVector(cc.v2(this.node.x, this.node.y), newPos, speed)
        if (d.ended) {
            // 下一个点
            this.curIndex ++;
            return this.getNextPos(d.remaining)
        } else {
            return {
                movePoint: d.movePoint,
                angle: d.angle,
            }
        }
    }
    
    updateMove (dt: number) {
        if (!this.onState(STATETYPE.walk)) {
            return
        }
        
        if (this._status.effectMove()) {
            return
        }
        
        if (this.isStart) {
            this.isStart = false
            this.checkAppear()
        }

        //check
        let oldx = this.node.x
        let speed = this._realValue.getUseAttr(ATTRTYPE.speed)
        let newP = this.getNextPos(speed * dt)
        if (newP) {
            this.node.setPosition(newP.movePoint)
        }

        this.headIcon.scaleX = newP.movePoint.x > oldx ? -1 : 1
        this.node.zIndex = UI_ZORDER.actorZoder + this.node.y
    }
    
    /************************** state **************************/

    hitLord () {
        this.state = STATETYPE.finish
    }

    forceDead () {
        this._realValue.forceDead()
    }
    
    forceSeason () {
        this._realValue.forceSeason()
    }
    
    dodead (state: STATEDATA) {
        super.dodead(state)

        // 死亡音效
        AudioManager.playEffect("deadMusic")

        if (this.data.type == MONSTERTYPE.random) {
            EventDispatcher.dispatchEvent(Events.fight_random_event)
        } else if (this.data.type == MONSTERTYPE.machine) {
            EventDispatcher.dispatchEvent(Events.fight_machine_event)
        }

        if (this.season) {
            EventDispatcher.dispatchEvent(Events.fight_season_event, this.data.type)
        }
    }
    
    clear () {
        // 获取积分
        this.fm.updateScore()
        
        this.effectNode.destroyAllChildren()
        this.buffNode.destroyAllChildren()
        this.effectNode.destroy()
        this.buffNode.destroy()
        this.effectNode = null
        this.buffNode = null
        this.node.removeComponent(this)
        this.fm.putPool(NODEPOOLTYPE.monster, this.node)
    }

}