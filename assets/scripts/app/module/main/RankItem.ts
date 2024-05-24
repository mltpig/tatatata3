import ListItem from "../../../framework/creator/ListItem";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class RankItem extends ListItem {
    private data: RANKDATA;

    private rankTxt: cc.Label;
    private nameTxt: cc.Label;
    private waveTxt: cc.Label;
    private scoreTxt: cc.Label;

    onLoad () {
        super.onLoad()

        this.rankTxt = this.getCpByType("rankTxt", cc.Label)
        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
        this.waveTxt = this.getCpByType("waveTxt", cc.Label)
        this.scoreTxt = this.getCpByType("scoreTxt", cc.Label)
    }

    setData (data: RANKDATA) {
        this.data = data

        this.rankTxt.string = data.rank.toString()
        this.nameTxt.string = data.name
        this.waveTxt.string = data.wave.toString()
        this.scoreTxt.string = data.score.toString()
    }
}