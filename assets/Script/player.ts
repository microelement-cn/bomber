import { _decorator, Component, Node, input, Input, Prefab, EventKeyboard, KeyCode, Vec2, TiledLayer, instantiate } from 'cc';
const { ccclass, property } = _decorator;
import { Map } from './map';
import { Bomb } from './bomb';
import { Bombe1 } from './bombe1';


@ccclass('player')
export class Player extends Component {

    _tiledPosX: number = 0;
    _tiledPosY: number = 0;
    _worldPosX: number = 0;
    _worldPosY: number = 0;
    _mainLayer: TiledLayer = null!;
    _woodLayer: TiledLayer = null!;
    _bombPrefab: Prefab = null!;
    _efftPrefab: Prefab = null!;

    _bomb: Node[] = null;
    _bombEffects: Node[] = null;

    init(tilesPos: Vec2, mainLayer: TiledLayer, woodLayer: TiledLayer, bombPrefab: Prefab, efftPrefab: Prefab) {
        this._tiledPosX = tilesPos.x;
        this._tiledPosY = tilesPos.y;
        this._mainLayer = mainLayer;
        this._woodLayer = woodLayer;
        this._bombPrefab = bombPrefab;
        this._efftPrefab = efftPrefab;

        let tiledOffset = this._mainLayer.getPositionAt(tilesPos);
        this._worldPosX = tiledOffset.x + Map.offsetX;
        this._worldPosY = tiledOffset.y + Map.offsetY;

        this._bomb = new Array<Node>();
        this._bombEffects = new Array<Node>();
    }

    move(x: number, y: number) : boolean {
        if (this._mainLayer.getTileGIDAt(x, y))
            return false;

        if (this._woodLayer.getTileGIDAt(x, y))
            return false;

        let tiledPos = new Vec2(x, y);
        let tiledOffset = this._mainLayer.getPositionAt(tiledPos);
        this._worldPosX = tiledOffset.x + Map.offsetX;
        this._worldPosY = tiledOffset.y + Map.offsetY;
        this.node.setWorldPosition(this._worldPosX, this._worldPosY, 0);
        return true;
    }

    goLeft() {
        let x = this._tiledPosX;
        let y = this._tiledPosY;
        if (this.move(--x, y)) {
            this._tiledPosX = x;
            this._tiledPosY = y;
        }
    }

    goDown() {
        let x = this._tiledPosX;
        let y = this._tiledPosY;
        if (this.move(x, ++y)) {
            this._tiledPosX = x;
            this._tiledPosY = y;
        }
    }

    goRight() {
        let x = this._tiledPosX;
        let y = this._tiledPosY;
        if (this.move(++x, y)) {
            this._tiledPosX = x;
            this._tiledPosY = y;
        }
    }

    goUp() {
        let x = this._tiledPosX;
        let y = this._tiledPosY;
        if (this.move(x, --y)) {
            this._tiledPosX = x;
            this._tiledPosY = y;
        }
    }

    private findBombEmptyPos(): number {
        for (let i = 0; i < this._bomb.length; ++i) {
            if (this._bomb[i] == null)
                return i;
        }
        return -1;
    }

    private findEffsEmptyPos(): number {
        for (let i = 0; i < this._bombEffects.length; ++i) {
            if (this._bombEffects[i] == null)
                return i;
        }
        return -1;
    }

    private createBomb() {
        let bomb = instantiate(this._bombPrefab);
        this._woodLayer.addUserNode(bomb);
        bomb.setWorldPosition(this._worldPosX, this._worldPosY, 0);

        let index = this.findBombEmptyPos();
        if (-1 == index) {
            index = this._bomb.length;
            this._bomb.push(bomb);
        }
        else {
            this._bomb[index] = bomb;
        }

        let bombComp = bomb.getComponent(Bomb);
        bombComp.init(index, this._tiledPosX, this._tiledPosY, this);
    }

    private createBombEffect(tiledPosX: number, tiledPosY: number) {
        let bombEffect = instantiate(this._efftPrefab);
        this._woodLayer.addUserNode(bombEffect);

        let tiledPos: Vec2 = new Vec2(tiledPosX, tiledPosY);
        let tiledOffset = this._woodLayer.getPositionAt(tiledPos);
        bombEffect.setWorldPosition(tiledOffset.x + Map.offsetX, tiledOffset.y + Map.offsetY, 0);
        let index = this.findEffsEmptyPos();
        if (-1 == index) {
            index = this._bombEffects.length;
            this._bombEffects.push(bombEffect);
        }
        else {
            this._bombEffects[index] = bombEffect;
        }
        let bombE1Comp = bombEffect.getComponent(Bombe1);
        bombE1Comp.init(index, tiledPosX, tiledPosY);
    }

    dropBomb() {
        this.createBomb();
    }

    dropEffects(tiledPosX: number, tiledPosY: number) {
        this.createBombEffect(tiledPosX, tiledPosY);

        if (!(this._mainLayer.getTileGIDAt(tiledPosX, tiledPosY - 1) || this._woodLayer.getTileGIDAt(tiledPosX, tiledPosY - 1))) {
            this.createBombEffect(tiledPosX, tiledPosY - 1);
        }

        if (!(this._mainLayer.getTileGIDAt(tiledPosX, tiledPosY + 1) || this._woodLayer.getTileGIDAt(tiledPosX, tiledPosY + 1))) {
            this.createBombEffect(tiledPosX, tiledPosY + 1);
        }

        if (!(this._mainLayer.getTileGIDAt(tiledPosX - 1, tiledPosY) || this._woodLayer.getTileGIDAt(tiledPosX - 1, tiledPosY))) {
            this.createBombEffect(tiledPosX - 1, tiledPosY);
        }

        if (!(this._mainLayer.getTileGIDAt(tiledPosX + 1, tiledPosY) || this._woodLayer.getTileGIDAt(tiledPosX + 1, tiledPosY))) {
            this.createBombEffect(tiledPosX + 1, tiledPosY);
        }
    }

    isBomb(tx: number, ty: number) : boolean {
        this._bomb.forEach(item => {
            if (item != null) {
                let compBomb = item.getComponent(Bomb);
                if (compBomb != undefined) {
                    if (compBomb._tiledPosX == tx &&
                        compBomb._tiledPosY == ty)
                        return true;
                }
            }
        });
        return false;
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this.goLeft();
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this.goDown();
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this.goRight();
                break;
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this.goUp();
                break;
            case KeyCode.SPACE:
                this.dropBomb();
                break;
            default:
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {

    }

    onLoad() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDestory() {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    start() {

    }

    update(deltaTime: number) {
        
    }
}


