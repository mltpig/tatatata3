import GameManager from "../../app/manager/GameManager";
import { AD_NATIVE, ANDROID_NATIVE } from "./NativeType";

// 如何在 Android 平台上使用 JavaScript 直接调用 Java 方法
// https://docs.cocos.com/creator/manual/zh/advanced-topics/java-reflection.html
// export function test() {
//     if (GameManager.isAndroid) {
//         //todo
//     } else if (GameManager.isIos) {
//         //todo
//     }
// }

/**
 * 事例
 * 多个参数时
 * "(Ljava/lang/String;Ljava/lang/String;)V", parm1, parm2
 */

export function setClipText(txt: string) {
    if (GameManager.isAndroid) {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", ANDROID_NATIVE.SET_CLIP_FUNC_NAME, "(Ljava/lang/String)V", txt);
    } else if (GameManager.isIos) {
        // todo
        // jsb.reflection.callStaticMethod("CocosHelper", "test2WithParm1:andParm2:", parm1, parm2);
    }
}

/**
 * 初始化sdk
 */
export function initAdSdk() {
    jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", AD_NATIVE.AD_INIT_SDK_NAME, "()V");
}

/**
 * 播放广告
 */
export function showAd() {
    jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", AD_NATIVE.AD_INIT_FUNC_NAME, "()V");
}

/**
 * 一键加qq
 */
export function addQQ (index: number) {
    if (GameManager.isAndroid) {
        jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", ANDROID_NATIVE.ADD_QQ_FUNC_NAME, "(I)V", index);
    }
}