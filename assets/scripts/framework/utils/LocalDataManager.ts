import { decodeData, packageData } from "../../app/other/Global";

// 本地数据记录
export default class LocalDataManager {
    
    // 设置
    static set (key: string, value: any) {
        let str: string = packageData(value)
        cc.sys.localStorage.setItem(key, str);
    }

    // 获取 
    static get (key: string) {
        let str: string = cc.sys.localStorage.getItem(key);
        if (str == null || str == undefined) {
            return null
        }

        let data = decodeData(str)
        return data
    }

    // 清除
    static clear (key: string) {
        cc.sys.localStorage.removeItem(key);
    }

    static getItem(key: string, defaultValue: any = null): any {
        return this.getGlobalItem(key, defaultValue);
    }

    static setItem(key: string, value: any) {
        this.setGlobalItem(key, value);
    }

    static removeItem(key: string) {
        this.removeGlobalItem(key);
    }

    static setGlobalItem(key: string, value: any) {
        var obj: any[] = [value];
        cc.sys.localStorage.setItem(key, JSON.stringify(obj));
    }

    static getGlobalItem(key: string, defaultValue: any = null) {
        var str: string = cc.sys.localStorage.getItem(key);
        if (str == null || str == undefined) {
            return defaultValue;
        }

        var value: any;
        try {
            value = JSON.parse(str)[0];
        } catch (err) {
            value = str;
        }

        return value;
    }

    static removeGlobalItem(key: string) {
        cc.sys.localStorage.removeItem(key);
    }


}