
'use strict';
const tcb = require('@cloudbase/node-sdk');
const app = tcb.init();
const auth = app.auth();
const db = app.database();
exports.main = async (event, context) => {
    // 1.更新服务器时间
    // 2.返回兑换码
    var realCode = {};
    var str = event.code

    var commonCode = {
        "tttttd": "[{\"bid\":15008,\"type\":5,\"num\":10},{\"bid\":14001,\"type\":4,\"num\":2000}]",
        "gogogo": "[{\"bid\":15018,\"type\":5,\"num\":5},{\"bid\":14001,\"type\":4,\"num\":5000}]",
        "wakeup": "[{\"bid\":14001,\"type\":4,\"num\":8000}]",
        "shadubal": "[{\"bid\":15008,\"type\":5,\"num\":5},{\"bid\":14001,\"type\":4,\"num\":5000}]",
        "nospoon": "[{\"bid\":15006,\"type\":5,\"num\":3},{\"bid\":14001,\"type\":4,\"num\":3000}]",
        "y1s1": "[{\"bid\":15003,\"type\":5,\"num\":5},{\"bid\":14001,\"type\":4,\"num\":5000}]",
        "miaomiao": "[{\"bid\":15002,\"type\":5,\"num\":6},{\"bid\":14001,\"type\":4,\"num\":6000}]",
        "lufei": "[{\"bid\":14001,\"type\":4,\"num\":10000}]",
        "kasile": "[{\"bid\":15013,\"type\":5,\"num\":20},{\"bid\":14001,\"type\":4,\"num\":20000}]",
        "dajidali": "[{\"bid\":15013,\"type\":5,\"num\":50},{\"bid\":15003,\"type\":5,\"num\":50},{\"bid\":15004,\"type\":5,\"num\":50},{\"bid\":15019,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":100000}]",
        "caidao": "[{\"bid\":15019,\"type\":5,\"num\":50},{\"bid\":15004,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":20000}]",
        "xiexie": "[{\"bid\":15014,\"type\":5,\"num\":50},{\"bid\":15013,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":20000}]",
        "kelong": "[{\"bid\":15021,\"type\":5,\"num\":50},{\"bid\":15022,\"type\":5,\"num\":50},{\"bid\":15006,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":50000}]",
        "ljzuozhe": "[{\"bid\":15021,\"type\":5,\"num\":50},{\"bid\":15022,\"type\":5,\"num\":50},{\"bid\":15006,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":50000}]",
        "kda999": "[{\"bid\":15018,\"type\":5,\"num\":50},{\"bid\":15007,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":30000}]",
        "gangtie": "[{\"bid\":15006,\"type\":5,\"num\":50},{\"bid\":15014,\"type\":5,\"num\":50},{\"bid\":15021,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":30000}]",
        "qiutian": "[{\"bid\":15023,\"type\":5,\"num\":50},{\"bid\":15013,\"type\":5,\"num\":50},{\"bid\":15012,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":50000}]",
        "mie": "[{\"bid\":15024,\"type\":5,\"num\":50},{\"bid\":15019,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":20000}]",
        "edg": "[{\"bid\":15016,\"type\":5,\"num\":77},{\"bid\":15023,\"type\":5,\"num\":77},{\"bid\":15024,\"type\":5,\"num\":77},{\"bid\":14001,\"type\":4,\"num\":77777}]",
        "fushen": "[{\"bid\":15026,\"type\":5,\"num\":50},{\"bid\":15025,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":20000}]",
        "1130": "[{\"bid\":15025,\"type\":5,\"num\":50},{\"bid\":15026,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":30000}]",
        "1135": "[{\"bid\":15005,\"type\":5,\"num\":50},{\"bid\":15027,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":30000}]",
        "haidaogou": "[{\"bid\":15028,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":50000}]",
        "zhale": "[{\"bid\":15028,\"type\":5,\"num\":500},{\"bid\":14001,\"type\":4,\"num\":5000000}]",
        "xiaozhang": "[{\"bid\":15029,\"type\":5,\"num\":50},{\"bid\":15030,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":50000}]",
        "fuwen": "[{\"bid\":15031,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":50000}]",
        "xinxin": "[{\"bid\":15032,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":50000}]",
        "2022": "[{\"bid\":15032,\"type\":5,\"num\":50},{\"bid\":14001,\"type\":4,\"num\":50000}]",
    }
    
    if (commonCode[str]) {
        realCode = {
            [str]: commonCode[str]
        }
    }
    
    //todo 单人兑换码
    // if (event.uid == "") {
    //     commonCode["test"] = "";
    // }
    
    // 全额兑换码
    var totalCode = ""
    if (str == "666") {
        totalCode = commonCode
    }
    
    return {
        status: 0,
        data: {
            time: Date.now(),
            code: realCode,
            totalCode: totalCode,
        }
    };
};