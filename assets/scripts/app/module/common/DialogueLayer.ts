import GameView from "../GameView";

const { ccclass, property } = cc._decorator;

/**
 * 角色对话框
 */
@ccclass
export default class DialogueLayer extends GameView {
    private dialogueTxt: cc.Label;

    onLoad () {
        super.onLoad()
        this.dialogueTxt = this.getCpByType("dialogueTxt", cc.Label)
    }
    
    talk (word: string) {
        let charArr = word.replace(/<.+?\/?>/g, '').split('');
        let tempStrArr = [word];
        
        for (let i = charArr.length; i > 1; i--) {
          let curStr = tempStrArr[charArr.length - i];
          let lastIdx = curStr.lastIndexOf(charArr[i - 1]);
          let prevStr = curStr.slice(0, lastIdx);
          let nextStr = curStr.slice(lastIdx + 1, curStr.length);
        
          tempStrArr.push(prevStr + nextStr);
        }

        let strArr = tempStrArr.reverse()
        let self = this
        let index = 0
        let callback = function () {
            self.dialogueTxt.string = strArr[index]
            index = index + 1
        }

        let t = cc.tween;
        t(self.node)
        .parallel(
            t().call(callback),
            t().delay(0.2),
        )
        .repeat(strArr.length)
        .removeSelf()
        .start()
    }
}