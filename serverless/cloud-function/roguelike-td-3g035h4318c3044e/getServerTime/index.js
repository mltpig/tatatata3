
'use strict';
const tcb = require('@cloudbase/node-sdk');
const app = tcb.init();
const auth = app.auth();
const db = app.database();
exports.main = async (event, context) => {
    // 1.获取服务器时间：
    return {
        status: 0,
        data: {
            time: Date.now(),
            ver: "1.1.47",
            verNum: 1147,
            review: true,
        }
    };
};
