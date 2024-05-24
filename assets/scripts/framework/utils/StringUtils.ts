// 字符串管理
export default class StringUtils {

    static regString( strOrigin: string, type: number = 1 ) {
        if ( !strOrigin ) {
            strOrigin = "";
        }

        var reg: RegExp = null;
        if ( type == 1 ) {//限制输入字母/数字/空格
            reg = new RegExp( "^[A-Za-z0-9\\s]+$" );
        }

        if ( !reg ) {
            return strOrigin;
        }

        let strNew = "";
        //这个for循环是为了检测每个字符，因为现在的输入法可以一次性输入多个字符
        for(let i = 0; i < strOrigin.length; i++){
            if(reg.test(strOrigin.charAt(i))){
                strNew += strOrigin.charAt(i);
            }
        }

        return strNew;
    }

}