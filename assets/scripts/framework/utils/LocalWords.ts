import ResUtils from "./ResUtils";

export default class LocalWords {

    static _wordsList: string[] = [
        "words"
    ];

    static _words: object = {};
    static _otherWords: object = {};

    static loadJsonList(callback: Function) {
        var needLoadNum: number = LocalWords._wordsList.length;
        var loadedNum: number = 0;
        for (let index = 0; index < needLoadNum; index++) {
            let jsonName: string = LocalWords._wordsList[index];
            // LocalWords.loadJson(`statics/${jsonName}`, () => {
            //     ++loadedNum;
            //     if (loadedNum >= needLoadNum && callback) {
            //         callback();
            //     }
            // })
        }
    }

    static addWords(map: any, sourcekey: string = null) {
        var source: any;
        if (sourcekey && LocalWords._otherWords[sourcekey]) {
            source = LocalWords._otherWords[sourcekey];
        }

        if (source == null) {
            source = LocalWords._words;
        }

        for (const key in map) {
            source[key] = map[key];
        }
    }

    static removeWords(sourcekey: string) {
        delete LocalWords._otherWords[sourcekey];
    }

    static getWord(key: string, ...value: any[]): string {
        var str: string = LocalWords._words[key];
        if (str) {

        } else {
            for (const key in LocalWords._otherWords) {
                if (LocalWords._otherWords[key]) {
                    str = LocalWords._otherWords[key];
                    break;
                }
            }
        }

        if (!str) {
            return this.getWord2(key, ...value);
        }

        str = LocalWords.format(str, ...value);

        return str;
    }

    /**
     * 直接获取语言包内容
     *
     * @static
     * @param {string} key
     * @param {...any[]} value
     * @returns {string}
     * @memberof LocalWords
     */
    private static getWord2(key: string, ...value: any[]): string {
        // return i18n.getWord(key, ...value);
        return ""
    }

    static format(str: string, ...value: any[]): string {
        return cc.js.formatStr(str, ...value);
    }
}