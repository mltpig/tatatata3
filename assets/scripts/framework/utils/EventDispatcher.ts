const { ccclass, property } = cc._decorator;
// 全局事件管理类

@ccclass
export default class EventDispatcher {
    static node: cc.Node = null;

    static init() {
        if (EventDispatcher.node == null) {
            EventDispatcher.node = new cc.Node();
            EventDispatcher.node.name = "EventDispatcherNode";
            cc.game.addPersistRootNode( EventDispatcher.node );
        }
    }

    static addEventListener(type: string, callback: Function, target) {
        EventDispatcher.node.on(type, callback, target);
    }

    static removeEventListener(type: string, callback: Function, target) {
        EventDispatcher.node.off(type, callback, target);
    }

    static removeEventByTarget(target) {
        EventDispatcher.node.targetOff(target);
    }

    static dispatchEvent(type: string, value?: any) {
        EventDispatcher.node.emit(type, value);
    }
}