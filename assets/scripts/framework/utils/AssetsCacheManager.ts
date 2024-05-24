
import ResUtils from "./ResUtils";
import DisUtils from "./DisUtils";

// 资源管理相关
export default class AssetsCacheManager {

    static _spineCache: object = {};
    static _prefabCache: object = {};
    static _atlasCache: object = {};

    /**
     * 加载列表中spine
     *
     * @static
     * @param {*} list [路径, 文件名, 其他参数][] 
     * @param {Function} callback
     * @memberof AssetsCacheManager
     */
    static loadSpineList(list: any[], callback: Function) {

        var loadIndex = 0;
        for (let i = 0; i < list.length; i++) {
            const element = list[i];

            AssetsCacheManager.loadSpine(element[0], element[1], element[2], () => {
                ++loadIndex;
                if (loadIndex >= list.length && callback) {
                    callback();
                }
            })
        }
    }

    static loadSpine(dirPath: string, spineName: string, params: any, callback: Function) {
        var LoadFilePath: string = `${dirPath}/${spineName}/${spineName}`;
        if (!AssetsCacheManager._spineCache[LoadFilePath] || !AssetsCacheManager._spineCache[LoadFilePath].sk) {

            ResUtils.loadSpine(dirPath, spineName, (skeletonData) => {
                AssetsCacheManager.addSpineData(dirPath, spineName, params, skeletonData);
                if (callback) {
                    callback();
                }
            })

        } else {
            if (callback) {
                callback();
            }
        }

    }

    static addSpineData(dirPath: string, spineName: string, params: any, skeletonData: sp.SkeletonData) {
        var LoadFilePath: string = `${dirPath}/${spineName}/${spineName}`;

        var tmp : any = {};
        DisUtils.copyProperty(tmp, params);
        tmp.sk = skeletonData;

        AssetsCacheManager._spineCache[LoadFilePath] = tmp;
    }


    /**
     * 获取sp.SkeletonData【包含其他参数】
     *
     * @static
     * @param {string} dirPath
     * @param {string} spineName
     * @returns {{sk:sp.SkeletonData, scale:number}}
     * @memberof AssetsCacheManager
     */
    static getSpineAllData(dirPath: string, spineName: string): any {
        var LoadFilePath: string = `${dirPath}/${spineName}/${spineName}`;

        if (AssetsCacheManager._spineCache[LoadFilePath]) {
            return AssetsCacheManager.clone(AssetsCacheManager._spineCache[LoadFilePath]);
        }

        return null;
    }


    /**
     * 获取sp.SkeletonData【不包含其他参数】
     *
     * @static
     * @param {string} dirPath
     * @param {string} spineName
     * @returns {sp.SkeletonData}
     * @memberof AssetsCacheManager
     */
    static getSpineData(dirPath: string, spineName: string): sp.SkeletonData {
        var LoadFilePath: string = `${dirPath}/${spineName}/${spineName}`;

        if (AssetsCacheManager._spineCache[LoadFilePath]) {
            return AssetsCacheManager._spineCache[LoadFilePath].sk;
        }

        return null;
    }

    static cacheAtlas(url: string, callback: Function = null) {
        if (AssetsCacheManager._atlasCache[url]) {
            if (callback) {
                callback(AssetsCacheManager._atlasCache[url]);
            }
        }
        ResUtils.loadAtlas(url, (result: cc.SpriteAtlas) => {
            if (result) {
                AssetsCacheManager._atlasCache[url] = result;
                if (callback) {
                    callback(result);
                }
            }
        })
    }

    static releaseAtlas(url: string) {
        if (AssetsCacheManager._atlasCache[url]) {
            delete AssetsCacheManager._atlasCache[url];
        }
    }

    static loadSpriteFrame(frameName: string): cc.SpriteFrame {
        var atlas: cc.SpriteAtlas;
        var frame: cc.SpriteFrame;
        for (const key in AssetsCacheManager._atlasCache) {
            atlas = AssetsCacheManager._atlasCache[key];
            if (atlas) {
                frame = atlas.getSpriteFrame(frameName);
                if (frame) {
                    return frame;
                }
            }
        }

        return null;
    }

    static cachePrefab(prefabName: string, prefab: any) {
        this._prefabCache[prefabName] = prefab;
    }

    static getPrefab(prefabName: string): any {
        return this._prefabCache[prefabName];
    }

    static removePrefabCache(prefabName: string) {
        delete this._prefabCache[prefabName];
    }

    static clearPrefabCache() {
        this._prefabCache = {};
    }

    static clone(data: any) {
        var tmp: any = {};
        for (const key in data) {
            tmp[key] = data[key];
        }

        return tmp;
    }

}