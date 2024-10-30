import { Entity } from "playcanvas";
import InputHandler from "../../scripts/inputs/inputHandler";
import { Time } from "../../../template/systems/time/time";

export default class GamePlayManager extends Entity {

  public static Event = {
    Pause  : "gamePlayManager:pause",
    Resume : "gamePlayManager:resume",
  };

  private static _instance: GamePlayManager;
  public static get instance(): GamePlayManager {
    if (!this._instance) {
      this._instance = new GamePlayManager();
    }
    return this._instance;
  }

  public inputHandler: InputHandler = null;
  public isPause = false;

  constructor() {
    super("gamePlayManager");
  }

  enableInput() {
    this.inputHandler.enabled = true;
  }

  disableInput() {
    this.inputHandler.enabled = false;
  }

  public pause() {
    Time.gamePlayScale = 0;
    this.isPause = true;
    GamePlayManager.instance.fire(GamePlayManager.Event.Pause);
  }

  public resume() {
    Time.gamePlayScale = 1;
    this.isPause = false;
    GamePlayManager.instance.fire(GamePlayManager.Event.Resume);
  }
}
