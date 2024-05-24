import List from "../../../framework/creator/List";
import SelectButton from "../../../framework/creator/SelectButton";
import LayerManager from "../../manager/LayerManager";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import { BOOKLOCKTYPE, BOOKTYPE, SELECTBTNTYPE } from "../../other/Enum";
import Events from "../../other/Events";
import { RUNETYPE } from "../../other/FightEnum";
import { checkArrayIn, checkArrayInKey, DS, mergeArray } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";
import BookHeroNode from "./BookHeroNode";
import BookMonsterNode from "./BookMonsterNode";
import BookRuneNode from "./BookRuneNode";

const numIndex: number = 5

const {ccclass, property} = cc._decorator;

@ccclass
export default class BookLayer extends GameView {
    private heroBtn: SelectButton;
    private runeBtn: SelectButton;
    private monsterBtn: SelectButton;
    private rune2Btn: SelectButton;
    private haveList1: List; 
    private haveList2: List; 
    private haveList3: List; 
    private haveList4: List; 
    private exchangeBtn: cc.Node;

    private heroLists: Array<Array<BOOKOPENDATA>> = [];           
    private runeLists: Array<Array<BOOKOPENDATA>> = [];
    private monstersLists: Array<Array<BOOKOPENDATA>> = [];
    private runeLists2: Array<Array<BOOKOPENDATA>> = [];
    
    private bookType: SELECTBTNTYPE;

    onLoad () {
        super.onLoad()

        this.heroBtn = this.getCpByType("heroBtn", SelectButton)
        this.runeBtn = this.getCpByType("runeBtn", SelectButton)
        this.monsterBtn = this.getCpByType("monsterBtn", SelectButton)
        this.rune2Btn = this.getCpByType("rune2Btn", SelectButton)

        this.heroBtn.selectCallback = this.showView.bind(this)
        this.runeBtn.selectCallback = this.showView.bind(this)
        this.monsterBtn.selectCallback = this.showView.bind(this)
        this.rune2Btn.selectCallback = this.showView.bind(this)

        this.haveList1 = this.getCpByType("haveList1", List)
        this.haveList2 = this.getCpByType("haveList2", List)
        this.haveList3 = this.getCpByType("haveList3", List)
        this.haveList4 = this.getCpByType("haveList4", List)
        this.exchangeBtn = this.getNode("exchangeBtn")
        this.exchangeBtn.active = false

        this.addTitleLayer_({
            name: "养成图鉴",
            cb: this.close_.bind(this)
        })

        this.addEventListener_(Events.hero_update_event, this.refreshHeroShow.bind(this))
    }

    start () {
        this.dealHeroData()
        this.dealRuneData()
        this.dealRuneData2()
        this.dealMonsterData()
        this.showView(SELECTBTNTYPE.book_hero)
    }

    // 处理数据
    addItem(list: Array<BOOKOPENDATA>, id: string, num: number = 1) {
        for (let i = 0; i < num; i++) {
            list.push({
                id: id,
                lock: true,
            })
        }
    }

    outList (list: Array<Array<BOOKOPENDATA>>, oldList: Array<BOOKOPENDATA>) {
        let index = 0
        list[index] = []
        for (let i = 0; i < oldList.length; i++) {
            if (Math.floor(i / numIndex) > index) {
                index = index + 1
                list[index] = []
            }
            list[index].push(oldList[i])
        }
    }

    dealHeroData () {
        let heroData = StaticManager.getStaticValues("static_hero") as Array<HEROINFO>
        let d = PlayerManager.bookData
        let heroLists: Array<BOOKOPENDATA> = [];

        // 排序 等阶=>等级=>id
        let newD: Array<SORTDATA> = []
        for (let i = 0; i < d.length; i++) {
            let hd = PlayerManager.getHeroData(d[i].id)
            newD.push({
                id: parseInt(d[i].id),
                level: DS(hd.level),
                exp: DS(hd.exp),
                patch: DS(hd.patch),
            })
        }

        let sort = (a: SORTDATA, b: SORTDATA) => {
            if (a.level == b.level) {
                if (a.exp == b.exp) {
                    if (a.patch == b.patch) {
                        return a.id - b.id
                    } else {
                        return b.patch - a.patch
                    }
                } else {
                    return b.exp - a.exp
                }
            } else {
                return b.level - a.level   
            }
        }
        newD.sort(sort)

        this.addItem(heroLists, BOOKLOCKTYPE.open.toString(), numIndex);

        // 已解锁
        for (let i = 0; i < newD.length; i++) {
            let v = newD[i];
            heroLists.push({
                id: v.id.toString(),
                lock: false,
            })
        }

        let num = heroLists.length % numIndex == 0 ? 0 : numIndex - heroLists.length % numIndex
        this.addItem(heroLists, BOOKLOCKTYPE.hide.toString(), num);

        this.addItem(heroLists, BOOKLOCKTYPE.lock.toString(), numIndex);

        // 未解锁
        let check = function (allt, t: Array<BOOKOPENDATA>) {
            for (let i = 0; i < allt.length; i++) {
                let v = allt[i];
                if (!checkArrayInKey(t, "id", v.id)) {
                    t.push({
                        id: v.id,
                        lock: true,
                    })
                }
            }
        }
        check(heroData, heroLists)

        this.outList(this.heroLists, heroLists)
    }

    dealRuneData () {
        let runeData = StaticManager.getRune(1) as Array<RUNEDATA>
        let runeLists: Array<BOOKOPENDATA> = [];
        this.addItem(runeLists, BOOKLOCKTYPE.rune.toString(), numIndex);

        let artifactList: Array<BOOKOPENDATA> = [];
        for (let i = 0; i < runeData.length; i++) {
            if (runeData[i].type == RUNETYPE.rune) {
                runeLists.push({
                    id: runeData[i].id,
                    lock: false,
                    type: 1,
                })
            } else {
                artifactList.push({
                    id: runeData[i].id,
                    lock: false,
                    type: 1,
                })
            }
        }
        let num1 = runeLists.length % numIndex == 0 ? 0 : numIndex - runeLists.length % numIndex
        this.addItem(runeLists, BOOKLOCKTYPE.hide.toString(), num1);

        this.addItem(runeLists, BOOKLOCKTYPE.artifact.toString(), numIndex);

        runeLists = mergeArray(runeLists, artifactList)

        this.outList(this.runeLists, runeLists)
    }

    dealRuneData2 () {
        let runeData = StaticManager.getRune(2) as Array<RUNEDATA>
        let runeLists: Array<BOOKOPENDATA> = [];
        this.addItem(runeLists, BOOKLOCKTYPE.rune.toString(), numIndex);

        let artifactList: Array<BOOKOPENDATA> = [];
        for (let i = 0; i < runeData.length; i++) {
            if (runeData[i].type == RUNETYPE.rune) {
                runeLists.push({
                    id: runeData[i].id,
                    lock: false,
                    type: 2,
                })
            } else {
                artifactList.push({
                    id: runeData[i].id,
                    lock: false,
                    type: 2,
                })
            }
        }
        let num1 = runeLists.length % numIndex == 0 ? 0 : numIndex - runeLists.length % numIndex
        this.addItem(runeLists, BOOKLOCKTYPE.hide.toString(), num1);

        this.addItem(runeLists, BOOKLOCKTYPE.artifact.toString(), numIndex);

        runeLists = mergeArray(runeLists, artifactList)

        this.outList(this.runeLists2, runeLists)
    }

    dealMonsterData () {
        let monsterData = StaticManager.getStaticValues("static_monster") as Array<MONSTERINFO>
        let monstersLists: Array<BOOKOPENDATA> = [];
        
        for (let i = 0; i < monsterData.length; i++) {
            monstersLists.push({
                id: monsterData[i].id,
                lock: false
            })
        }

        this.outList(this.monstersLists, monstersLists)
    }

    showView (type: SELECTBTNTYPE) {
        if (this.bookType == type) { return }
        this.bookType = type

        let num1 = type == SELECTBTNTYPE.book_hero ? this.heroLists.length : 0
        let num2 = type == SELECTBTNTYPE.book_rune ? this.runeLists.length : 0
        let num3 = type == SELECTBTNTYPE.book_monster ? this.monstersLists.length : 0
        let num4 = type == SELECTBTNTYPE.book_rune2 ? this.runeLists2.length : 0

        this.haveList1.node.active = type == SELECTBTNTYPE.book_hero
        this.exchangeBtn.active = this.haveList1.node.active
        this.haveList2.node.active = type == SELECTBTNTYPE.book_rune
        this.haveList3.node.active = type == SELECTBTNTYPE.book_monster
        this.haveList4.node.active = type == SELECTBTNTYPE.book_rune2

        this.haveList1.numItems = num1
        this.haveList2.numItems = num2
        this.haveList3.numItems = num3
        this.haveList4.numItems = num4
    }

    onOpenListRender1 (item: cc.Node, idx: number) {
        let cell = item.getComponent(BookHeroNode)
        cell.setData(this.heroLists[idx])
    }

    onOpenListRender2 (item: cc.Node, idx: number) {
        let cell = item.getComponent(BookRuneNode)
        cell.setData(this.runeLists[idx])
    }

    onOpenListRender3 (item: cc.Node, idx: number) {
        let cell = item.getComponent(BookMonsterNode)
        cell.setData(this.monstersLists[idx])
    }

    onOpenListRender4 (item: cc.Node, idx: number) {
        let cell = item.getComponent(BookRuneNode)
        cell.setData(this.runeLists2[idx])
    }

    refreshHeroShow () {
        this.bookType = null
        this.dealHeroData()
        this.showView(SELECTBTNTYPE.book_hero)
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "exchangeBtn":
                LayerManager.pop({
                    script: "ExchangeLayer",
                    prefab: PATHS.main + "/exchangeLayer",
                    backClick: true,
                })   
                break;
            default:
                break;
        }
    }
}