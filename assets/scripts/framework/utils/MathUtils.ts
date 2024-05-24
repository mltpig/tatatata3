export default class MathUtils {


    /**
     *  随机
     *
     * @static
     * @param {number} min
     * @param {number} max
     * @returns {number}
     * @memberof MathUtils
     */
    static randomRange(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }


    /**
     * 距离
     *
     * @static
     * @param {cc.Vec2} p1
     * @param {cc.Vec2} p2
     * @returns {number}
     * @memberof MathUtils
     */
    static dis(p1: cc.Vec2, p2: cc.Vec2): number {
        return p1.sub(p2).mag();
    }

    /**
     * 返回指定位数数字，前面补零
     *
     * @static
     * @param {number} p1
     * @param {number} p2
     * @returns {string}
     * @memberof MathUtils
     */
    static PrefixInteger(num, m) : string {
        return (Array(m).join("0") + num).slice(-m);
    }
}