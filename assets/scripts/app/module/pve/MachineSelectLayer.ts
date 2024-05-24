import List from "../../../framework/creator/List";
import DisUtils from "../../../framework/utils/DisUtils";
import GameManager from "../../manager/GameManager";
import StaticManager from "../../manager/StaticManager";
import { COMMONLOGICTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { RUNETYPE } from "../../other/FightEnum";
import { checkArrayIn, DS, ES } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";
import RuneSelectItem from "./RuneSelectItem";

const {ccclass, property} = cc._decorator;

/**
 * 钢铁符文自选界面
 */
@ccclass
export default class MachineSelectLayer extends GameView {
    private fm = GameManager.getFM();

    private runeData: Array<RUNEDATA> = [];
    private tipsTxt: cc.Label;
    private runeList: List;
    private heroIcon: cc.Node;
    private runeIcon: cc.Node;
    private runeDes: cc.Label;
    private runeDes2: cc.Label;
    private runeBg: cc.Node;

    private selectRunes: Array<RUNEDATA> = [];
    private hasClick: boolean = false;
    private actualMachine: string = "";      // 实际可选机械化次数

    onLoad () {
        super.onLoad()

        this.tipsTxt = this.getCpByType("tipsTxt", cc.Label)
        this.runeList = this.getCpByType("runeList", List)

        this.runeBg = this.getNode("runeBg")
        this.runeIcon = this.getNode("runeIcon")
        this.heroIcon = this.getNode("heroIcon")
        this.runeDes = this.getCpByType("runeDes", cc.Label)
        this.runeDes2 = this.getCpByType("runeDes2", cc.Label)
        this.runeBg.active = false
    }

    start () {
        // 未机械化符文
        let self = this
        this.fm.equipProp.forEach((value, key) => {
            value.forEach((value1, key1) => {
                if (!value1.machine) {
                    self.runeData.push(value1)
                }
            })
        });
        
        this.runeList.numItems = this.runeData.length
        let num1: number = this.runeData.length - 4
        let num2: number = this.fm.getMachine()
        this.actualMachine = ES( num2 > num1 ? num1 : num2 )

        this.showSelectTxt(0)
    }

    showSelectTxt (num: number) {
        this.tipsTxt.string = "可选任意钢铁符文(当前已选中:" + num + " 共计可选择:" + DS(this.actualMachine) + ")"
    }

    onRuneListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(RuneSelectItem)
        cell.setData(this.runeData[idx])
    }

    // 选择节点
    onSelectRuneListItem (item: cc.Node, selectedId: number, lastSelectedId: number, val: boolean) {
        if (!item) { return }
        this.showSelectRune(this.runeData[selectedId])
        this.checkSelect(item.getComponent(RuneSelectItem), val)
    }

    showSelectRune (data: RUNEDATA) {
        this.runeBg.active = true

        DisUtils.replaceSprite(PATHS.rune + "/" + data.img, this.runeIcon)
        let hero = this.fm.getHeroByuid(data.heroUid)
        DisUtils.replaceSprite(PATHS.hero + "/" + hero.data.res, this.heroIcon)

        this.runeDes.string = data.des
        this.runeDes2.string = data.des2
    }

    //检查选择
    checkSelect (item: RuneSelectItem, val: boolean) {
        if (val) {
            // 选择
            this.selectRunes.push(item.data)

            // 检测超出
            if (this.selectRunes.length > DS(this.actualMachine)) {
                this.selectRunes.shift()
                this.runeList.multSelected.shift()
                this.runeList.updateAll()
            }
        } else {
            // 放弃
            for (let i = 0; i < this.selectRunes.length; i++) {
                if (this.selectRunes[i].id == item.data.id) {
                    this.selectRunes.splice(i,1)
                    break
                }
            }
        }

        this.showSelectTxt(this.selectRunes.length)
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "runeBtn":
                // 确定选择 添加钢铁符文
                if (this.hasClick) { return }
                this.hasClick = true

                for (let i = 0; i < this.selectRunes.length; i++) {
                    let item = this.selectRunes[i];

                    this.fm.costMachine()
                    this.fm.machineEquip(item.heroUid, item.index)
                }

                this.dispatchEvent_(Events.fight_resumeGame_event)
                this.close_()
            break;
            default:
                break;
        }
    }

}