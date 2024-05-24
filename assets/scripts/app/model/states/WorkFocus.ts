import ActorBase from "../ActorBase";

interface WORKDATA {
    id: string,
    arg: ActorBase | cc.Vec2,
    speical: boolean
}

// 工作效率
const workNum: number = 20;

/**
 * 发射器管理
 * 工作效率 => 分帧执行
 */
 export default class WorkFocus {
    private target: ActorBase;
    public works: Array<WORKDATA> = [];

    constructor (target: ActorBase) {
        this.target = target
    }

    // launch
    update2 () {
        this.work()
    }

    add (id: string, arg: ActorBase | cc.Vec2, speical: boolean) {
        this.works.push({
            id: id,
            arg: arg,
            speical: speical,
        })
    }

    work () {
        let m: number = 0
        for (let i = 0; i < this.works.length; i++) {
            if (i >= workNum) { break }

            m = i + 1
            let v = this.works[i]
            this.target.addLaunchStart(v.id, v.arg, v.speical)
        }
        
        if (m > 0) {
            this.works.splice(0,m)
        }
    }
}
