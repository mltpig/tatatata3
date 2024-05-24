import DisUtils from "../../../framework/utils/DisUtils";
import LayerManager from "../../manager/LayerManager";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import { BOOKLOCKTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { DS } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BookHeroItem extends GameView {
    private id: string;
    private data: BOOKOPENDATA;
    private heroData: HEROINFO;                 // 基础数据
    private heroLocalData: HEROLOCALDATA;       // 记录数据
    private upData: HEROUPDATA;                 // 进阶数据

    private heroIcon: cc.Node;
    private stageTxt: cc.Label;
    private nameTxt: cc.Label;
    private heroBar: cc.ProgressBar;
    private patchTxt: cc.Label;
    private lock: boolean;
    private hide: boolean = false

    onLoad () {
        super.onLoad()

        this.heroIcon = this.getNode("heroIcon")
        this.stageTxt = this.getCpByType("stageTxt", cc.Label)
        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
        this.patchTxt = this.getCpByType("patchTxt", cc.Label)
        this.heroBar = this.getCpByType("heroBar", cc.ProgressBar)
        this.heroBar.progress = 0

        this.addEventListener_(Events.hero_level_up, this.refresh.bind(this))
    }
    
    refresh () {
        this.setData(this.data)
    }
    
    setData (data: BOOKOPENDATA) {
        this.data = data
        this.id = data.id
        this.lock = data.lock

        if (this.id == BOOKLOCKTYPE.hide.toString()) {
            this.hide = true
            this.node.opacity = 0
            return
        }

        this.hide = false
        this.node.opacity = 255
        this.heroData = StaticManager.getStaticValue("static_hero", this.id) as HEROINFO
        DisUtils.replaceSprite(PATHS.hero + "/" + this.heroData.res, this.heroIcon)
        this.nameTxt.string = this.heroData.name

        // 锁
        if (this.lock) { 
            this.stageTxt.node.active = false
            this.patchTxt.node.active = false
            this.heroBar.node.active = false
            DisUtils.gray(this.heroIcon.getComponent(cc.Sprite))
            return
        }

        DisUtils.noGray(this.heroIcon.getComponent(cc.Sprite))
        this.heroLocalData = PlayerManager.getHeroData(this.id)
        this.upData = StaticManager.getHeroUpData(data.id, DS(this.heroLocalData.level) + 1) as HEROUPDATA

        this.stageTxt.node.active = true
        this.patchTxt.node.active = true
        this.heroBar.node.active = true

        let str = DS(this.heroLocalData.level) + "阶\n" + DS(this.heroLocalData.exp) + "级"
        this.stageTxt.string = str

        // 满级
        if (!this.upData) {
            this.patchTxt.string = DS(this.heroLocalData.patch) + "/满阶"
            this.heroBar.progress = 1
            return
        }

        let cost = JSON.parse(this.upData.cost_shard)
        this.patchTxt.string = DS(this.heroLocalData.patch).toString() + "/" + cost[0].num
        let pro = DS(this.heroLocalData.patch) / cost[0].num
        this.heroBar.progress = pro
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "clickBtn":
                if (this.hide) { return }
                
                LayerManager.pop({
                    script: "BookHeroDetail",
                    prefab: PATHS.main + "/bookHeroDetail",
                    opacity: 180,
                    data: {
                        heroData: this.heroData,
                        heroLocalData: this.heroLocalData,
                        lock: this.lock,
                    },
                    backClick: true,
                })
                break;
            default:
                break;
        }
    }
}