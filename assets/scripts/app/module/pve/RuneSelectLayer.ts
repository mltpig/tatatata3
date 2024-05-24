import List from "../../../framework/creator/List";
import DisUtils from "../../../framework/utils/DisUtils";
import GameManager from "../../manager/GameManager";
import StaticManager from "../../manager/StaticManager";
import { COMMONLOGICTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { RUNESELECTTYPE, RUNETYPE, SCENETYPE } from "../../other/FightEnum";
import { checkArrayIn, clone } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";
import RuneSelectItem from "./RuneSelectItem";

const {ccclass, property} = cc._decorator;

/**
 * 符文自选界面
 */
@ccclass
export default class RuneSelectLayer extends GameView {
    private fm = GameManager.getFM();
    private selectType: RUNESELECTTYPE;

    private runeData: Array<RUNEDATA>;
    private tipsTxt: cc.Label;
    private runeList: List;
    private runeList2: List;
    private curList: List;
    private runeIcon: cc.Node;
    private nameTxt: cc.Label;
    private typeTxt: cc.Label;
    private runeDes: cc.Label;
    private runeBg: cc.Node;

    private selectRunes: Array<RUNEDATA> = [];
    private hasClick: boolean = false;

    onLoad () {
        super.onLoad()

        this.tipsTxt = this.getCpByType("tipsTxt", cc.Label)
        this.runeList = this.getCpByType("runeList", List)
        this.runeList2 = this.getCpByType("runeList2", List)
        this.runeIcon = this.getNode("runeIcon")

        this.runeBg = this.getNode("runeBg")
        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
        this.typeTxt = this.getCpByType("typeTxt", cc.Label)
        this.runeDes = this.getCpByType("runeDes", cc.Label)
        this.runeBg.active = false
    }

    start () {
        this.selectType = this.popData_.data
        if (this.selectType == RUNESELECTTYPE.single) {
            this.runeList2.node.active = false
            this.curList = this.runeList
            this.tipsTxt.string = "首次可选任意符文/神器!"
        } else {
            this.runeList.node.active = false
            this.curList = this.runeList2
            this.showSelectTxt(0)
        }   

        this.runeData = StaticManager.getRune()

        let full: boolean = this.fm.isRuneFull()
        if (this.fm.pveType == SCENETYPE.repeat) {
            // 重复符文模式(选择不可超过4个)

            let gains: Map<string, number> = new Map();
            this.fm.gainEquips.forEach(element => {
                let m = gains.get(element)
                if (m) {
                    gains.set(element, m+1)
                } else {
                    gains.set(element, 1)
                }
            });

            // 去重
            for (let i = 0; i < this.runeData.length; i++) {
                if (this.runeData[i].type == RUNETYPE.rune) {
                    let m = gains.get(this.runeData[i].id)
                    let skip = full || (m && m >= 4)
                    if (skip) {
                        this.runeData.splice(i,1)
                        i--
                    }
                }
            }

        } else {
            // 其他模式

            // 去重
            for (let i = 0; i < this.runeData.length; i++) {
                if (this.runeData[i].type == RUNETYPE.rune) {
                    let skip = full || checkArrayIn(this.fm.gainEquips, this.runeData[i].id)
                    if (skip) {
                        this.runeData.splice(i,1)
                        i--
                    }
                }
            }
        }

        this.curList.numItems = this.runeData.length
    }

    showSelectTxt (num: number) {
        this.tipsTxt.string = "可选任意符文/神器(当前已选中:" + num + " 共计可选择:" + this.fm.getRandom() + ")"
    }

    onRuneListRender (item: cc.Node, idx: number) {
        let cell = item.getComponent(RuneSelectItem)
        cell.setData(this.runeData[idx])
    }

    // 选择节点
    onSelectRuneListItem (item: cc.Node, selectedId: number, lastSelectedId: number, val: boolean) {
        if (!item) { return }
        this.checkSelect(item.getComponent(RuneSelectItem), val)
        this.showSelectRune(this.runeData[selectedId])
    }

    showSelectRune (data: RUNEDATA) {
        let d: RUNEDATA = clone(data) 
        // 检测咒术符文
        if (this.fm.checkSuperSpecial()) {
            if (this.selectRunes.length == 1) {
                d = StaticManager.getSuperRuneData(d)
            }
        }

        this.runeBg.active = true

        DisUtils.replaceSprite(PATHS.rune + "/" + d.img, this.runeIcon)
        this.nameTxt.string = d.name
        this.runeDes.string = d.des
        this.typeTxt.node.color = d.type == RUNETYPE.rune ? cc.Color.GREEN : cc.Color.YELLOW
        this.typeTxt.string = d.type == RUNETYPE.rune ? "符文" : "神器"
    }

    //检查选择
    checkSelect (item: RuneSelectItem, val: boolean) {
        if (this.selectType == RUNESELECTTYPE.single) {
            this.selectRunes[0] = item.data
        } else {
            if (val) {
                // 选择
                this.selectRunes.push(item.data)

                // 检测超出
                if (this.selectRunes.length > this.fm.getRandom()) {
                    this.selectRunes.shift()
                    this.curList.multSelected.shift()
                    this.curList.updateAll()
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
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "runeBtn":
                // 确定选择 添加符文
                if (this.hasClick) { return }
                this.hasClick = true

                for (let i = 0; i < this.selectRunes.length; i++) {
                    let item = this.selectRunes[i];

                    this.fm.costRandom()
                    item.uid = this.fm.uniqueId.toString()
                    this.fm.addEquip(item)

                    this.dispatchEvent_(Events.game_logic_event, {
                        type: COMMONLOGICTYPE.rune
                    })
                }
                
                if (this.selectRunes.length > 0 && this.selectType == RUNESELECTTYPE.single) {
                    this.fm.runeStart = false
                }

                this.dispatchEvent_(Events.fight_resumeGame_event)
                this.close_()
            break;
            default:
                break;
        }
    }

}