/**
 * 单例工厂类
 */
export default class SingletonFactory {
    private static instances_ = {};

    public static getInstance<T>(c: { new(): T }): T {
        let m: any = c  // 强行转化
        let name = m.name
        if (!name) { return null }

        let obj = SingletonFactory.instances_[name]
        if (!obj) {
            obj = new c()
            SingletonFactory.instances_[name] = obj
        }
        return obj
    }
}