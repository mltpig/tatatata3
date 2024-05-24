import DisUtils from "../../../framework/utils/DisUtils";
import GameManager from "../../manager/GameManager";
import FightManager from "../../model/FightManager";
import HeroActor from "../../model/hero/HeroActor";
import { ATTRTYPE, SKILLTYPE } from "../../other/FightEnum";
import { DS, numStr, toDecimal } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 统计面板
 */
@ccclass
export default class HurtLayer extends GameView {
    private heroList: cc.Node;
    private heroNode: cc.Node;
    private heros: Array<HeroActor>;

    onLoad () {
        super.onLoad()

        this.heroList = this.getNode("heroList")
        this.heroNode = this.getNode("heroNode")
    }

    start () {
        let fm: FightManager = GameManager.getFM()
        this.heros = fm.getHeros()
        if (this.heros.length == 0) {
            this.heroList.active = false
            return
        }
        
        if (this.heros.length > 4) {
            this.node.setContentSize(1240,590)
            this.getNode("blackBg").setContentSize(1216, 573)
            this.getNode("bg").setContentSize(1240,590)
            this.getNode("blackBg2").setContentSize(1214, 490)
            this.getNode("heroList").setContentSize(1200, 240)
        }

        for (let i = 0; i < this.heros.length; i++) {
            let hero = this.heros[i]

            let node: cc.Node;
            if (i == 0) {
                node = this.heroNode
            } else {
                node = cc.instantiate(this.heroNode)
                this.heroList.addChild(node)
            }

            DisUtils.replaceSprite(PATHS.hero + "/" + hero.data.res, node.getChildByName("heroIcon"))
            node.getChildByName("lvTxt").getComponent(cc.Label).string = "lv." + DS(hero._level).toString() 
            node.getChildByName("jobNameTxt").getComponent(cc.Label).string = hero.jobData ? hero.jobData.name : ""

            // 符文
            let runeNode: cc.Node = node.getChildByName("skillNode")
            let heroEquip = fm.equipProp.get(hero.uid)
            for (let i = 0; i < 4; i++) {
                let equip = heroEquip.get(i) as RUNEDATA
                let runeIcon = runeNode.getChildByName("runeIcon_" + (i + 1))
                let nameTxt = runeNode.getChildByName("nameTxt_" + (i + 1))
                let machine = runeNode.getChildByName("machine_" + (i + 1))

                let opacity1 = equip == null ? 0 : 255
                runeIcon.opacity = opacity1
                nameTxt.opacity = opacity1
                machine.active = false

                if (equip) {
                    DisUtils.replaceSprite(PATHS.rune + "/" + equip.img, runeIcon)
                    nameTxt.getComponent(cc.Label).string = equip.name
                    
                    if (equip.machine) {
                        machine.active = true
                        nameTxt.color = cc.Color.RED;
                    } else {
                        nameTxt.color = new cc.Color(247,217,61,255);
                    }
                }
            }

            // 属性
            let attrNode: cc.Node = node.getChildByName("attrNode")
            attrNode.getChildByName("atkTxt").getComponent(cc.Label).string = numStr(hero._realValue.getUseAttr(ATTRTYPE.attack))
            attrNode.getChildByName("speedTxt").getComponent(cc.Label).string = numStr(DS(hero._realValue.getFinalAttr("atkSpeed")))
            attrNode.getChildByName("critTxt").getComponent(cc.Label).string = numStr(hero._realValue.getUseAttr(ATTRTYPE.crit)) + "%"
            attrNode.getChildByName("churtTxt").getComponent(cc.Label).string = numStr(hero._realValue.getUseAttr(ATTRTYPE.critHurt)) + "%"
            attrNode.getChildByName("rageTxt").getComponent(cc.Label).string = numStr(hero._realValue.getUseAttr(ATTRTYPE.maxRage))
            attrNode.getChildByName("recoveryTxt").getComponent(cc.Label).string = numStr(hero._realValue.getUseAttr(ATTRTYPE.rage))

            attrNode.getChildByName("normalTxt").getComponent(cc.Label).string = numStr(hero._realValue.getHurtDetails(SKILLTYPE.normal)) + "%"
            attrNode.getChildByName("skillTxt").getComponent(cc.Label).string = numStr(hero._realValue.getHurtDetails(SKILLTYPE.major)) + "%"
            
            // 伤害
            let hurtNode: cc.Node = node.getChildByName("hurtNode")
            let curHurt = fm.heroHurt.get(hero.uid)
            let allHurt = fm.allHurt == 0 ? 1 : fm.allHurt
            let progress = curHurt / allHurt
            hurtNode.getChildByName("hurtBar").getComponent(cc.ProgressBar).progress = progress
            let pro = toDecimal(progress * 100, 1)
            hurtNode.getChildByName("hurtTxt").getComponent(cc.Label).string = "伤害占比" + pro + "%"
            hurtNode.getChildByName("hurtNumTxt").getComponent(cc.Label).string = numStr(curHurt)
        }
    }
}