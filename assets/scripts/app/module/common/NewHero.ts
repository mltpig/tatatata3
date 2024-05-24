import DisUtils from "../../../framework/utils/DisUtils";
import LayerManager from "../../manager/LayerManager";
import StaticManager from "../../manager/StaticManager";
import GameUtils from "../../other/GameUtils";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 新英雄get
 */
@ccclass
export default class NewHero extends GameView {
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

    closeComplete_ () {
        super.closeComplete_()

        GameUtils.newHeroList.shift()
        if (GameUtils.newHeroList.length > 0) {
            LayerManager.pop({
                script: "NewHero",
                prefab: PATHS.common + "/newHero",
                data: GameUtils.newHeroList[0],
                backClick: true,
            }) 
        } else {
            GameUtils.inNewHero = false
        }
    }
}