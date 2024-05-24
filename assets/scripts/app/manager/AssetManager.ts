import { PATHS } from "../other/Paths";

/**
 * 资源管理类
 */
 class AssetManager {
    private static instance_: AssetManager
    static getInstance (): AssetManager {
        if (!this.instance_) {
            this.instance_ = new AssetManager()
        }
        return AssetManager.instance_
    }

    // 预制体
    prefabs: Map<string, cc.Prefab> = new Map();
    
    // 游戏内常用预制体
    commonPrefabs: Array<string> = [
        "awardPanel",
    ]

    init () {
        let self = this
        for (let i = 0; i < this.commonPrefabs.length; i++) {
            let key = this.commonPrefabs[i]
            cc.resources.load(PATHS.common + "/" + key, function (err, prefab) {
                if (err) {
                    console.log(err)
                } else {
                    self.prefabs.set(key, <cc.Prefab>prefab)
                }
            });
        }
    }

    getPrefab (name: string) {
        return this.prefabs.get(name)
    }

    /***************************** 资源加载全部放到缓存中 切换场景时清除 *****************************/

    clipSpriteAtlas: Map<string, cc.SpriteAtlas> = new Map();
    iconSpriteFrame: Map<string, cc.SpriteFrame> = new Map();

    addClipSpriteAtlas (name: string, sp: cc.SpriteAtlas) {
        this.clipSpriteAtlas.set(name, sp)
    }

    getClipSpriteAtlas (name: string) {
        return this.clipSpriteAtlas.get(name)
    }

    addIconSpriteFrame (name: string, sp: cc.SpriteFrame) {
        this.iconSpriteFrame.set(name, sp)
    }

    getIconSpriteFrame (name: string) {
        return this.iconSpriteFrame.get(name)
    }

    clearAll () {
        this.clipSpriteAtlas.forEach((value , key) =>{
            cc.resources.release(key, cc.SpriteAtlas)
        });
        this.clipSpriteAtlas.clear()

        // this.iconSpriteFrame.forEach((value , key) =>{
            // cc.resources.release(key, cc.SpriteFrame)
            // value.decRef()  // 减少引用次数
        // });
        this.iconSpriteFrame.clear()
    }
}

export default AssetManager.getInstance()