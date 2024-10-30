import { ScriptType, Vec3, math } from "playcanvas";
import { LevelManager } from "../../level/levelManager";
import { Player } from "../../objects/player/player";

export class LevelProgress extends ScriptType {
  public static override get scriptName() {
    return "levelProgress";
  }

  private _player: Player = null;
  private _startPoint: Vec3 = Vec3.ZERO;
  private _endPoint: Vec3 = Vec3.ZERO;

  private _distance: number = 0;

  override update(dt: number) {
    if (this._player === null) {
      return;
    }
    if (!this._player.controller.isRunning || this._player.controller.isDied) {
      return;
    }
    let playerPos = this._player.getPosition();
    let distance = playerPos.distance(this._startPoint);
    let progress = (distance / this._distance) * 100;
    progress = math.clamp(progress, 0, 100);
    this.entity.fire(LevelManager.Event.ProgressUpdated, progress);
  }

  public setPlayer(player: Player) {
    this._player = player;
  }

  public setPoints(startPoint: Vec3, endPoint: Vec3) {
    this._startPoint = startPoint;
    this._endPoint = endPoint;
    this._distance = startPoint.distance(endPoint);
  }
}

