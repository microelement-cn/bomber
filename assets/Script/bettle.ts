import { _decorator, Component, Vec2, TiledLayer, math } from 'cc';
const { ccclass, property } = _decorator;
import { BettleState, MoveDirType, MoveSubState } from './define';
import { Map } from './map';
import { Player } from './player';

@ccclass('Bettle')
export class Bettle extends Component {
    _tiledPos: Vec2 = new Vec2(0, 0);      //当前瓦片地图坐标 当前所处位置
    _birthPos: Vec2 = new Vec2(0, 0);      //出生时瓦片地图坐标
    _sourcePos: Vec2 = new Vec2(0, 0);     //当前位置世界坐标 要走到的位置
    _targetPos: Vec2 = new Vec2(0, 0);     //目标位置世界坐标 要走到的位置
    _targetTiledPos: Vec2 = new Vec2(0, 0);
    _state: BettleState = BettleState.Idle;
    _moveDiret: number = 0;
    _moveSpeed: number = 10;
    _moveTimer: number = 0;
    _moveState: MoveSubState = MoveSubState.MoveBoot;

    _mainLayer: TiledLayer = null!;
    _woodLayer: TiledLayer = null!;
    _mapSize: math.Size = new math.Size(0, 0);
    _tileSize: math.Size = new math.Size(0, 0);

    _compPlayer: Player = null;
    private _timerId: number = null;

    init(tiledPos: Vec2, mapSize: math.Size, tileSize: math.Size, mainLayer: TiledLayer, woodLayer: TiledLayer) {
        this._mapSize = mapSize;
        this._tileSize = tileSize;
        this._tiledPos = tiledPos;
        this._mainLayer = mainLayer;
        this._woodLayer = woodLayer;
        this._birthPos = Object.assign({}, tiledPos);
    }

    setPlayer(player: Player) {
        this._compPlayer = player;
    }

    start() {
    }

    private getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private getRandomElement<T>(array: T[]): T {
        return array[this.getRandomInt(0, array.length - 1)];
    }

    private setDirection(): boolean {
        let dirPool = new Array<MoveDirType>();
        if (!this._woodLayer.getTileGIDAt(this._tiledPos.x, this._tiledPos.y + 1) &&
            !this._mainLayer.getTileGIDAt(this._tiledPos.x, this._tiledPos.y + 1) &&
            !this._compPlayer.isBomb(this._tiledPos.x, this._tiledPos.y + 1)) {
            dirPool.push(MoveDirType.MoveDirDown);
        }

        if (!this._woodLayer.getTileGIDAt(this._tiledPos.x, this._tiledPos.y - 1) &&
            !this._mainLayer.getTileGIDAt(this._tiledPos.x, this._tiledPos.y - 1) &&
            !this._compPlayer.isBomb(this._tiledPos.x, this._tiledPos.y - 1)) {
            dirPool.push(MoveDirType.MoveDirUp);
        }

        if (!this._woodLayer.getTileGIDAt(this._tiledPos.x + 1, this._tiledPos.y) && 
            !this._mainLayer.getTileGIDAt(this._tiledPos.x + 1, this._tiledPos.y) &&
            !this._compPlayer.isBomb(this._tiledPos.x + 1, this._tiledPos.y)) {
            dirPool.push(MoveDirType.MoveDirRight);
        }

        if (!this._woodLayer.getTileGIDAt(this._tiledPos.x - 1, this._tiledPos.y) &&
            !this._mainLayer.getTileGIDAt(this._tiledPos.x - 1, this._tiledPos.y) &&
            !this._compPlayer.isBomb(this._tiledPos.x - 1, this._tiledPos.y)) {
            dirPool.push(MoveDirType.MoveDirLeft);
        }

        if (dirPool.length == 0) {
            this._moveDiret = MoveDirType.MoveDirNull;
            return false;
        }
        this._moveDiret = this.getRandomElement(dirPool);
        //for (let i = 0; i < dirPool.length; ++i) {
        //    console.log("dirPool ", i, dirPool[i]);
        //}
        //console.log("setDirection:", this._moveDiret);
        return true;
    }

    private setTargetPos(): boolean {
        let targetPos = new Vec2(0, 0);
        switch (this._moveDiret) {
            case MoveDirType.MoveDirUp:
                targetPos.y = -1;
                break;
            case MoveDirType.MoveDirDown:
                targetPos.y = 1;
                break;
            case MoveDirType.MoveDirLeft:
                targetPos.x = -1;
                break;
            case MoveDirType.MoveDirRight:
                targetPos.x = 1;
                break;
            default:
                return false;
        }

        let sourceOffset = this._mainLayer.getPositionAt(this._tiledPos);
        this._sourcePos.x = sourceOffset.x + Map.offsetX;
        this._sourcePos.y = sourceOffset.y + Map.offsetY;
        //console.log("SetTargetPos sourcePos:", this._sourcePos);
        //console.log("SetTargetPos sourceOffset:", sourceOffset);
        //console.log("SetTargetPos sourceTiledPos:", this._tiledPos);
        targetPos.x += this._tiledPos.x;
        targetPos.y += this._tiledPos.y;
        if (targetPos.x < 0 || targetPos.x >= this._mapSize.width)
            return false;

        if (targetPos.y < 0 || targetPos.y >= this._mapSize.height)
            return false;

        this._targetTiledPos = Object.assign({}, targetPos);
        //console.log("SetTargetPos targetTiledPos:", targetPos);
        let targetOffset = this._mainLayer.getPositionAt(targetPos);
        //console.log("SetTargetPos targetOffset:", targetOffset);
        this._targetPos.x = targetOffset.x + Map.offsetX;
        this._targetPos.y = targetOffset.y + Map.offsetY;
        //console.log("SetTargetPos targetPos:", this._targetPos);
        return true;
    }

    private setMoveTimer(deltaTime: number) {
        this._moveTimer += deltaTime;
    }

    private setMoveState(moveState: number) {
        this._moveState = moveState;
    }

    private moveBoot(deltaTime: number) {
        // 方向、目标位置、开始时间、状态
        if (!this.setDirection())
            return;

        //console.log("moveDiret:", this._moveDiret);
        //console.log("SourcePos:", this._sourcePos);
        //console.log("SourceTiledPos:", this._tiledPos);
        if (!this.setTargetPos())
            return;

        //console.log("TargetPos:", this._targetPos);

        //this.setMoveTimer(deltaTime);
        this.setMoveState(MoveSubState.Moveing);
        //console.log("moveState:", this._moveState);
    }

    private moveBusy(deltaTime: number) {
        //this.setMoveTimer(deltaTime);

        if (this._compPlayer.isBomb(this._targetTiledPos.x, this._targetTiledPos.y)) {
            this.setMoveState(MoveSubState.MoveEnd);
            return;
        }

        let distance = deltaTime * this._moveSpeed;
        //this._moveTimer = 0;
        switch (this._moveDiret) {
            case MoveDirType.MoveDirUp:
                {
                    if (this._sourcePos.y < this._targetPos.y) {
                        this._sourcePos.y += distance;
                    }
                    else {
                        this._tiledPos.y -= 1;
                        this.setMoveState(MoveSubState.MoveEnd);
                    }
                }
                break;
            case MoveDirType.MoveDirDown:
                {
                    //console.log("b move down:", this._sourcePos, this._targetPos, this._tiledPos);

                    if (this._sourcePos.y > this._targetPos.y) {
                        this._sourcePos.y -= distance;
                    }
                    else {
                        this._tiledPos.y += 1;
                        this.setMoveState(MoveSubState.MoveEnd);
                    }

                    //console.log("e move down:", this._sourcePos, this._targetPos, this._tiledPos);
                }
                break;
            case MoveDirType.MoveDirLeft:
                {
                    if (this._sourcePos.x > this._targetPos.x) {
                        this._sourcePos.x -= distance;
                    }
                    else {
                        this._tiledPos.x -= 1;
                        this.setMoveState(MoveSubState.MoveEnd);
                    }
                }
                break;
            case MoveDirType.MoveDirRight:
                {
                    if (this._sourcePos.x < this._targetPos.x) {
                        this._sourcePos.x += distance;
                    }
                    else {
                        this._tiledPos.x += 1;
                        this.setMoveState(MoveSubState.MoveEnd);
                    }
                }
                break;
            default:
                break;
        }

        if(this._state != BettleState.Move)
            return;

        if (this._moveState == MoveSubState.MoveEnd) {
            this._sourcePos = Object.assign({}, this._targetPos);
        }
        this.node.setWorldPosition(this._sourcePos.x, this._sourcePos.y, 0);
        this._mainLayer.markForUpdateRenderData();
    }

    private moveDead(deltaTime: number) {
        //this.setMoveTimer(deltaTime);
        this.setMoveState(MoveSubState.MoveBoot);
    }

    idle() {
        this._state = BettleState.Move;
        this._moveState = MoveSubState.MoveBoot;
    }

    move(deltaTime: number) {
        switch (this._moveState) {
            case MoveSubState.MoveBoot:
                {
                    this.moveBoot(deltaTime);
                }
                break;
            case MoveSubState.Moveing:
                {
                    this.moveBusy(deltaTime);
                }
                break;
            case MoveSubState.MoveEnd:
                {
                    this.moveDead(deltaTime);
                }
                break;
            default:
                break;
        }
    }

    dead(deltaTime: number) {
        //play rebirth animation
        this._state = BettleState.Idle;
        this._tiledPos.x = this._birthPos.x;
        this._tiledPos.y = this._birthPos.y;
    }    

    beKilled() {
        if (this._state == BettleState.Dead)
            return;

        this._state = BettleState.Dead;
        this.node.active = false;
        
        let worldPos = this._mainLayer.getPositionAt(this._birthPos);
        console.log("ke kill birthPos:", this._birthPos);
        this.node.setWorldPosition(worldPos.x + Map.offsetX, worldPos.y + Map.offsetY, 0);

        this._timerId = setTimeout(() => {
            this.node.active = true;
        }, 10000);
    }

    update(deltaTime: number) {
        switch (this._state) {
            case BettleState.Idle:
                {
                    //play move animation
                    this.idle();
                }
                break;
            case BettleState.Turn:
                {
                    //play trun animation
                }
                break;
            case BettleState.Move:
                {
                    this.move(deltaTime);
                }
                break;
            case BettleState.Dead:
                {
                    //play dead animation
                    this.dead(deltaTime);
                }
                break;
            default:
                break;
        }
    }

    onDestory() {
        clearTimeout(this._timerId);
        this._timerId = null;
    }
}


