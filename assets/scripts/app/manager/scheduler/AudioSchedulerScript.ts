const {ccclass, property} = cc._decorator;

// 0.2 秒内不可重复播放相同的音效
const audioInterval: number = 0.2;

/**
 * 处理音效逻辑
 */
interface audioData {
    name: string,
    time: number,
}

@ccclass
export default class AudioSchedulerScript extends cc.Component {
    private audioList: Array<audioData> = [];

    addAudio (name: string) {
        this.audioList.push({
            name: name,
            time: audioInterval,
        })
    }

    getAudio (name: string) {
        for (let i = 0; i < this.audioList.length; i++) {
            if (this.audioList[i].name == name) {
                return this.audioList[i]
            }
        }
        return null
    }

    update (dt: number) {
        for (let i = 0; i < this.audioList.length; i++) {
            this.audioList[i].time = this.audioList[i].time - dt
            if (this.audioList[i].time <= 0) {
                this.audioList.splice(i,1)
                i--
            }
        }
    }
}