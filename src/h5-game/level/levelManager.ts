import { Entity, programlib } from "playcanvas";
import { AssetManager } from "../../template/assetManager";
import { Util } from "../../template/helpers/util";
import { UserData } from "../data/userData";
import { Player } from "../objects/player/player";
import { LevelProgress } from "../scripts/components/levelProgress";
import { LevelData, LevelController } from "./levelController";

export class LevelManager extends Entity {

  private static _instance: LevelManager;
  static get instance(): LevelManager {
    if (!this._instance) {
      this._instance = new LevelManager();
    }
    return this._instance;
  }

  public static readonly Event = {
    PreLoadLevel    : "levelManager:preLoadLevel",
    ProgressUpdated : "levelManager:progressUpdated",
    LevelLoaded     : "levelManager:levelLoaded",
  };
  _levelData: LevelData[];
  _levelProgress: LevelProgress;

  currentLevel: LevelController | undefined;

  constructor() {
    super("levelManager");
    this._loadLevelData();
    this._initLevelProgress();
  }

  private _loadLevelData() {
    let data = AssetManager.find("levelData.json");
    if (!data) {
      console.error("Level data not found");
      return;
    }
    this._levelData = data.resources as LevelData[];
  }

  private _initLevelProgress() {
    this._levelProgress = this.addScript(LevelProgress);
  }

  public loadNextLevel() {
    this.fire(LevelManager.Event.PreLoadLevel);
    if (this.currentLevel) {
      this.currentLevel.destroy();
    }
    let index = UserData.currentLevel - 1;
    if (index < 0 || index >= this._levelData.length) {
      index = Util.randomInt(0, this._levelData.length - 1);
    }
    let levelData = this._levelData[index];
    let level = new LevelController(levelData);
    this.currentLevel = level;
    level.once(LevelController.Event.Loaded, this._onLevelLoaded, this);
    this.addChild(level);
  }

  public loadLevel(index: number) {
    // this.fire(LevelManager.Event.PreLoadLevel);
    if (this.currentLevel) {
      this.currentLevel.destroy();
    }
    let levelData = this._levelData[index];
    let level = new LevelController(levelData);
    this.currentLevel = level;
    this.addChild(level);
  }

  private _onLevelLoaded() {
    let startPoint = this.currentLevel.startPoint.getPosition().clone();
    let endPoint = this.currentLevel.endPoint.getPosition().clone();
    this._levelProgress.setPoints(startPoint, endPoint);
    this.fire(LevelManager.Event.LevelLoaded);
  }

  public setPlayer(player: Player) {
    this._levelProgress.setPlayer(player);
  }
}
