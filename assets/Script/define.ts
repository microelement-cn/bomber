import { _decorator, Enum } from "cc";

export enum BettleState {
    Idle = 0,   //����
    Turn = 1,   //ת��
    Move = 2,   //����
    Dead = 3,   //����
};

Enum(BettleState);

export enum MoveSubState {
    MoveBoot = 0, //������
    Moveing  = 1, //������
    MoveEnd  = 2, //ͣ����
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



