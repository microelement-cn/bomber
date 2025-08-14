import { _decorator, Component, input, Input, EventKeyboard, KeyCode, TiledMap, TiledLayer, Prefab, instantiate, TiledObjectGroup, Vec2, math } from 'cc';
const { ccclass, property } = _decorator;
import { Bomb } from './bomb';
import { Bombe1 } from "./bombe1";
import { Player } from "./player";
import { Bettle } from "./bettle";

@ccclass('Map')
export class Map extends Component {
    @property
    static offsetX: number = 50;
    @property
    static offsetY: number = 82;

    @property(Prefab)
    playerPrefab: Prefab = null!;

    @property(Prefab)
    bomberPrefab: Prefab = null!;

    @property(Prefab)
    ballbombPrefab: Prefab = null!;

    @property(Prefab)
    efftbombPrefab: Prefab = null!;

    @property(TiledMap)
    map: TiledMap = null!;

    @property(TiledObjectGroup)
    objectsGroup: TiledObjectGroup = null!;

    @property(TiledLayer)
    mainLayer: TiledLayer = null!;

    @property(TiledLayer)
    woodLayer: TiledLayer = null!;

    mapSize: math.Size = null;
    tileSize: math.Size = null;
    compPlayer: Player = null;
    compBettle: Bettle[] = new Array<Bettle>();

    private findNullBettle(): number {
        for (let i = 0; i < this.compBettle.length; ++i) {
            if (null == this.compBettle[i])
                return i;
        }
        return -1;
    }
    onLoad() {
        this.loadMap();
        this.effects();
    }

    getTiledPos(pos: Vec2): Vec2 {
        let tileSize = this.map.getTileSize();
        let x = Math.floor(pos.x / tileSize.width);
        let y = Math.floor(pos.y / tileSize.height);
        
        return new Vec2(x, y);
    }

    generatePlayer(item: any) {
        let player = instantiate(this.playerPrefab);
        this.objectsGroup.node.addChild(player);
        let offset = new Vec2(item.offset.x, item.offset.y);
        let tilesPos = this.getTiledPos(offset);
        let worldPos = this.mainLayer.getPositionAt(tilesPos);
        player.setWorldPosition(Map.offsetX + worldPos.x, Map.offsetY + worldPos.y, 0);
        let realPos = new Vec2(Map.offsetX + worldPos.x, Map.offsetY + worldPos.y);
        console.log(realPos);
        this.compPlayer = player.getComponent(Player);
        this.compPlayer.init(tilesPos, this.mainLayer, this.woodLayer, this.ballbombPrefab, this.efftbombPrefab);
    }

    generateBettle(item: any) {
        let bettle = instantiate(this.bomberPrefab);
        this.objectsGroup.node.addChild(bettle);
        let offset = new Vec2(item.offset.x, item.offset.y);
        let tilesPos = this.getTiledPos(offset);
        let worldPos = this.mainLayer.getPositionAt(tilesPos);

        bettle.setWorldPosition(Map.offsetX + worldPos.x, Map.offsetY + worldPos.y, 0);

        let compBettle = bettle.getComponent(Bettle);
        //console.log("generateBettle tiledPos:", tilesPos);
        //console.log("generateBettle worldPos:", worldPos);
        compBettle.init(tilesPos, this.mapSize, this.tileSize, this.mainLayer, this.woodLayer);
        let index = this.findNullBettle();
        if (-1 == index) {
            this.compBettle.push(compBettle);
        }
        else {
            this.compBettle[index] = compBettle;
        }
    }

    loadMap() {
        this.mapSize = this.map.getMapSize();
        this.tileSize = this.map.getTileSize();
        let objects = this.objectsGroup.getObjects();
        objects.forEach(item => {
            switch (item.properties["type"]) {
                case 0:
                    {
                        this.generatePlayer(item);
                    }
                    break;
                case 1:
                    {
                        this.generateBettle(item);
                    }
                    break;
                default:
                    break;
            }
        });

        this.compBettle.forEach(item => {
            item.setPlayer(this.compPlayer);
        });
    }

    effects() {
        this.woodLayer.node.on("onFinishBomb", (index: number) => {
            if (-1 == index)
                return;

            let bombComp = this.compPlayer._bomb[index].getComponent(Bomb);
            if (null == bombComp)
                return;

            if (this.woodLayer.getTileGIDAt(bombComp._tiledPosX, bombComp._tiledPosY + 1)) {
                this.woodLayer.setTileGIDAt(0, bombComp._tiledPosX, bombComp._tiledPosY + 1);
            }

            if (this.woodLayer.getTileGIDAt(bombComp._tiledPosX, bombComp._tiledPosY - 1)) {
                this.woodLayer.setTileGIDAt(0, bombComp._tiledPosX, bombComp._tiledPosY - 1);
            }

            if (this.woodLayer.getTileGIDAt(bombComp._tiledPosX + 1, bombComp._tiledPosY)) {
                this.woodLayer.setTileGIDAt(0, bombComp._tiledPosX + 1, bombComp._tiledPosY);
            }

            if (this.woodLayer.getTileGIDAt(bombComp._tiledPosX - 1, bombComp._tiledPosY)) {
                this.woodLayer.setTileGIDAt(0, bombComp._tiledPosX - 1, bombComp._tiledPosY);
            }

            this.woodLayer.removeUserNode(this.compPlayer._bomb[index]);
            this.compPlayer._bomb[index].removeFromParent();
            this.compPlayer._bomb[index].destroy();
            this.compPlayer._bomb[index] = null;
            this.woodLayer.markForUpdateRenderData();
        });

        this.woodLayer.node.on("onFinishBombE1", (index: number) => {
            if (-1 == index)
                return;

            let bombComp = this.compPlayer._bombEffects[index].getComponent(Bombe1);
            if (null == bombComp)
                return;

            for (let i = 0; i < this.compBettle.length; ++i) {
                if (bombComp.blash(this.compBettle[i])) {
                    this.compBettle[i].beKilled();
                }
            }

            this.woodLayer.removeUserNode(this.compPlayer._bombEffects[index]);
            this.compPlayer._bombEffects[index].removeFromParent();
            this.compPlayer._bombEffects[index].destroy();
            this.compPlayer._bombEffects[index] = null;
            this.woodLayer.markForUpdateRenderData();
        });
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_V:
                {
                }
                break;
            default:
                break;
        }
    }

    start() {
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    update(deltaTime: number) {
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
}


