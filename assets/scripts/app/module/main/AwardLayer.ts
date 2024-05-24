import SelectButton from "../../../framework/creator/SelectButton";
import PlayerManager from "../../manager/PlayerManager";
import { REDDOTTYPE, SELECTBTNTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class AwardLayer extends GameView {
    @property(cc.Prefab)
    achieveLayer: cc.Prefab = null;

    @property(cc.Prefab)
    dailyLayer: cc.Prefab = null;

    @property(cc.Prefab)
    signLayer: cc.Prefab = null;

    private signBtn: SelectButton;
    private dailyBtn: SelectButton;
    private achieveBtn: SelectButton;
    private awardNode: cc.Node;
    private signRed: cc.Node;
    private dailyRed: cc.Node;
    private achieveRed: cc.Node;

    onLoad () {
        super.onLoad ()

        this.awardNode = this.getNode("awardNode")
        this.signRed = this.getNode("signRed")
        this.dailyRed = this.getNode("dailyRed")
        this.achieveRed = this.getNode("achieveRed")

        this.signBtn = this.getCpByType("signBtn", SelectButton)
        this.dailyBtn = this.getCpByType("dailyBtn", SelectButton)
        this.achieveBtn = this.getCpByType("achieveBtn", SelectButton)
        this.signBtn.selectCallback = this.showView.bind(this)
        this.dailyBtn.selectCallback = this.showView.bind(this)
        this.achieveBtn.selectCallback = this.showView.bind(this)

        this.addTitleLayer_({
            name: "任务成就",
            cb: this.close_.bind(this)
        })

        this.showView(SELECTBTNTYPE.award_sign)
        this.refreshRed()

        this.addEventListener_(Events.game_reddot_event, this.refreshRed.bind(this))
    }

    refreshRed () {
        this.signRed.active = PlayerManager.getReddot(REDDOTTYPE.sign)
        this.dailyRed.active = PlayerManager.getReddot(REDDOTTYPE.daily)
        this.achieveRed.active = PlayerManager.getReddot(REDDOTTYPE.achieve)
    }

    showView (type: SELECTBTNTYPE) {
        this.awardNode.destroyAllChildren()
        switch (type) {
            case SELECTBTNTYPE.award_sign:
                let node1 = cc.instantiate(this.signLayer)
                node1.setPosition(0,0)
                this.awardNode.addChild(node1)
                break;
            case SELECTBTNTYPE.award_daily:
                let node2 = cc.instantiate(this.dailyLayer)
                node2.setPosition(0,0)
                this.awardNode.addChild(node2)
                break;
            case SELECTBTNTYPE.award_achieve:
                let node3 = cc.instantiate(this.achieveLayer)
                node3.setPosition(0,0)
                this.awardNode.addChild(node3)
                break;
            default:
                break;
        }
    }    

}