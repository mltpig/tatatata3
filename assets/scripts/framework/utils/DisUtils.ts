import AssetManager from "../../app/manager/AssetManager";
import ResUtils from "./ResUtils";

// 基础管理类
export default class DisUtils {

    // 替换sprite资源
    static replaceSprite(url: string, node: cc.Node, callback: Function = null, sizeMode: cc.Sprite.SizeMode = null) {
        var tmpSprite: cc.Sprite = node.getComponent(cc.Sprite);

        if (tmpSprite == null) {
            tmpSprite = node.addComponent(cc.Sprite);
        }

        let loadSpriteFrame = (result: cc.SpriteFrame) => {
            if (result && cc.isValid(node)) {
                if (sizeMode) {
                    tmpSprite.sizeMode = sizeMode;
                }
                tmpSprite.spriteFrame = result;
                if (callback) {
                    callback();
                }
            }
        }

        let spriteFrame = AssetManager.getIconSpriteFrame(url)
        if (spriteFrame) {
            loadSpriteFrame(spriteFrame)
        } else {
            ResUtils.loadSpriteFrame(url, (result: cc.SpriteFrame) => {
                AssetManager.addIconSpriteFrame(url, result)
                loadSpriteFrame(result)
            });
        }
    }
    
    // 清理sprite
    static clearSprite(node: cc.Node) {
        var tmpSprite: cc.Sprite = node.getComponent(cc.Sprite);
        if (tmpSprite) {
            tmpSprite.spriteFrame = null;
        }
    }

    // 新的组件
    static newComponent(className: string): cc.Component {
        var node: cc.Node = new cc.Node();
        var component: cc.Component = node.addComponent(className);
        return component;
    }

    // 适配全屏
    static fixNodeToFullScreen(target: cc.Node) {
        let size = cc.winSize;
        target.width = size.width;
        target.height = size.height;
        target.x = -size.width / 2;
        target.y = -size.height / 2;
    }

    static copyProperty(obj: any, param: any) {
        if (obj && param) {
            for (const protyItem in param) {
                obj[protyItem] = param[protyItem];
            }
        }
    }

    static newLabel(fontName: string = "Arial", size: number = 16, color: cc.Color = cc.Color.WHITE): cc.Label {
        var node: cc.Node = new cc.Node();
        var label: cc.Label = node.addComponent(cc.Label);
        label.useSystemFont = true;
        label.fontFamily = fontName;

        label.fontSize = size;
        node.color = color;

        // 上下居中
        label.verticalAlign = cc.Label.VerticalAlign.CENTER;

        return label;
    }

    static walkChildren(node: cc.Node, callback: Function) {
        for (let i = 0; i < node.children.length; i++) {
            callback(node.children[i]);
        }
    }

    // mask
    static createMaskBg(target: any, callback: Function = null, opacity: number = 180): cc.Node {
        // 单色图片
        let texture = new cc.Texture2D;
        let spriteFrame = new cc.SpriteFrame;
        texture.initWithData(new Uint8Array([0, 0, 0]), cc.Texture2D.PixelFormat.RGB888, 1, 1);
        spriteFrame.setTexture(texture);
        spriteFrame.setRect(cc.rect(0, 0, cc.winSize.width * 2, cc.winSize.width * 2));

        let node = new cc.Node("maskBg_")
        node.color = cc.Color.BLACK
        node.opacity = opacity
        node.setContentSize(cc.winSize.width, cc.winSize.height)
        node.addComponent(cc.Sprite).spriteFrame = spriteFrame;
        node.addComponent(cc.Button)
        node.addComponent(cc.BlockInputEvents)
        if (target && callback) {
            node.on(cc.Node.EventType.TOUCH_END, callback, target);
        }
        return node
    }

    // sprite
    static newSprite(spriteFrame: cc.SpriteFrame) {
        if (!spriteFrame) {
            cc.log("Error spriteFrame is null");
            return null;
        }
        
        var node: cc.Node = new cc.Node();
        var sp = node.addComponent(cc.Sprite);
        sp.spriteFrame = spriteFrame;

        return {
            sp: sp,
            node: node,
        }
    }
    
    // sprite
    static newSprite2(url: string): cc.Node {
        var node: cc.Node = new cc.Node();
        var sp = node.addComponent(cc.Sprite);
        this.replaceSprite(url,node)
        return node
    }

    // 异步sprite
    static newSpriteAsync(url: string, param: any): cc.Sprite {

        var node: cc.Node = new cc.Node();
        var sp = node.addComponent(cc.Sprite);

        DisUtils.copyProperty(node, param);

        DisUtils.replaceSprite(url, node);

        return sp;
    }

    // 设置节点指定大小
    static resizeNode(node: cc.Node, maxSize: cc.Size, noZoomIn: boolean = false) {
        if (!maxSize) {
            return;
        }
        node.scale = 1;
        var curSize: cc.Size = node.getContentSize();
        var curBound: cc.Size = node.getBoundingBox();
        var max: number;
        var scale: number;
        if (curSize.width < curSize.height) {
            max = curSize.width;
            scale = maxSize.width / max;
        } else {
            max = curSize.height;
            scale = maxSize.height / max;
        }

        if (scale > 1 && noZoomIn) {
            return;
        }

        // cc.log("resizeNode....", node, scale, curSize, maxSize);
        node.setScale(scale, scale);
    }

    // 坐标转化
    static getPositionInNode(sourceTarget: cc.Node, pos: cc.Vec2, targetContainer: cc.Node) {
        pos = sourceTarget.convertToWorldSpaceAR(pos);
        pos = targetContainer.convertToNodeSpaceAR(pos);
        return pos;
    }   

    // 移动客户端
    static isMobileClient(): boolean{
        if ( cc.sys.isNative && ( cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS ) ) {
            return true;
        }
        return false;
    }

    // 设置灰色
    static gray (sp: cc.Sprite) {
        sp.getComponent(cc.Sprite).setMaterial(0, cc.Material.getBuiltinMaterial('2d-gray-sprite'));
    }
    
    // 恢复
    static noGray (sp: cc.Sprite) {
        sp.setMaterial(0, cc.Material.getBuiltinMaterial('2d-sprite'));
    }

};