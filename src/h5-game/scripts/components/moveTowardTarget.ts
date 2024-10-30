import { Entity, ScriptType, Vec3 } from "playcanvas";
import { Time } from "../../../template/systems/time/time";

export default class MoveTowardTarget extends ScriptType {
  static override get scriptName() {
    return "MoveTowardTarget";
  }

  public static readonly Event = {
    OnReachTarget: "MoveTowardTarget:OnReachTarget",
  };

  private _target: Entity = null;
  private speed: number = 0;
  private _tmpTargetPosition = new Vec3();
  private _tmpPosition = new Vec3();
  private _tmpDirection = new Vec3();

  override initialize() {
  }

  override update() {
    this._tmpTargetPosition = this._target.getPosition();
    this._tmpPosition = this.entity.getPosition();
    let moveDistance = this.speed * Time.dt;
    let distance = this._tmpTargetPosition.distance(this._tmpPosition);
    if (distance < moveDistance) {
      this.entity.setPosition(this._tmpTargetPosition);
      this.fire(MoveTowardTarget.Event.OnReachTarget);
      return;
    }
    this._tmpDirection.sub2(this._tmpTargetPosition, this._tmpPosition).normalize();
    let newPosition = this._tmpPosition.add(this._tmpDirection.scale(moveDistance));
    this.entity.setPosition(newPosition);

    let targetPos = this._tmpTargetPosition;
    let direction = targetPos.clone().sub(this._tmpPosition);
    let angle = Math.atan2(direction.x, direction.z) * 180 / Math.PI;
    this.entity.setLocalEulerAngles(0, angle, 0);
  }

  setTarget(target: Entity) {
    this._target = target;
  }
}
