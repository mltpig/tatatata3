// 资源异步加载类
export default class ResUtils {
    static asyncLoadList: any = {};

    static getAsyncId(node: cc.Node) {
        if (this.asyncLoadList[node.uuid]) {

        } else {
            this.asyncLoadList[node.uuid] = 1;
        }
        return this.asyncLoadList[node.uuid];
    }

    static checkAsync(node: cc.Node, id: number) {
        if (this.asyncLoadList[node.uuid] == id) {
            return true;
        }

        return false;
    }

    static updateAsyncId(node: cc.Node) {
        if (this.asyncLoadList[node.uuid]) {
            this.asyncLoadList[node.uuid]++;
        } else {
            this.asyncLoadList[node.uuid] = 1;
        }
    }

    static loadFnt(url: string, callback: Function) {
        cc.resources.load(url, cc.BitmapFont, (err: Error, result: any) => {
            if (err) {

            } else {
                callback(result);
            }
        })
    }

    // 加载图片, 并返回 SpriteFrame
    static loadSpriteFrame(url: string, callback: Function | null) {
        var retryTimes: number = 2;
        function load() {
            cc.resources.load(url, cc.SpriteFrame, (err: Error, result: any) => {
                if (err) {
                    cc.log("Error spriteFrame is null>", url);
                    if (retryTimes > 0) {
                        retryTimes--;
                        load();
                        return;
                    }
                    if (callback) {
                        callback();
                    }
                } else {
                    if (callback) {
                        callback(result);
                    }
                }
            })
        }

        load();
    }

    static loadAtlas(url: string, callback: Function = null) {
        cc.resources.load(url, cc.SpriteAtlas, function (err: Error, atlas: cc.SpriteAtlas) {
            if (err) {
                cc.log("Error atlas is null>", url);
                if (callback) {
                    callback();
                }
            } else {
                if (callback) {
                    callback(atlas);
                }
            }
        });
    }

    static loadPreb(url: string, callback: Function, instantiate: boolean = true) {
        function load_complete(prefab: any) {
            if (instantiate) {
                var newNode = cc.instantiate(prefab);
                callback(newNode);
            } else {
                callback(prefab);
            }
        }

        cc.resources.load(url, function (err, prefab) {
            if (err) {
                console.log(err)
            } else {
                load_complete.call(this, prefab);
            }
        });
    }

    static loadSpine(dirPath: string, spineName: string, callback: Function) {
        // let LoadFilePath: string = dirPath + "/" + spineName + "/" + spineName;
        // let paths:[string] = [LoadFilePath + '.png', LoadFilePath + '.json'];
        let LoadFilePath: string = `${dirPath}/${spineName}/${spineName}`;

        cc.resources.load(LoadFilePath, sp.SkeletonData, (err: Error, result: any) => {
            callback(result);
        })
    }

    static loadAudio(url: string, callback: Function) {
        cc.resources.load(url, cc.AudioClip, (err: Error, result: cc.AudioClip) => {
            if (err) {
                cc.log(err);
            } else {
                callback(result);
            }
        })
    }

}