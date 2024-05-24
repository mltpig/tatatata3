import AssetManager from "../../app/manager/AssetManager";

const { ccclass, menu, property } = cc._decorator;
// 序列帧动画

@ccclass
@menu("creator/CCAnimation")
export default class CCAnimation extends cc.Component {
    // 路径
    private path_: string = "animation/";
    // 当前动作/动画名
    private curName_: string = null;
    // 循环
    private loop_: cc.WrapMode = cc.WrapMode.Normal;
    // 动画组件
    private animation_: cc.Animation = null;
    // 回调
    public onPlayCallBack:Function = null;
    public onStopCallBack:Function = null;
    public onFinishedCallBack:Function = null;

    onLoad () {
        // 必须包含组件 cc.Sprite cc.Animation
        let sprite: cc.Sprite = this.node.getComponent(cc.Sprite)
        if (!sprite) {
            this.node.addComponent(cc.Sprite)
        }

        this.animation_ = this.node.getComponent(cc.Animation);
        if (!this.animation_) {
            this.animation_ = this.node.addComponent(cc.Animation);
        }

        this.animation_.on("play",this.onPlay,this);
        this.animation_.on("stop",this.onStop,this);
        this.animation_.on("finished",this.onFinished,this);
    }

    /**
     * 不可直接调用
     * @param name 名称
     * @param wrapMode 模式 
     * @param speed 速度
     */
    private addClip (epath: string, name: string, wrapMode: cc.WrapMode = cc.WrapMode.Normal, speed: number = 0.5) {
        let self = this
        let path = self.path_ + epath + name

        let show = (atlas: cc.SpriteAtlas)=> {
            if (!self.isValid) { return }
            if (!atlas) { return }
            
            var spriteFrames = atlas.getSpriteFrames();
            var clip = cc.AnimationClip.createWithSpriteFrames(spriteFrames, spriteFrames.length);
            clip.name = name
            clip.wrapMode = wrapMode
            clip.speed = speed
            self.animation_.addClip(clip);
            self.animation_.play(name);
        }

        let atlas = AssetManager.getClipSpriteAtlas(path)
        if (atlas) {
            show(atlas)
        } else {
            cc.resources.load(path, cc.SpriteAtlas, (err, atlas) => {
                AssetManager.addClipSpriteAtlas(path, <cc.SpriteAtlas>atlas)
                show(<cc.SpriteAtlas>atlas)
            });
        }
    }

    setScale (num: number) {
        this.node.scale = num
    }
    
    /**
     * 播放动画
     * @param name  动画动作名
     * @param wrapMode 播放模式
     */
    play (epath: string, name: string, wrapMode?: cc.WrapMode) {
        if (name == "") { return }
        if (this.animation_ == null || this.animation_.getClips == null) { return }

        let nameArr = name.split(",")
        let nameStr = nameArr[0]
        let speed = nameArr[1] ? parseFloat(nameArr[1]) : 1
        
        this.curName_ = name
        this.loop_ = wrapMode ? wrapMode : cc.WrapMode.Normal
        this.node.active = true
        
        let clips = this.animation_.getClips()
        let clip = null
        for (const v of clips) {
            if (v.name == name) {
                clip = v
                break
            }
        }

        if (clip) {
            clip.wrapMode = wrapMode
            this.animation_.play(nameStr)
        } else {
            this.addClip(epath, nameStr, this.loop_, speed)
        }
    }

    public stopAnimation(actName: string) : void {
        if(this.animation_){
            this.animation_.stop(actName);
        }
    }
 
    private onPlay() : void {
        if(this.onPlayCallBack){
            this.onPlayCallBack();
            this.onPlayCallBack = null
        }
    }
 
    private onStop() : void {
        if(this.onStopCallBack){
            this.onStopCallBack();
            this.onStopCallBack = null
        }
    }
 
    // 移除必须在回调里面移除
    private onFinished() : void {
        if (this.loop_ == cc.WrapMode.Normal) {
            if(this.node){
                this.node.active = false;
            }
        }

        if(this.onFinishedCallBack){
            this.onFinishedCallBack();
            this.onFinishedCallBack = null
        }
    }

    // 设置播放完成自动清除节点
    autoRemove () {
        let self = this
        this.onFinishedCallBack = function () {
            if (self.node.isValid) {
                self.node.destroy()
            }
        }
    }
    
    pause () {
        this.animation_.pause()
    }

    resume () {
        this.animation_.resume()
    }

    clear () {
        this.node.getComponent(cc.Sprite).spriteFrame = null
        this.animation_.stop()
    }

}