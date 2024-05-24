/**
 * 做为底层节点使用(不建议使用scene)
 * @returns 
 */
const TSCENE = (): cc.Node => {
    let scene = cc.director.getScene()
    if (scene) {
        return scene.getChildByName("Canvas")
    }
    return
}

export {
    TSCENE
}