import { Entity } from "playcanvas";
import { Game } from "../../game";
import { GameConstant } from "../../gameConstant";
import { Tween } from "../../template/systems/tween/tween";
import { Tweener } from "../../template/systems/tween/tweener";
import { Car } from "../objects/car/car";
import { CarManager } from "../objects/car/carManager";
import JsonEntity from "../objects/jsonEntity";
import { BridgeObstacle } from "../objects/obstacles/bridgeObstacle";
import { CoinObstacle } from "../objects/obstacles/coinObstacle";
import { TrainSoundObj } from "../objects/obstacles/trainSoundObj";
import { TrainTrafficLight } from "../objects/obstacles/trainTrafficLight";
import { Player } from "../objects/player/player";
import { ResourceEntity } from "../objects/resourceEntity";
import ResourceHelper from "../objects/ResourceHelper";
import { SpawnCarObstacle } from "../scripts/components/spawnCarObstacle";
import { SpawnTrainObstacle } from "../scripts/components/spawnTrainObstacle";

export type LevelData = {
  name: string,
  mapData: any
}

export class LevelController extends Entity {
  static readonly objectMapping: { [key: string]: new(...[]: any[]) => ResourceEntity } = {
    bridge        : BridgeObstacle,
    coin          : CoinObstacle,
    trafficLight  : TrainTrafficLight,
    trainSoundObj : TrainSoundObj,
  };

  public static readonly Event = {
    Loaded                    : "level:loaded",
    Start                     : "level:start",
    Complete                  : "level:complete",
    PlayerCollideWithObstacle : "level:playerCollideWithObstacle",
  };

  _data: LevelData;
  _map: JsonEntity;
  _startPoint: Entity;
  _endPoint: Entity;

  _path: Entity[] = [];
  _pathCarObstacles: Entity[] = [];
  pointCarObstacles: Entity[] = [];
  pointTrainObstacles: Entity[] = [];
  carManager: CarManager;
  tweenSpawnCars: Tweener[] = [];
  tweenSpawnTrains: Tweener[] = [];
  trainSoundObjs: TrainSoundObj[] = [];
  checkPoints: Entity[] = [];
  private spawnTrainEntity: Entity;
  private spawnCarEntity: Entity;
  private spawnTrainScript: SpawnTrainObstacle;
  private spawnCarScript: SpawnCarObstacle;

  constructor(data: LevelData) {
    super("level");
    this._data = data;
    this._addMap();
  }

  override destroy(): void {
    let children = [...this.children];
    children.forEach((child) => {
      this.removeChild(child);
      child.destroy();
    });
    this.resetTween();
    super.destroy();
  }

  private async _addMap() {
    let mapData = await ResourceHelper.loadJson(this._data.mapData);
    this._map = new JsonEntity(mapData.resource, false, LevelController.objectMapping, { autoLoad: false });
    this.addChild(this._map);
    if (this._map.loaded) {
      this._onMapLoaded();
    }
    else {
      this._map.once(JsonEntity.Event.Loaded, this._onMapLoaded, this);
    }
    this._map.load();
  }

  private _onMapLoaded() {
    this._findStartPoint();
    this._findEndPoint();
    this._findPath();
    this._findPointCarObstacle();
    this._findPointTrainObstacle();
    this._findTrainSoundObj();
    this._initCarManager();
    this._findCheckPoint();
    this.fire(LevelController.Event.Loaded);
  }

  private _initCarManager() {
    this.carManager = new CarManager();
    this.addChild(this.carManager);
    this.handleSpawnCar();
    this.handleSpawnTrain();
    this.carManager.on(Car.Events.onCollide, (player: Player) => {
      this.tweenSpawnCars.forEach((tween) => tween.stop());
      this.tweenSpawnTrains.forEach((tween) => tween.stop());
      this.carManager.stopAllCarObstacle();
      this.fire(LevelController.Event.PlayerCollideWithObstacle, player);
    });

    Game.app.on("pause", () => {
      this.tweenSpawnCars.forEach((tween) => tween.pause());
      this.tweenSpawnTrains.forEach((tween) => tween.pause());
    });

    Game.app.on("resume", () => {
      this.tweenSpawnCars.forEach((tween) => tween.resume());
      this.tweenSpawnTrains.forEach((tween) => tween.resume());
    });
  }

  private handleSpawnCar() {
    let pointCarObstacles = this.pointCarObstacle;
    this.spawnCarEntity = new Entity();
    this.addChild(this.spawnCarEntity);
    this.spawnCarScript = this.spawnCarEntity.addScript(SpawnCarObstacle, {
      attributes: {
        modelEntity       : this.carManager,
        pointCarObstacles : pointCarObstacles,
      },
    });
  }

  private handleSpawnTrain() {
    let pointTrainObstacles = this.pointTrainObstacle;
    this.spawnTrainEntity = new Entity();
    this.addChild(this.spawnTrainEntity);
    this.spawnTrainScript = this.spawnTrainEntity.addScript(SpawnTrainObstacle, {
      attributes: {
        modelEntity         : this.carManager,
        pointTrainObstacles : pointTrainObstacles,
      },
    });
  }

  public pauseSpawnObstacle() {
    this.spawnCarScript.stop();
    this.spawnTrainScript.stop();
  }

  public resumeSpawnObstacle() {
    this.spawnCarScript.start();
    this.spawnTrainScript.start();
  }

  public resetTween() {
    this.tweenSpawnCars.forEach((tween) => tween.stop());
    this.tweenSpawnCars = [];
    this.tweenSpawnTrains.forEach((tween) => tween.stop());
    this.tweenSpawnTrains = [];
  }

  public resetAllCarObstacle() {
    this.carManager.stopAllCarObstacle();
    this.carManager.resetAllCarObstacle();
  }

  private _findStartPoint() {
    let points = this._map.findByTag(GameConstant.START_POINT_TAG);
    if (points.length <= 0) {
      console.error("No start point found in map");
      return;
    }
    this._startPoint = points[0] as Entity;
  }

  public get startPoint() {
    return this._startPoint;
  }

  private _findEndPoint() {
    let points = this._map.findByTag(GameConstant.FINISH_POINT_TAG);
    if (points.length <= 0) {
      console.error("No end point found in map");
      return;
    }
    this._endPoint = points[0] as Entity;
  }

  public get endPoint() {
    return this._endPoint;
  }

  private _findPointCarObstacle() {
    let points = this._map.findByTag("carObstacle");
    if (!points) {
      console.error("No start point found in map");
      return;
    }
    this.pointCarObstacles = points as Entity[];
  }

  public get pointCarObstacle() {
    return this.pointCarObstacles;
  }

  private _findPointTrainObstacle() {
    let points = this._map.findByTag("trainObstacle");
    if (!points) {
      console.error("No start point found in map");
      return;
    }
    this.pointTrainObstacles = points as Entity[];
  }

  public get pointTrainObstacle() {
    return this.pointTrainObstacles;
  }

  private _findTrainSoundObj() {
    let trainSoundObj = this._map.findByName("trainSoundObjects");
    if (!trainSoundObj) {
      return;
    }
    this.trainSoundObjs = trainSoundObj.children as TrainSoundObj[];
  }

  private _findPath() {
    let pathContainer = this.findByName("PathContainer");
    if (!pathContainer) {
      console.error("Path container not found");
      return;
    }
    if (pathContainer.children.length === 0) {
      console.error("No path found");
      return;
    }
    pathContainer.children.forEach((child) => {
      this._path.push(child as Entity);
    });
  }

  private _findCheckPoint() {
    let checkPoint = this.findByName("checkPoint");
    if (!checkPoint) {
      return;
    }
    this.checkPoints = checkPoint.children as Entity[];
  }

  public stopAllTweens() {
    this.tweenSpawnCars.forEach((tween) => tween.stop());
    this.tweenSpawnTrains.forEach((tween) => tween.stop());
  }

  public startAllTweens() {
    this.tweenSpawnCars.forEach((tween) => tween.start());
    this.tweenSpawnTrains.forEach((tween) => tween.start());
  }

  public getPath() {
    return this._path;
  }

  public getCheckPoints() {
    return this.checkPoints;
  }
}

