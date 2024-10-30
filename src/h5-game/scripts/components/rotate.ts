import { Vec3, ScriptType } from "playcanvas";

export class Rotate extends ScriptType {

  static override get scriptName() {
    return "rotate";
  }

  speed = new Vec3();

  private _tempRot!: Vec3;

  override initialize() {
    this._tempRot = new Vec3();
  }

  override update(dt: number) {
    this.entity.rotateLocal(
      this.speed.x * dt,
      this.speed.y * dt,
      this.speed.z * dt,
    );
  }
}
