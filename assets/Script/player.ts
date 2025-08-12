import { _decorator, Component, Node, input, Input, Prefab, EventKeyboard, KeyCode, Vec2, TiledLayer, instantiate, Animation } from 'cc';
const { ccclass, property } = _decorator;
import { Map } from './map';
import { Bomb } from './bomb';
import { Bombe1 } from './bombe1';
import { PStateType } from './define'

let MOVE_TIME = 100;

@ccclass('player')
export class Player extends Component {

    _counter: number = 0;
    _moveSpeed: number = 0.1;
    _keyPusher: number = 0;
    _moveTimer: number = 0;
    _tiledPos: Vec2 = new Vec2(0, 0);
    _worldPos: Vec2 = new Vec2(0, 0);
    _bombPrefab: Prefab = null!;
    _efftPrefab: Prefab = null!;
    _mainLayer: TiledLayer = null!;
    _woodLayer: TiledLayer = null!;

    _bombSize: number = 1;
    _bomb: Node[] = null;
    _bombEffects: Node[] = null;

    _playerState: PStateType = PStateType.Player_Idle;

    init(tiledPos: Vec2, mainLayer: TiledLayer, woodLayer: TiledLayer, bombPrefab: Prefab, efftPrefab: Prefab) {
        this._tiledPos.x = tiledPos.x;
        this._tiledPos.y = tiledPos.y;
        this._mainLayer = mainLayer;
        this._woodLayer = woodLayer;
        this._bombPrefab = bombPrefab;
        this._efftPrefab = efftPrefab;

        let tiledOffset = this._mainLayer.getPositionAt(tiledPos);
        this._worldPos.x = tiledOffset.x + Map.offsetX;
        this._worldPos.y = tiledOffset.y + Map.offsetY;

        this._bomb = new Array<Node>();
        this._bombEffects = new Array<Node>();
    }

    canMove(x: number, y: number): boolean {
        console.log(x, y);
        if (this._mainLayer.getTileGIDAt(x, y)) 
            return false;

        console.log("mainLayer:", x, y);
        if (this._woodLayer.getTileGIDAt(x, y))
            return false;

        console.log("woodLayer:", x, y);
        return true;
    }

    move(x: number, y: number) : boolean {
        if (this._mainLayer.getTileGIDAt(x, y))
            return false;

        if (this._woodLayer.getTileGIDAt(x, y))
            return false;

        let tiledPos = new Vec2(x, y);
        let tiledOffset = this._mainLayer.getPositionAt(tiledPos);
        this._worldPos.x = tiledOffset.x + Map.offsetX;
        this._worldPos.y = tiledOffset.y + Map.offsetY;
        this.node.setWorldPosition(this._worldPos.x, this._worldPos.y, 0);
        return true;
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
        bomb.setWorldPosition(this._worldPos.x, this._worldPos.y, 0);

        let index = this.findBombEmptyPos();
        if (-1 == index) {
            index = this._bomb.length;
            this._bomb.push(bomb);
        }
        else {
            this._bomb[index] = bomb;
        }

        let bombComp = bomb.getComponent(Bomb);
        bombComp.init(index, this._tiledPos.x, this._tiledPos.y, this);
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
                    if (compBomb._tiledPosX == tx && compBomb._tiledPosY == ty)
                        return true;
                }
            }
        });
        return false;
    }

    private goKeyCode(keyCode: number) {
        if (this._moveTimer != 0)
            return;

        this._moveTimer = Date.now();
        this._keyPusher = keyCode;
        this.setPlayerState(PStateType.Player_Move);
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this._keyPusher = KeyCode.ARROW_LEFT;
                //this.goKeyCode(KeyCode.ARROW_LEFT);
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this._keyPusher = KeyCode.ARROW_DOWN;
                //this.goKeyCode(KeyCode.ARROW_DOWN);
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this._keyPusher = KeyCode.ARROW_RIGHT;
                //this.goKeyCode(KeyCode.ARROW_RIGHT);
                break;
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this._keyPusher = KeyCode.ARROW_UP;
                //this.goKeyCode(KeyCode.ARROW_UP);
                break;
            case KeyCode.SPACE:
                this.dropBomb();
                break;
            default:
                break;
        }
    }

    private setPlayerState(state: PStateType) {
        if (this._playerState == state)
            return;

        this._playerState = state;
    }

    private resetKeyPusher() {
        this._keyPusher = 0;
        this._moveTimer = 0;
        this.setPlayerState(PStateType.Player_Idle);
    }

    private goLeftOver() {
        if (this._keyPusher != KeyCode.ARROW_LEFT)
            return;

        this.resetKeyPusher();
    }

    private goDownOver() {
        if (this._keyPusher != KeyCode.ARROW_DOWN)
            return;

        this.resetKeyPusher();
    }

    private goRightOver() {
        if (this._keyPusher != KeyCode.ARROW_RIGHT)
            return;

        this.resetKeyPusher();
    }

    private goUpOver() {
        if (this._keyPusher != KeyCode.ARROW_UP)
            return;

        this.resetKeyPusher();
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this.goLeftOver();
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this.goDownOver();
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this.goRightOver();
                break;
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this.goUpOver();
                break;
            case KeyCode.SPACE:
                //this.dropBomb();
                break;
            default:
                break;
        }
    }

    getWorldPosAtTiled(x: number, y: number): Vec2 {
        let tiledPos = new Vec2(x, y);
        let tiledOffset = this._mainLayer.getPositionAt(tiledPos);
        let worldPos = new Vec2(0, 0);
        worldPos.x = tiledOffset.x + Map.offsetX;
        worldPos.y = tiledOffset.y + Map.offsetY;
        return worldPos;
    }

    private goLeftPressing() {
        if (this._keyPusher != KeyCode.ARROW_LEFT)
            return;

        this.goKeyCode(KeyCode.ARROW_LEFT);

        let curTimer = Date.now();
        let deltTime = curTimer - this._moveTimer;
        let distance = deltTime * this._moveSpeed;

        let tiledsWorldPos = this.getWorldPosAtTiled(this._tiledPos.x, this._tiledPos.y);

        let x = this._tiledPos.x;
        let y = this._tiledPos.y;
        if (!this.canMove(--x, y))
            return;

        let sourceWorldPos = Object.assign({}, this._worldPos);
        let targetWorldPos = this.getWorldPosAtTiled(x, y);
        
        this._worldPos.x = sourceWorldPos.x - distance;
        this._worldPos.y = tiledsWorldPos.y;
        if (sourceWorldPos.x - distance < targetWorldPos.x) {
            this._tiledPos.x = x;
            this._worldPos.x = targetWorldPos.x;
        }

        this.node.setWorldPosition(this._worldPos.x, this._worldPos.y, 0);
        this._moveTimer = curTimer;
    }

    private goDownPressing() {
        if (this._keyPusher != KeyCode.ARROW_DOWN)
            return;

        this.goKeyCode(KeyCode.ARROW_DOWN);

        let curTimer = Date.now();
        let deltTime = curTimer - this._moveTimer;
        let distance = deltTime * this._moveSpeed;

        let tiledsWorldPos = this.getWorldPosAtTiled(this._tiledPos.x, this._tiledPos.y);

        let x = this._tiledPos.x;
        let y = this._tiledPos.y;
        if (!this.canMove(x, ++y))
            return;

        let sourceWorldPos = Object.assign({}, this._worldPos);
        let targetWorldPos = this.getWorldPosAtTiled(x, y);

        this._worldPos.x = tiledsWorldPos.x;
        this._worldPos.y = sourceWorldPos.y - distance;
        if (sourceWorldPos.y - distance < targetWorldPos.y) {
            this._tiledPos.y = y;
            this._worldPos.y = targetWorldPos.y;
        }

        this.node.setWorldPosition(this._worldPos.x, this._worldPos.y, 0);
        this._moveTimer = curTimer;
    }

    private goRightPressing() {
        if (this._keyPusher != KeyCode.ARROW_RIGHT)
            return;

        this.goKeyCode(KeyCode.ARROW_RIGHT);

        let curTimer = Date.now();
        let deltTime = curTimer - this._moveTimer;
        let distance = deltTime * this._moveSpeed;

        let tiledsWorldPos = this.getWorldPosAtTiled(this._tiledPos.x, this._tiledPos.y);

        let x = this._tiledPos.x;
        let y = this._tiledPos.y;
        if (!this.canMove(++x, y))
            return;

        console.log("move distance:", deltTime, distance);
        let sourceWorldPos = Object.assign({}, this._worldPos);
        let targetWorldPos = this.getWorldPosAtTiled(x, y);

        this._worldPos.x = sourceWorldPos.x + distance;
        this._worldPos.y = tiledsWorldPos.y;
        if (sourceWorldPos.x + distance > targetWorldPos.x) {
            this._tiledPos.x = x;
            this._worldPos.x = targetWorldPos.x;
        }

        this.node.setWorldPosition(this._worldPos.x, this._worldPos.y, 0);
        this._moveTimer = curTimer;
    }

    private goUpPressing() {
        if (this._keyPusher != KeyCode.ARROW_UP)
            return;

        let curTimer = Date.now();
        if (curTimer - this._moveTimer < MOVE_TIME)
            return;

        let x = this._tiledPos.x;
        let y = this._tiledPos.y;
        if (this.move(x, --y)) {
            this._tiledPos.x = x;
            this._tiledPos.y = y;
        }
        this._moveTimer = curTimer;
    }

    onKeyPressing(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_A:
            case KeyCode.ARROW_LEFT:
                this.goLeftPressing();
                break;
            case KeyCode.KEY_S:
            case KeyCode.ARROW_DOWN:
                this.goDownPressing();
                break;
            case KeyCode.KEY_D:
            case KeyCode.ARROW_RIGHT:
                this.goRightPressing();
                break;
            case KeyCode.KEY_W:
            case KeyCode.ARROW_UP:
                this.goUpPressing();
                break;
            case KeyCode.SPACE:
                break;
            default:
                break;
        }
    }

    onLoad() {
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_PRESSING, this.onKeyPressing, this);
    }

    onDestory() {
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_PRESSING, this.onKeyPressing, this);
    }

    start() {

    }

    private playerIdleState(idleAnimation: Animation, deltaTime: number) {
        if (idleAnimation == undefined)
            return;

        const isPlaying = idleAnimation.getState('foxidle')?.isPlaying;
        if (isPlaying)
            return;

        idleAnimation.play('foxidle');
    }

    private playerMoveState(moveAnimation: Animation, deltaTime: number) {
        if (moveAnimation == undefined)
            return;

        const isPlaying = moveAnimation.getState('foxrun')?.isPlaying;
        if (isPlaying)
            return;

        moveAnimation.play('foxrun');
    }

    private playerDeadState(deadAnimation: Animation, deltaTime: number) {
        if (deadAnimation == undefined)
            return;
        const isPlaying = deadAnimation.getState('foxdead')?.isPlaying;
        if (isPlaying)
            return;

        deadAnimation.play('foxdead');
    }

    update(deltaTime: number) {
        let animation = this.node.getComponent(Animation);
        switch (this._playerState) {
            case PStateType.Player_Idle:
                {
                    this.playerIdleState(animation, deltaTime);
                }
                break;
            case PStateType.Player_Move:
                {
                    this.playerMoveState(animation, deltaTime);
                }
                break;
            case PStateType.Player_Dead:
                {
                    this.playerDeadState(animation, deltaTime);
                }
                break;
            default:
                break;
        }
    }
}


