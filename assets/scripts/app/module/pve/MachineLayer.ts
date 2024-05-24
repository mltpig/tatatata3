import DisUtils from "../../../framework/utils/DisUtils";
import GameManager from "../../manager/GameManager";
import Events from "../../other/Events";
import { DS, random1 } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 随机 机械符文
 */
@ccclass
export default class MachineLayer extends GameView {
    private numTxt: cc.Label;
    private runeDatas: Array<RUNEDATA> = [];
    private runeList: Array<RUNEDATA> = [];

    private fm = GameManager.getFM();
    private hasClick: boolean = false;

    onLoad () {
        super.onLoad()

        this.numTxt = this.getCpByType("numTxt", cc.Label)
        this.numTxt.string = "";
    }

    showComplete_ () {
        this.numTxt.string = DS(this.fm.curMachine).toString()

        // 未机械化符文
        let self = this
        this.fm.equipProp.forEach((value, key) => {
            value.forEach((value1, key1) => {
                if (!value1.machine) {
                    self.runeDatas.push(value1)
                }
            })
        });

        // 随机
        for (let i = 0; i < 3; i++) {
            let index = random1(0, this.runeDatas.length)
            let runeData = this.runeDatas[index]
            if (runeData) {
                this.runeList.push(runeData)
                this.runeDatas.splice(index,1)
                
                let j = i + 1
                DisUtils.replaceSprite(PATHS.rune + "/" + runeData.img, this.getNode("runeIcon_" + j))

                let hero = this.fm.getHeroByuid(runeData.heroUid)
                DisUtils.replaceSprite(PATHS.hero + "/" + hero.data.res, this.getNode("heroIcon_" + j))

                this.getNode("runeDes_" + j).getComponent(cc.Label).string = runeData.des
                this.getNode("runeDes2_" + j).getComponent(cc.Label).string = runeData.des2
            }
        }
        
        this.hasClick = false
    }

    // 再次显示
    showAgain () {
        this.runeDatas = []
        this.runeList = []
        this.showComplete_()
    }

    // 检测下一符文
    checkRune () {
        if (this.fm.canMachine()) {
            this.showAgain()
        }else {
            this.dispatchEvent_(Events.fight_resumeGame_event)
            this.close_()
        }
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "runeBg_1":
            case "runeBg_2":
            case "runeBg_3":
                if (this.hasClick) { return }

                let arr = name.split("_")
                let index = parseInt(arr[1]) - 1
                if (!this.runeList[index]) { return }
                
                this.fm.costMachine()
                this.fm.machineEquip(this.runeList[index].heroUid, this.runeList[index].index)

                this.hasClick = true
                this.checkRune()
                break;
            default:
                break;
        }
    }
}