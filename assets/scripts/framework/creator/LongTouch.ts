import Events from "../../app/other/Events";
import EventDispatcher from "../utils/EventDispatcher";

const { ccclass, menu, property } = cc._decorator;

@ccclass
@menu("creator/LongTouch")
export default class LongTouch extends cc.Component {
    @property({
        tooltip: "触摸回调间隔（秒）"
    })
    touchInterval: number = 0.5;

    // 自定义参数
    custom: any;

    /**
     * 标记是否有效
     */
    private _isTouching: boolean = false;

    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_START, this._onTouchStart, this,);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.off(cc.Node.EventType.TOUCH_MOVE, this._onTouchMove, this);
        this.node.off(cc.Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.off(cc.Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    }

    private _onTouchStart(event: cc.Event.EventTouch) {
        if (this._isTouching) {
            return;
        }

        if (this.node.getBoundingBoxToWorld().contains(event.getLocation())) {
            this._isTouching = true;
        } else {
            this._isTouching = false;
        }

        if (this._isTouching) {
            this.scheduleOnce(this._touchCounterCallback, this.touchInterval);
        }
    }

    // 滑动取消长按
    private _onTouchMove(event) {
        let p1 = event.touch._startPoint
        let p2 = event.getLocation()
        let isMove = Math.abs(p1.x - p2.x) > 5 || Math.abs(p1.y - p2.y) > 5
        if (isMove) {
            this._isTouching = false;
            this.unschedule(this._touchCounterCallback);
        }
    }

    private _onTouchEnd(event) {
        this._isTouching = false;
        this.unschedule(this._touchCounterCallback);
    }

    private _onTouchCancel(event: cc.Event.EventTouch) {
        this._isTouching = false;
        this.unschedule(this._touchCounterCallback);
    }

    private _touchCounterCallback() {
        if (this._isTouching) {
            this.publishOneTouch();
        } else {
            this.unschedule(this._touchCounterCallback);
        }
    }

    /**
     * 通知出去：被点击/触摸了一次
     */
    private publishOneTouch() {
        EventDispatcher.dispatchEvent(Events.long_touch_event, this.custom)
    }
}