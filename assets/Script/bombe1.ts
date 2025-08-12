import { _decorator, Component, Vec2 } from 'cc';
const { ccclass, property } = _decorator;
import { Bettle } from './bettle';

@ccclass('Bombe1')
export class Bombe1 extends Component {

    _tiledPos: Vec2 = new Vec2(0, 0);
    _index: number = -1;

    init(index: number, tiledX: number, tiledY: number) {
        this._index = index;
        this._tiledPos.x = tiledX;
        this._tiledPos.y = tiledY;
    }

    start() {
    }

    update(deltaTime: number) {        
    }

    blash(bettle: Bettle): boolean {
        if (this._tiledPos.x == bettle._tiledPos.x && this._tiledPos.y == bettle._tiledPos.y)
            return true;

        return false;
    }

    onFinishBombE1() {
        this.scheduleOnce(() => {
            this.node.getParent().emit("onFinishBombE1", this._index);
        }, 0);
    }
}


