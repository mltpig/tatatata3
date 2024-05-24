import { UIACT } from "../../../framework/utils/Enumer";
import { addQQ, setClipText } from "../../../sdk/native/NativeUtils";
import AudioManager from "../../manager/AudioManager";
import { CLOUDFUN, CLOUDTYPE } from "../../manager/CloundKey";
import GameManager from "../../manager/GameManager";
import LayerManager from "../../manager/LayerManager";
import PlayerManager from "../../manager/PlayerManager";
import StaticManager from "../../manager/StaticManager";
import VER from "../../manager/Ver";
import CloudCommand from "../../net/CloudCommand";
import { ITEMTYPE } from "../../other/Enum";
import GameUtils from "../../other/GameUtils";
import { checkArrayIn } from "../../other/Global";
import { PATHS } from "../../other/Paths";
import GameView from "../GameView";

const {ccclass, property} = cc._decorator;

/**
 * 玩家数据
 */
@ccclass
export default class PlayLayer extends GameView {
    private nameTxt: cc.Label;
    private uidTxt: cc.Label;
    private qqTxt: cc.Label;
    private verTxt: cc.Label;
    private codeBox: cc.EditBox;
    private musicSlider: cc.Slider; 
    private soundSlider: cc.Slider; 

    onLoad () {
        super.onLoad()

        this.nameTxt = this.getCpByType("nameTxt", cc.Label)
        this.uidTxt = this.getCpByType("uidTxt", cc.Label)
        this.qqTxt = this.getCpByType("qqTxt", cc.Label)
        this.verTxt = this.getCpByType("verTxt", cc.Label)
        this.codeBox = this.getCpByType("codeBox", cc.EditBox)
        this.musicSlider = this.getCpByType("musicSlider", cc.Slider)
        this.soundSlider = this.getCpByType("soundSlider", cc.Slider)
        
        this.nameTxt.string = PlayerManager.playerData.name
        this.uidTxt.string = PlayerManager.uid
        this.qqTxt.string = "1004630344"
        this.verTxt.string = VER.ver
        
        this.musicSlider.node.on("slide", this.changeMusic, this)
        this.soundSlider.node.on("slide", this.changeSound, this)

        this.musicSlider.progress = AudioManager.musicVolume
        this.soundSlider.progress = AudioManager.soundVolume
    }

    changeMusic () {
        AudioManager.musicVolume = this.musicSlider.progress
    }

    changeSound () {
        AudioManager.soundVolume = this.soundSlider.progress
    }

    onTouchEnd (name: string) {
        switch (name) {
            case "nameBtn":
                // 修改角色名称
                let cb = ()=> {
                    this.nameTxt.string = PlayerManager.playerData.name
                }
                LayerManager.pop({
                    script: "NameLayer",
                    prefab: PATHS.set + "/nameLayer",
                    backClick: true,
                    type: UIACT.center,
                    data: {
                        callback: cb,
                    }
                })   
                break;
            case "qqBtn":
                if (PlayerManager.isOutLine) {
                    GameUtils.messageHint("离线模式无法使用该功能")
                    return 
                }

                addQQ(0)
                break;
            case "qqBtn2":
                if (PlayerManager.isOutLine) {
                    GameUtils.messageHint("离线模式无法使用该功能")
                    return 
                }
                
                addQQ(1)
                break;
            case "uidBtn":
                setClipText(this.uidTxt.string)
                GameUtils.messageHint("已复制到粘贴板")
                break;
            case "commentBtn":
                if (PlayerManager.isOutLine) {
                    GameUtils.messageHint("离线模式无法使用该功能")
                    return 
                }

                // 评论
                cc.sys.openURL("https://www.taptap.com/app/222245")

                // 解决图鉴未记录问题(保留隐藏功能)
                for (let i = 0; i < PlayerManager.heroData.length; i++) {
                    let v = PlayerManager.heroData[i]

                    let has: boolean = false
                    for (let j = 0; j < PlayerManager.bookData.length; j++) {
                        let v1 = PlayerManager.bookData[j]

                        if (v1.id == v.id) {
                            has = true
                        }
                    }

                    if (!has) {
                        PlayerManager.bookData.push({
                            id: v.id,
                            type: 1,
                        })   
                    }
                }
                PlayerManager.refreshLocalStorage(VER.LOCALSTORAGEKEY.bookData)
                break;
            case "codeBtn":
                // 离线模式
                if (PlayerManager.isOutLine) {
                    GameUtils.messageHint("离线模式无法使用该功能")
                    return
                }

                // 未输入兑换
                let code: string = this.codeBox.textLabel.string
                if (code == "") {
                    GameUtils.messageHint("请输入兑换码")
                    return
                }
                
                // 兑换码已领取
                if (checkArrayIn(PlayerManager.codeData, code)) {
                    GameUtils.messageHint("兑换码奖励已领取")
                    return
                }

                // 检测是否存在无法领取的奖励 给予提示
                let checkCode = function (award: Array<AWARDDATA>) {
                    for (let i = 0; i < award.length; i++) {
                        if (award[i].type == ITEMTYPE.patch) {
                            let d = StaticManager.getStaticValue("static_item", award[i].bid.toString()) as PROPDATA
                            if (!d) {
                                return true
                            }
                        }
                        return false
                    }
                }

                // 处理兑换码数据
                let getCode = (data) => {
                    let hasBad: boolean = false

                    // 全量兑换码
                    if (data.totalCode != "") {
                        let rewards: Array<AWARDDATA> = []
                        let strs: string[] = []
                        for (const key in data.totalCode) {
                            if (!PlayerManager.exchangeCode(key)) {

                                // 可领取
                                let award = JSON.parse(data.totalCode[key])
                                if (checkCode(award)) {
                                    hasBad = true
                                } else {
                                    award.forEach(element => {
                                        rewards.push(element)
                                    });
                                    strs.push(key)
                                }

                            }
                        }

                        // 奖励拿到
                        if (rewards.length > 0) {
                            PlayerManager.addProp(rewards)
                            for (let j = 0; j < strs.length; j++) {
                                PlayerManager.addExchangeCode(strs[j])
                            }
                        }

                        // 存在版本不契合奖励
                        if (hasBad) {
                            GameUtils.messageHint("游戏版本过低，部分奖励无法获取！")
                        }

                        if (rewards.length == 0 && !hasBad) {
                            GameUtils.messageHint("无可领取奖励！")
                        }

                        return
                    }

                    // 单兑换码
                    let awards: string = data.code[code]
                    if (awards) {
                        let award = JSON.parse(awards)
                        if (checkCode(award)) {
                            GameUtils.messageHint("游戏版本过低，无法领取！")
                            return
                        } else {
                            PlayerManager.addProp(award)
                            PlayerManager.addExchangeCode(code)
                            return       
                        }
                    } else {
                        GameUtils.messageHint("无效的兑换码")
                    }
                }

                new CloudCommand(CLOUDFUN.getCode, CLOUDTYPE.func, {
                    uid: PlayerManager.uid,
                    code: code,
                    ver: VER.version        // 根据版本判断
                }, getCode)
                
                break;
            default:
                break;
        }
    }

}