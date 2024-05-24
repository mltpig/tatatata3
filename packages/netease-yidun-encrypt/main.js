const LOG = '[netease-yidun-encrypt]';
module.exports = {
    load() {Editor.log(LOG, "欢迎使用易盾游戏加固");},
    unload() {Editor.log(LOG, "欢迎再次使用易盾游戏加固");},
    messages: {
        showPanel() {
            Editor.Panel.open('netease-yidun-encrypt');
            Editor.log(LOG, '欢迎使用易盾游戏加固');
        },
        "editor:build-finished": function(t, e) {
            Editor.log(LOG, "易盾游戏加固构建完成");
        }
    }
};