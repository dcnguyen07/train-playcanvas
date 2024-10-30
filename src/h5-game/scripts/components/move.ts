import { ScriptType, Vec3 } from "playcanvas";
import { Time } from "../../../template/systems/time/time";

export class Move extends ScriptType {
  static override get scriptName() {
    return "moveScript";
  }

  public velocity: Vec3 = new Vec3(0, 0, 0);

  private _velocity: Vec3;

  override initialize() {
    if (this.entity.rigidbody) {
      this.entity.rigidbody.linearVelocity = this.velocity;
    }
    this._velocity = this.velocity.clone();
  }

  override update() {
    if (this.entity.rigidbody) {
      this.entity.rigidbody.linearVelocity = this.velocity;
    }
    else {
      this._velocity.copy(this.velocity);
      this.entity.translate(this._velocity.scale(Time.dt));
    }
  }
}
