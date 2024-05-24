const {ccclass, property} = cc._decorator;

/**
 * 仅用于技能碰撞快的碰撞回调转接使用
 */
@ccclass
export default class DragHit extends cc.Component {
    public collisionEnter: Function;
    public collisionExit: Function;

    onCollisionEnter (other, self) {
        if (this.collisionEnter) {
            this.collisionEnter(other, self)
        }
    }
    
    onCollisionExit (other, self) {
        if (this.collisionExit) {
            this.collisionExit(other, self)
        }
    }

}