let stateBase = {
    "0": {
        id: 0,
        name: "无",
        from: [],
        to: "none",
        condition: [],
        mv: "",
        sort: 1,
    },
    "1": {
        id: 1,
        name: "行走",
        from: [0, 2, 3],
        to: "walk",
        condition: [],
        mv: "",
        sort: 1,
    },
    "2": {
        id: 2,
        name: "待机",
        from: [0, 1, 3],
        to: "wait",
        condition: [],
        mv: "",
        sort: 1,
    },
    "3": {
        id: 3,
        name: "技能",
        from: [1, 2, 3],
        to: "skill",
        pos: 0,
        skillId: 0,
        condition: [],
        mv: "",
        sort: 1,
    },
    "4": {
        id: 4,
        name: "死亡",
        from: [1, 2, 3],
        to: "dead",
        condition: [],
        mv: "",
        sort: 1,
    },
    "5": {
        id: 5,
        name: "复活",
        from: [4],
        to: "revive",
        condition: [],
        mv: "",
        sort: 1,
    },
    "6": {
        id: 6,
        name: "结束",
        from: [4],
        to: "finish",
        condition: [],
        mv: "",
        sort: 1,
    },

    /******************** 特殊 ********************/

    "10": {
        id: 10,
        name: "加buff",
        from: [],
        to: "",
        condition: [],
        mv: "",
        extra: [],
        sort: 1,
    },
    "11": {
        id: 11,
        name: "瞬时技能",
        from: [],
        to: "",
        condition: [],
        mv: "",
        extra: [],
        sort: 1,
    },
    "12": {
        id: 12,
        name: "光环",
        from: [],
        to: "",
        condition: [],
        mv: "",
        extra: [],
        sort: 1,
    },
    "13": {
        id: 13,
        name: "特性",
        from: [],
        to: "",
        condition: [],
        mv: "",
        extra: [],
        sort: 1,
    },
    "14": {
        id: 14,
        name: "对话",
        from: [],
        to: "",
        condition: [],
        mv: "",
        extra: [],
        sort: 1,
    },
}

let heroState = [
    {
        id: 101,
        pid: 2,
        condition: [],
        sort: 1,
    },
    {
        id: 102,
        pid: 3,
        condition: [[3,3,1], [4,3,1]],
        pos: 1,
        sort: 100,
    },
    // {
    //     id: 103,
    //     pid: 4,
    //     condition: [[1,4,0]],
    //     sort: 10000,
    // },
    // {
    //     id: 104,
    //     pid: 6,
    //     condition: [],
    //     sort: 12000,
    // }
]

let monsterState = [
    {
        id: 201,
        pid: 1,
        condition: [],
        sort: 1,
    },
    // {
    //     id: 202,
    //     pid: 3,
    //     condition: [[3,3,1], [4,3,1]],
    //     pos: 1,
    //     sort: 100,
    // },
    {
        id: 203,
        pid: 4,
        condition: [[1,4,0]],
        sort: 10000,
    },
    {
        id: 204,
        pid: 6,
        condition: [],
        sort: 12000,
    }
]

let extraState = [
    {
        id: 301,
        pid: 2,
        condition: [],
        sort: 1,
    },
    {
        id: 302,
        pid: 4,
        condition: [[1,4,0]],
        sort: 10000,
    },
    {
        id: 303,
        pid: 6,
        condition: [],
        sort: 12000,
    }
]

export {
    stateBase,
    heroState,
    monsterState,
    extraState,
}