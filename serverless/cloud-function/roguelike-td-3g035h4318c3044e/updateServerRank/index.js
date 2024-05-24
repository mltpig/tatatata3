'use strict';
const tcb = require('@cloudbase/node-sdk');
const app = tcb.init();
const auth = app.auth();
const db = app.database();
exports.main = async (event, context) => {
    // 获取数据库
    var databaseName = "rank_" + event.index
    
    // 新版本排行版
    if (event.version && event.version >= 1147) {
        if (event.runeType == 1) {
            databaseName = "rankFive_" + event.index
        } else {
            databaseName = "rankFive2_" + event.index
        }
    } else if (event.version && event.version >= 1142) {
        databaseName = "rankFour_" + event.index
    } else if (event.version && event.version >= 1132) {
        databaseName = "rankThree_" + event.index
    } else if (event.version && event.version >= 1128) {
        databaseName = "ranTwo_" + event.index
    } else if (event.version && event.version >= 1124) {
        return {
            status: 0,
            data: {
                time: Date.now(),
            }
        }       
    } else if (event.version && event.version >= 1116) {
        databaseName = "rankNew_" + event.index
    }

    var uid = event.uid

    //********************************** 封号 **********************************//

    var ids = [
        "a7ff9115296944aa8de6939e3570ef14",
        "03a8dd091fbf4f759f09b683a28fc36b",
        "14e3523d5a60426898c4629e67661178",
        "20ff638269d0403394d1030da2a8b982",
    ]
    for (let i = 0; i < ids.length; i++) {
        if (ids[i] == uid) {
            return {
                status: 0,
                data: {
                    time: Date.now(),
                }
            }       
        }
    }
    
    var data = event.data
    var numLimit = 100

    //********************************** 作弊检测 1128 **********************************//
    if (event.version && event.version >= 1128) {
        var _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        
        // private method for UTF-8 encoding
        var _utf8_encode = function (string) {
            string = string.replace(/\r\n/g, '\n');
            let utftext = '';
            for (let n = 0; n < string.length; n++) {
                const c = string.charCodeAt(n);
                if (c < 128) {
                utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
                } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
                }

            }
            return utftext;
        }

        // public method for encoding
        var encode = function (input) {
            let output = '';
            let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            let i = 0;
            input = _utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                enc4 = 64;
                }
                output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
            }
            return output;
        }

        let secret = encode(uid + data.wave + data.score)
        if (secret != data.secret) {
            // 作弊
            return {
                status: 0,
                data: {
                    time: Date.now(),
                }
            }       
        }
    }
    
    var info = await db
    .collection(databaseName)
    .limit(numLimit)
    .get()

    var list = info.data
    // 我存在与排行版？是否更新
    // 我不在排行版？是否比最后一名高？
    // 排行版人数少于numLimit？

    var inRank = false;
    var myKey = -1;
    var score = -1;
    var key = -1;
    for (let i = 0; i < list.length; i++) {
          var v = list[i];
          if (v.uid == uid) { 
                inRank = true 
                myKey = i
          }

          if (score == -1 || score > v.score) {
              score = v.score
              key = i
          }
    }

    // 比场上都小
    if (data.score <= score) {
        if (!inRank && list.length < numLimit) {
              db
              .collection(databaseName)
              .add({
                  uid: uid,
                  name: data.name,
                  wave: data.wave,
                  score: data.score,
              })
        }
    } else {
        // 在排行版内
        if (inRank) {
            if (list[myKey].score < data.score) {
                db
                .collection(databaseName)
                .where({ uid: uid })
                .update({
                    name: data.name,
                    wave: data.wave,
                    score: data.score,
                })
            }
        } else {
            if (list.length >= numLimit) {
                // 剔除
                db
                .collection(databaseName)
                .where({ uid: list[key].uid })
                .remove()
            }
                
            // 新增
            db
            .collection(databaseName)
            .add({
                uid: uid,
                name: data.name,
                wave: data.wave,
                score: data.score,
            })
        }
    }
    
    return {
        status: 0,
        data: {
            time: Date.now(),
        }
    };
};
