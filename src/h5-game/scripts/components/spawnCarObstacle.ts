import { ScriptType, Entity } from "playcanvas";
import { GameConstant } from "../../../gameConstant";

export class SpawnCarObstacle extends ScriptType {

  static override get scriptName() {
    return "spawnCarObstacle";
  }

  modelEntity = Entity;
  pointCarObstacles : any = null;

  private _time = 0;
  private _duration = GameConstant.DURATION_SPAWN_CAR_OBSTACLE;
  private isStarted = false;

  override initialize() {
    this._time = 0;
    this._duration = GameConstant.DURATION_SPAWN_CAR_OBSTACLE;
    this.isStarted = true;
  }

  start() {
    this.isStarted = true;
  }

  stop() {
    this.isStarted = false;
  }

  override update(dt : number) {
    if (!this.isStarted) {
      return;
    }
    this._time += dt;
    if (this._time >= this._duration) {
      this.pointCarObstacles.forEach((point : Entity) => {
        let startPoint = point.find((child) => child.name === "startPoint");
        let endPoint = point.find((child) => child.name === "endPoint");
        // @ts-ignore
        this.modelEntity.spawnCar(startPoint[0].getLocalPosition(), endPoint[0].getLocalPosition(), startPoint[0].getLocalEulerAngles());
      });
      this._time = 0;
    }
  }
}
