import Base64 from "../../framework/utils/Base64";
import MD5 from "../../framework/utils/MD5";

/**
 * json数据拷贝
 * @param data 
 * @returns 
 */
// export function clone(data) {
//     return JSON.parse(JSON.stringify(data));
// }

/**
 * !#zh 拷贝object。
 */
/**
 * 深度拷贝
 * @param {any} sObj 拷贝的对象
 * @returns 
 */
 export function clone (sObj: any) {
    if (sObj === null || typeof sObj !== "object") {
        return sObj;
    }

    let s: {[key: string]: any} = {};
    if (sObj.constructor === Array) {
        s = [];
    }

    for (let i in sObj) {
        if (sObj.hasOwnProperty(i)) {
            s[i] = clone(sObj[i]);
        }
    }
    
    return s;
}

/**
 * 数组排序
 * @param t 数组
 * @param key 
 * @param up 从小到大
 * @returns 
 */
export function sortByKey(t, key, up: string = "up") {
    let comepare = function (a, b) {
        if (up == "up") {
            return Number(a[key]) - Number(b[key])
        } else {
            return Number(b[key]) - Number(a[key])
        }
    }
    return t.sort(comepare)
}

/**
 * 分离字符串
 * @param str 
 * @param key 
 * @returns 
 */
export function splitNumber(str: string, key: string) {
    let list = str.split(key)
    let nlist = []
    for (const v of list) {
        nlist.push(Number(v))
    }
    return nlist
}

/**
 * 根据函数删除指定元素
 * @param t 
 * @param f 
 */
export function splice(t, f: Function) {
    for (let i = 0; i < t.length; i++) {
        if (f(t[i], i)) {
            t.splice(i,1)
            i--;
        }
    }
}

/**
 * 根据value删除指定元素
 * @param t 
 * @param value 
 * @returns 
 */
export function spliceByValue(t, value) {
    for (let i = 0; i < t.length; i++) {
        if (t[i] == value) {
            t.splice(i,1)
            return
        }
    }
}

/**
 * 合并自然数组
 * @param t 
 * @param t1 
 */
export function mergeArray(t, t1) {
    let nt = []
    for (let i = 0; i < t.length; i++) {
        nt.push(t[i])
    }
    for (let i = 0; i < t1.length; i++) {
        nt.push(t1[i])
    }
    return nt
}

// 返回删除指定数据的数组
export function spliceArray(t, i, index) {
    if (t.length <= index) {
        return []
    }

    let newt = clone(t)
    newt.splice(i, index)
    return newt
}

export function checkArrayIn(t, value) {
    for (let i = 0; i < t.length; i++) {
        if (t[i] == value) {
            return true
        }
    }
    return false
}

export function checkArrayInKey(t, key, value) {
    for (let i = 0; i < t.length; i++) {
        if (t[i][key] == value) {
            return true
        }
    }
    return false
}

// 数组类似于map的获取
export function arrayGet(t, s, key) {
    for (let i = 0; i < t.length; i++) {
        if (t[i][s] == key) {
            return t[i]
        } 
    }
    return
}

// 数组类似于map的设置
export function arraySet(t, s, key, value) {
    for (let i = 0; i < t.length; i++) {
        if (t[i][s] == key) {
            t[i] = value
        } 
    }
}

let _index_ = "21534"     // 密钥
/**
 * 加密
 * @param value 
 * @returns 
 */
export function ES(value: number): string {
    if (!value || value == 0) {
        return ""
    }

    value = value * Number(_index_)
    let str = value.toString()
    let len = str.length
    let arr = []
    for (let i = 0; i < len; i++) {
        let s = str.substr(i, 1)
        arr.push(s)
    }

    let tmpArr = []
    let endKey = arr.length
    if (endKey % 2 == 0) {
        endKey = endKey + 1
    }

    for (let i = 0; i < arr.length; i++) {
        if (i % 2 == 0) {
            tmpArr[i] = arr[i]
        } else {
            tmpArr[i] = arr[endKey - i - 1]
        }
    }

    str = ""
    for (let i = 0; i < tmpArr.length; i++) {
        str = str + tmpArr[i]
    }
    return str
}

/**
 * 解密
 * @param value 
 * @returns 
 */
export function DS(value: string): number {
    if (!value || value == "") {
        return 0
    }

    let arr = []
    let len = value.length
    for (let i = 0; i < len; i++) {
        arr[i] = value.substr(i, 1)
    }

    let endKey = arr.length
    if (endKey % 2 == 0) {
        endKey = endKey + 1
    }

    let tmpArr = []
    for (let i = 0; i < arr.length; i++) {
        if (i % 2 == 0) {
            tmpArr[i] = arr[i]
        } else {
            tmpArr[i] = arr[endKey - i - 1]
        }
    }

    value = ""
    for (let i = 0; i < tmpArr.length; i++) {
        value = value + tmpArr[i]
    }

    let real = Number(value) / Number(_index_)
    return real
}

/**
 * 产生随机整数，包含下限值，但不包括上限值
 * @param {Number} lower 下限
 * @param {Number} upper 上限
 * @return {Number} 返回在下限到上限之间的一个随机整数
 */
 export function random1(lower, upper) {
	return Math.floor(Math.random() * (upper - lower)) + lower;
}
 
/**
 * 产生随机整数，包含下限值，包括上限值
 * @param {Number} lower 下限
 * @param {Number} upper 上限
 * @return {Number} 返回在下限到上限之间的一个随机整数
 */
 export function random2(lower, upper) {
	return Math.floor(Math.random() * (upper - lower+1)) + lower;
}  

/**
 * 产生一个随机的rgb颜色
 * @return {String}  返回颜色rgb值字符串内容，如：rgb(201, 57, 96)
 */
 export function randomColor() {
	// 随机生成 rgb 值，每个颜色值在 0 - 255 之间
	var r = random2(0, 256),
		g = random2(0, 256),
		b = random2(0, 256);
	// 连接字符串的结果
	var result = "rgb("+ r +","+ g +","+ b +")";
	// 返回结果
	return result;
} 

/**
 * 解决运算结果出现多位小数的问题
 * @param x
 * @param length
 * @returns {number}
 */
export function toDecimal (x, length) {
    if(!length){
        length = 2;
    }
    let val = Number(x);
    if(!isNaN(parseFloat(x))) {
        val = Number(val.toFixed(length))
    }
    return val;
}

/**
 * 本地数据记录
 * 加密
 * @param data 
 * @returns 
 */
let SIGN_KEY = "_-()+15ebf9&$a59893!fucka34009c3^*573b7051f678"
export function packageData(data): string {
    // 加密
    var strData: string = JSON.stringify( data );
    var signData = strData + "{" + SIGN_KEY + "}"
    var sign: string = MD5.Instance.hex_md5(signData)

    var d = Base64.encode( strData )
    var o: any = {}
    o.sign = sign
    o.data = d

    return JSON.stringify(o);
}

/**
 * 本地数据揭秘
 * 判断是否揭秘有效
 * @param data 
 * @returns 
 */
export function decodeData (data: string) {
    let d = JSON.parse(data)
    let rd = Base64.decode(d.data)
    let ld = JSON.parse(rd)
    return ld
}

/**
 * 数字转化 仅作为显示使用
 * 1000 => 1k
 * 1000 000 => 1m 
 * 1000 000 000 => 1b
 * @param num 
 * @returns 
 */
export function numStr (num: number, value: number = 2): string {
    let change = function (num: number, per: number, key: string) {
        let m = doDemical(num / per)
        let s = m.toString() + key
        return s
    }
    
    if (num >= 1000000000000) {
        return change(num, 1000000000000, "t")
    } else if (num >= 1000000000) {
        return change(num, 1000000000, "b")
    } else if (num >= 1000000) {
        return change(num, 1000000, "m")
    } else if (num >= 1000) {
        return change(num, 1000, "k")
    } else {
        return Math.floor(num).toString()
    }
}

/**
 * 保留多位小数
 * @param num 
 * @param value 
 * @returns 
 */
export function doDemical (num: number, value: number = 2): number {
    let m = num.toFixed(value)
    return Number(m)
}

/**
 * 随机字符串
 */
export function randString (index: number): string {
    let outString: string = '';
    let inOptions: string = 'abcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < index; i++) {
        outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length))
    }
    return outString
}