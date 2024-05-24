import LocalDataManager from "../../framework/utils/LocalDataManager";
import PlayerManager from "./PlayerManager";
import AudioSchedulerScript from "./scheduler/AudioSchedulerScript";

/**
 * 音乐音效管理类
 */
 class AudioManager {
    private static instance_: AudioManager
    static getInstance (): AudioManager {
        if (!this.instance_) {
            this.instance_ = new AudioManager()
        }
        return AudioManager.instance_
    }

    private audioCache: Map<string, cc.AudioClip> = new Map()
    private musicVolume_: number = 1;
    private soundVolume_: number = 1;

    static node: cc.Node = null;
    private audioScript: AudioSchedulerScript;

    init () {
        if (AudioManager.node == null) {
            AudioManager.node = new cc.Node();
            AudioManager.node.name = "AudioManagerNode";
            cc.game.addPersistRootNode( AudioManager.node );
            this.audioScript = AudioManager.node.addComponent(AudioSchedulerScript)
        }

        let musicVolume = LocalDataManager.get("musicVolume")
        if (musicVolume != null) {
            this.musicVolume = musicVolume
        }

        let soundVolume = LocalDataManager.get("soundVolume")
        if (soundVolume != null) {
            this.soundVolume = soundVolume
        }
    }

    set musicVolume (musicVolume: number) { 
        this.musicVolume_ = musicVolume 
        cc.audioEngine.setMusicVolume(this.musicVolume_)
        LocalDataManager.set("musicVolume", this.musicVolume_)
    };
    
    set soundVolume (soundVolume: number) { 
        this.soundVolume_ = soundVolume 
        cc.audioEngine.setEffectsVolume(this.soundVolume_)
        LocalDataManager.set("soundVolume", this.soundVolume_)
    };

    get musicVolume (): number { return this.musicVolume_ }; 
    get soundVolume (): number { return this.soundVolume_ }; 

    playMusic (name: string) {
        // 审核
        if (PlayerManager.review) { return }

        let clip = this.audioCache.get(name)
        if (clip) {
            cc.audioEngine.playMusic(clip, true)
        } else {
            let self = this
            cc.resources.load("music/bg/" + name, cc.AudioClip, null, function (err, clip) {
                let p = clip as cc.AudioClip
                self.audioCache.set(name, p)
                cc.audioEngine.playMusic(p, true);
            });
        }
    }

    playEffect (name: string) {
        // 审核
        if (PlayerManager.review) { return }

        if (parseInt(name) == 0) {
            return
        }

        if (this.audioScript.getAudio(name)) {
            return
        }
        
        this.audioScript.addAudio(name)
        let clip = this.audioCache.get(name)
        if (clip) {
            cc.audioEngine.playEffect(clip, false)
        } else {
            let self = this
            cc.resources.load("music/sound/" + name, cc.AudioClip, null, function (err, clip) {
                let p = clip as cc.AudioClip
                self.audioCache.set(name, p)
                cc.audioEngine.playEffect(p, false);
            });
        }
    }

    stopMusic() {
        cc.audioEngine.stopMusic();
    }

    stopAllEffects() {
        cc.audioEngine.stopAllEffects();
    }

}

export default AudioManager.getInstance()