// 移动管理类
function getMoveVector(p1: cc.Vec2, p2: cc.Vec2, speed: number) {
    var tp: cc.Vec2 = new cc.Vec2(0, 0);
    var posSub: cc.Vec2 = p2.sub(p1);
    // 移动弧度
    var degree: number = Math.atan2(posSub.y, posSub.x);
    var angle: number = -degree / Math.PI * 180 + 180;

    var dis: number = p1.sub(p2).mag();
    var remaining: number = 0;
    if (dis <= speed) {
        tp = p2;
        remaining = speed - dis;
    } else {
        tp.x = speed * Math.cos(degree) + p1.x;
        tp.y = speed * Math.sin(degree) + p1.y;
    }

    return {
        movePoint: tp,
        offsetPoint: tp.sub(p1),
        angle: angle,
        remaining: remaining,
        ended: dis <= speed,
    };
}

// 获取p1到p2构成线上指定距离的点
function getPointAtLine(p1: cc.Vec2, p2: cc.Vec2, dis: number): cc.Vec2 {
    var tp: cc.Vec2 = new cc.Vec2(0, 0);
    var posSub: cc.Vec2 = p2.sub(p1);
    // 移动弧度
    var degree: number = Math.atan2(posSub.y, posSub.x);
    var angle: number = -degree / Math.PI * 180 + 180;

    var tp: cc.Vec2 = getMoveVectorByDegree(degree, dis);

    return tp;
}

// 获取p1到p2的角度
function getTargetPointAngle(p1: cc.Vec2, p2: cc.Vec2): any {
    var posSub: cc.Vec2 = p2.sub(p1);
    // 移动弧度
    var degree: number = Math.atan2(posSub.y, posSub.x);
    var angle: number = -degree / Math.PI * 180 + 180;
    return { degree: degree, angle: angle }
}

// 根据角度和速度计算移动的X,Y向量
function getMoveVectorByDegree(degree: number, speed: number): cc.Vec2 {
    var tp: cc.Vec2 = new cc.Vec2(0, 0);

    tp.x = speed * Math.cos(degree);
    tp.y = speed * Math.sin(degree);

    return tp;
}

// 获得指定大小圆上指定角度的点
function getRoundPoint(startPos: cc.Vec2, angle: number, dis: number): cc.Vec2 {
    var degree: number = -(angle - 180) / 180 * Math.PI;
    var offsetPos: cc.Vec2 = getMoveVectorByDegree(degree, dis);
    return startPos.add(offsetPos);
}

// 根据坐标获取角度
function getMoveAngle (x1: number, y1: number, x2: number, y2: number) {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI
}

// 根据坐标获取弧度
function getMoveDegree (x1: number, y1: number, x2: number, y2: number) {
    return Math.atan2(y2 - y1, x2 - x1)
}

// 角度转化弧度
function angle2radian (angle: number) {
    return Math.PI / 180 * angle
}

// 弧度转化角度
function radian2angle (radian: number) {
    return radian * 180 / Math.PI
}

// 按起点 距离 和 角度,得到一个点
function getPosByAngle (x1: number, y1: number, angle: number ,dis: number) {
    let degree = angle2radian(angle)
    let posX = x1 + dis * Math.cos(degree)
    let posY = y1 + dis * Math.sin(degree)
    return cc.v2(posX, posY)
}

// 获得目标点在离原点指定范围内的坐标
function getMovePosInDis(x1: number, y1: number, x2: number, y2: number, dis: number) {
    let degree = Math.atan2(y2 - y1, x2 - x1)
    let distance = cc.v2(x1, y1).sub(cc.v2(x2, y2)).mag()
    if (distance > dis) {
        let px = dis * Math.cos(degree) + x1
        let py = dis * Math.sin(degree) + y1
        return cc.v2(px, py)
    } else {
        return cc.v2(x2,y2)
    }
}

export { 
    getPointAtLine, 
    getMoveVector, 
    getTargetPointAngle, 
    getMoveVectorByDegree, 
    getRoundPoint,
    getMoveAngle,
    angle2radian,
    getPosByAngle,
    getMovePosInDis,
    getMoveDegree,
    radian2angle,
};