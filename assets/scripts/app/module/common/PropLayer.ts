import DisUtils from "../../../framework/utils/DisUtils";
import { PROPTYPE } from "../../other/FightEnum";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 道具详情
 */
@ccclass
export default class PropLayer extends GameView {
    private headSp: cc.Node;
    private nameTxt: cc.Label;
    private desTxt: cc.RichText;
    private clickBtn: cc.Node;
    private useBtn: cc.Node;
    
    private data: PROPDATA;
    
    private _clickCb : Function;
    public set clickCb(v : Function) {
        this._clickCb = v;
    }

    private _useCb : Function;
    public set useCb(v : Function) {
        this._useCb = v;
    }

    onLoad () {
        super.onLoad()

        this.headSp = this.getNode("headSp")
        this.clickBtn = this.getNode("clickBtn")
        this.useBtn = this.getNode("useBtn")

        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
        this.desTxt = this.getCpByType("desTxt", cc.RichText)
    }
    
    setData (data: PROPDATA) {
        this.data = data

        // DisUtils.replaceSprite(PATHS.hero + "/" + data.res, this.headSp)

        this.nameTxt.string = data.name
        this.desTxt.string = data.des

        this.clickBtn.active = data.type == PROPTYPE.mount
        this.useBtn.active = data.type == PROPTYPE.use
    }

    onTouchEnd (name: string) { 
        switch (name) {
            case "clickBtn":
                if (this._clickCb) {
                    this._clickCb()
                }
                break;
            case "useBtn":
                if (this._useCb) {
                    this._useCb()
                }
                break;
            default:
                break;
        }
    }

}