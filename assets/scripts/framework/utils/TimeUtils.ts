import LocalWords from "./LocalWords";
import Systime from "./Systime";
import MathUtils from "./MathUtils";
import LocalDataManager from "./LocalDataManager";

// 时间管理类
export default class TimeUtils {

    static getDateStr( time: number, typ: number = 1, isServerTime: boolean = true ): string {
        time *= 1000;
        var str: string = "";
        var date: Date = new Date( time );

        if ( isServerTime ) {
            var serverZone: number = LocalDataManager.getItem("serverZone"); //服务器所在时区
            if ( serverZone ) {
                var clientZone = date.getTimezoneOffset() / 60.0 * -1;  //客户端所在时区
                //重新设置时间
                var newTime = time + ( serverZone - clientZone ) * 3600 * 1000;
                date.setTime( newTime );
            }
        }

        if (1 == typ) {
            str = LocalWords.getWord("dateString", date.getFullYear(), date.getMonth() + 1, date.getDate());
        } else if (2 == typ) {
            str = LocalWords.getWord("dateString2", date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
        } else if (3 == typ) {
            str = LocalWords.getWord("dateString3", date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes());
        }else if (4 == typ) {
            str = LocalWords.format("%d%s%s", date.getFullYear(), MathUtils.PrefixInteger(date.getMonth() + 1, 2), MathUtils.PrefixInteger(date.getDate(), 2));
        }
        return str;
    }

    static getTimeStr(time: number): string {
        time *= 1000;
        var str: string = "";
        var date: Date = new Date(time);
        str = LocalWords.getWord("timeString", date.getHours(), date.getMinutes(), date.getSeconds());
        return str;
    }

    static getLastTimeStrAuto(timeInt: number): string {
        var shortType: number;
        if (timeInt >= 3600) {
            shortType = 2;
        } else {
            shortType = 4;
        }

        return this.getLastTimeStr(timeInt, shortType);
    }

    // 获得指定秒数的时长表达文字, 如xx年xx月xx日xx时...
    // time: 多少秒后
    static getLastTimeStr(timeInt: number, shortType: number = 4): string {
        var str: string = "";

        let time1: number = Math.floor(timeInt / (24 * 60 * 60));
        let time2: number = Math.floor(timeInt % (24 * 60 * 60) / (60 * 60));
        let time3: number = Math.floor(timeInt % (24 * 60 * 60) % (60 * 60) / 60);
        let time4: number = Math.floor(timeInt % (24 * 60 * 60) % (60 * 60) % 60);

        var tmparr: number[] = [];
        var tmparr2: number[] = [time1, time2, time3, time4];
        for (let i = 0; i < shortType; i++) {
            tmparr.push(tmparr2[i]);
        }

        var tmpStr: string = LocalWords.getWord("lastTimeString", time1, time2, time3, time4);

        var startIndex: number = -1;
        var endIndex: number = -1;
        var strArr: string[] = tmpStr.split("|");
        for (let i = 0; i < tmparr.length; i++) {
            if (startIndex == -1 && tmparr[i] > 0) {
                startIndex = i;
            }
            if (startIndex >= 0 && tmparr[i] > 0) {
                endIndex = i + 1;
            }
        }

        for (let j = startIndex; j < endIndex; j++) {
            str = str + strArr[j];
        }

        return str;
    }

    // 返回明天0点的时间戳
    static getNextDayTime(): number {
        var curTime: number = Systime.curTime * 1000;
        var date: Date = new Date(curTime);
        date.setDate(date.getDate() + 1);
        date.setHours(0, 0, 0, 0);

        return date.getTime() / 1000;
    }

    // 00:00
    static getTimerDes (time: number): string {
        let num1 = Math.floor(time / 60)
        let num2 = time % 60
        return MathUtils.PrefixInteger(num1, 2) + ":" + MathUtils.PrefixInteger(num2, 2)
    }

}