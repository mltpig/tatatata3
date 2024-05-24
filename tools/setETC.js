const fs = require('fs');
const path = require('path');

const _etcSettings = {
    "android": {
        "formats": [
          {
            "name": "etc1",
            "quality": "slow"
          }
        ]
      },
      "ios": {
        "formats": [
          {
            "name": "etc2",
            "quality": "slow"
          }
        ]
      }
};
let sourcePath = process.argv[2];
let isCompress = parseInt(process.argv[3]);

let lookupDir = function(url) {
    if (!fs.existsSync(url)) {
        return;
    }
    fs.readdir(url, (err, files) => {
        if (err) {
            console.error(err);
            return;
        }
        files.forEach((file) => {
            let curPath = path.join(url, file);
            let stat = fs.statSync(curPath);
            if (stat.isDirectory()) {
                lookupDir(curPath); // 遍历目录
            } else {
                if (file.indexOf('.meta') >= 0) {
                    fs.readFile(curPath, (err, data) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        let obj = JSON.parse(data);
                        if (obj && obj.platformSettings) {
                            obj.platformSettings = isCompress ? _etcSettings : {}; // 设置压缩纹理
                            let wrdata = JSON.stringify(obj, null, 2);
                            fs.writeFile(curPath, wrdata, (err) => {
                                if (err) {
                                    console.error(err);
                                    return;
                                }
                            });
                        }
                    });
                }
            }
        });
    });
}

if (!path.isAbsolute(sourcePath)) {
    sourcePath = path.join(__dirname, sourcePath)
}
lookupDir(sourcePath);