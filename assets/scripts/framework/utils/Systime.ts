// 系统时间管理类
export default class Systime {
    static _timeoffset: number = 0;

    // 设置当前时间 , 单位为秒
    static set curTime(time: number) {
        Systime._timeoffset = time * 1000 - cc.sys.now();
    }

    static get curTime(): number {
        return (cc.sys.now() + Systime._timeoffset) / 1000;
    }

    // 获得离指定时间还有多少秒
    static getLastTime(time: number): number {
        return new Date(time).getTime() - this.curTime;
    }
}