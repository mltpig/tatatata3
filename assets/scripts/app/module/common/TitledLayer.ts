import ViewBase from "../../../framework/creator/ViewBase";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TitledLayer extends ViewBase {
    private nameTxt: cc.Label;
    private callback: Function;

    onLoad () {
        super.onLoad()

        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
    }

    setData (data: TITLEDDATA) {
        this.nameTxt.string = data.name
        this.callback = data.cb
    }
    
    onTouchEnd (name: string) {
        switch (name) {
            case "backBtn":
                this.callback()
                break;
            default:
                break;
        }
    }
}
