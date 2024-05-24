import DisUtils from "../../../framework/utils/DisUtils";
import GameManager from "../../manager/GameManager";
import { DEFENDSHOPTYPE } from "../../other/FightEnum";
import GameUtils from "../../other/GameUtils";
import { clone, DS } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 商店item
 */
@ccclass
export default class ShopItem extends GameView {
    private headIcon: cc.Node;
    private txtName: cc.Label;
    private costNum: cc.Label;
    private shopBtn: cc.Button;
    private shopTxt: cc.Label;

    private type: DEFENDSHOPTYPE;
    private index: number;
    private shieldData: SHIELDDATA;
    private runeData: RUNEDATA;
    public refreshCallback: Function;

    private fm;

    onLoad () {
        super.onLoad()

        this.headIcon = this.getNode("headIcon")
        this.txtName = this.getCpByType("txtName", cc.Label)
        this.costNum = this.getCpByType("costNum", cc.Label)
        this.shopBtn = this.getCpByType("shopBtn", cc.Button)
        this.shopTxt = this.getCpByType("shopTxt", cc.Label)

        this.fm = GameManager.getFM();
    }

    setType (type: DEFENDSHOPTYPE, index: number) {
        this.type = type
        this.index = index
    }

    setShield (shieldData: SHIELDDATA) {
        this.shieldData = shieldData

        DisUtils.replaceSprite(PATHS.rune + "/" + this.shieldData.res, this.headIcon)
        this.txtName.string = this.shieldData.name
        this.costNum.string = DS(this.shieldData.cost).toString()
    }

    setRuneData (runeData: RUNEDATA) {
        this.runeData = runeData

        DisUtils.replaceSprite(PATHS.rune + "/" + this.runeData.img, this.headIcon)
        this.txtName.string = this.runeData.name
        this.costNum.string = DS(this.runeData.defendCost).toString()
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "shopBtn":
                // 商店
                let cost = this.type == DEFENDSHOPTYPE.shield ? DS(this.shieldData.cost) : DS(this.runeData.defendCost)
                if (!this.fm.checkSoul(cost)) {
                    GameUtils.messageHint("灵魂点不足!")
                    return 
                }
                switch (this.type) {
                    case DEFENDSHOPTYPE.shield:
                        // 盾牌
                        this.fm.addShiled(this.shieldData.id)
                        break;
                    case DEFENDSHOPTYPE.rune:
                        // 符文神器
                        let rune = clone(this.runeData)
                        rune.uid = this.fm.uniqueId.toString()
                        this.fm.addEquip(rune)
                        break;
                    default:
                        break;
                }
                this.fm.costSoul(cost)
                // this.shopTxt.string = "已售出"
                // this.shopBtn.enabled = false

                if (this.refreshCallback) {
                    this.refreshCallback({
                        type: this.type,
                        index: this.index,
                    })
                }
                
                break;
            default:
                break;
        }
    }
}