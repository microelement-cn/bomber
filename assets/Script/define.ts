import { _decorator, Enum } from "cc";

export enum BettleState {
    Idle = 0,   //空闲
    Turn = 1,   //转身
    Move = 2,   //行走
    Dead = 3,   //死亡
};

Enum(BettleState);

export enum MoveSubState {
    MoveBoot = 0, //启动中
    Moveing  = 1, //行走中
    MoveEnd  = 2, //停下来
}

export enum MoveDirType {
    MoveDirNull = -1,
    MoveDirUp = 0,
    MoveDirDown = 1,
    MoveDirLeft = 2,
    MoveDirRight = 3,
}

export enum PStateType {
    Player_Invalid = -1,
    Player_Idle = 0,
    Player_Move = 1,
    Player_Dead = 2,
}



