import { _decorator, Component, Animation } from 'cc';
const { ccclass, property } = _decorator;
import { Bettle } from './bettle';

@ccclass('bomb')
export class Bomb extends Component {
    _index: number = -1;
    _tiledPosX: number = 0;
    _tiledPosY: number = 0;

    init(index: number, tiledX: number, tiledY: number) {
        this._index = index;
        this._tiledPosX = tiledX;
        this._tiledPosY = tiledY;
    }


    update(deltaTime: number) {
    }

    blash(bettle: Bettle): boolean {
        if (this._tiledPosX == bettle._tiledPos.x &&
            this._tiledPosY == bettle._tiledPos.y)
            return true;

        if (this._tiledPosX + 1 == bettle._tiledPos.x &&
            this._tiledPosY == bettle._tiledPos.y)
            return true;

        if (this._tiledPosX - 1 == bettle._tiledPos.x &&
            this._tiledPosY == bettle._tiledPos.y)
            return true;

        if (this._tiledPosX == bettle._tiledPos.x &&
            this._tiledPosY + 1 == bettle._tiledPos.y)
            return true;

        if (this._tiledPosX == bettle._tiledPos.x &&
            this._tiledPosY - 1 == bettle._tiledPos.y)
            return true;

        return false;
    }
    
    onFinishBomb() {
        this.scheduleOnce(() => {
            this.node.getParent().emit("onFinishBomb", this._index);
        }, 0);
    }
}


