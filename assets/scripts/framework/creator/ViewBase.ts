import SingletonFactory from "../utils/SingletonFactory"        // 工厂类
import EventDispatcher from "../utils/EventDispatcher"          // 全局事件分发

/***
 * 基础类 包含：
 * 单例工厂 日志打印 组件列表
 * 事件监听 全局事件监听
 * 所有子类必须在 onLoad 和 onDestroy 时super
 * 
*/
export default abstract class ViewBase extends cc.Component {
    sFactory_ = SingletonFactory.getInstance;

    //节点
    private nodeDict_: any = {}; 
    // 全局事件监听
    private gameEvent_: any = {};

    onLoad () {
        this.initComponent_();
        this.initListener_();
    }

    onDestroy () {
        this.unRegisterEvent_()
    }

    //初始化组件查找
    initComponent_ () {
        this.nodeDict_ = {};

        let linkWidget = function(self, nodeDict_) {
            let children = self.children;
            for (let i = 0; i < children.length; i++) {
                let widgetName = children[i].name;
                if (nodeDict_[widgetName] == null) {
                    // 相同名称时取第一个节点记录
                    nodeDict_[widgetName] = < cc.Component>children[i];
                }

                if (children[i].childrenCount > 0) {
                    linkWidget(children[i], nodeDict_);
                }
            }
        }.bind(this);
        linkWidget(this.node, this.nodeDict_);
    }

    // 添加按钮监听
    initListener_ () {
        for (const key in this.nodeDict_) {
            if (this.nodeDict_.hasOwnProperty(key)) {
                const element = this.nodeDict_[key];
                let isBtn = element.getComponent(cc.Button)
                if (!isBtn) { continue }
                element.on(cc.Node.EventType.TOUCH_END, this.onTouchEnded, this)
            }
        }
    }

    //移除监听事件
    unRegisterEvent_() {
        for (const i in this.gameEvent_) {
            let v = this.gameEvent_[i]
            this.removeEventListener_(i, v)
        }
    }

    addEventListener_ (type: string, callback: Function) {
        EventDispatcher.addEventListener(type, callback, this)
        this.gameEvent_[type] = callback;
    }

    removeEventListener_ (type: string, callback: Function) {
        EventDispatcher.removeEventListener(type, callback, this)
    }

    dispatchEvent_ (type: string, value?: any) {
        EventDispatcher.dispatchEvent(type, value)
    }

    // 监听函数
    onTouchEnded (event) {

        // 自定义设置
        // interactable 本身只针对组件自带的监听，自定义需要特殊处理
        let btn = (event.target as cc.Node).getComponent(cc.Button)
        if (btn && btn.interactable) {
            let name = event.target.name
            this.onTouchEnd(name)
        }
    }
    onTouchEnd (name: string) { }

    // 指定节点指定组件
    getCpByType<T extends cc.Component> (name: string, type: { prototype: T }): T{
        return this.nodeDict_[name].getComponent(type)
    }

    // 指定节点
    getNode (name: string): cc.Node {
        return this.nodeDict_[name]
    }
}