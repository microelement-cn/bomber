import { _decorator, Component, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

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

    onFinishBomb() {
        //this.scheduleOnce(() => {
        //    this.node.removeFromParent();
        //    this.node.destroy();
        //}, 0);
    }
}


