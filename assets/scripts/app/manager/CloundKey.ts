// 云函数
const CLOUDFUN = {
    // 兑换码
    getCode: "getCode",
    // 服务器时间
    getServerTime: "getServerTime",
    // 更新排行数据
    updateServerRank: "updateServerRank",
}

// 请求类型
enum CLOUDTYPE {
    login,      // 登录
    func,       // 云函数
    data,       // 数据库
}

export {
    CLOUDFUN,
    CLOUDTYPE,
}