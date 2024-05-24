import DisUtils from "../../../framework/utils/DisUtils";
import StaticManager from "../../manager/StaticManager";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 战斗内英雄展示
 */
@ccclass
export default class FightHero extends GameView {
    private heroId: string;

    private heroIcon: cc.Node;
    private nameTxt: cc.Label;
    private desTxt: cc.RichText;

    onLoad () {
        super.onLoad()

        this.heroIcon = this.getNode("heroIcon")
        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
        this.desTxt = this.getCpByType("desTxt", cc.RichText)
    }

    showComplete_ () {
        this.heroId = this.cusData_
        let heroData = StaticManager.getStaticValue("static_hero", this.heroId) as HEROINFO
        DisUtils.replaceSprite(PATHS.hero + "/" + heroData.res, this.heroIcon)
        this.nameTxt.string = heroData.name
        this.desTxt.string = heroData.des
    }
}