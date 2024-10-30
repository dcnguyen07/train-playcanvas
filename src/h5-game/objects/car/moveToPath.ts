// @ts-nocheck
import { ScriptType, Vec3, Quat } from "playcanvas";

export class MoveToPath extends ScriptType {
  static readonly Events = {
    OnMoveToPathEnd: "onMoveToPathEnd",
  };
  private _btWorldTransform : Ammo.btTransform;
  private _btWRotation : Ammo.btQuaternion;
  static override get scriptName() {
    return "moveToPath";
  }

  speed : number = 0;
  target : Vec3 = new Vec3();
  startPoint : Vec3 = new Vec3(0, 0, 0);
  endPoint : Vec3 = new Vec3(0, 0, 0);
  pointObstacle : any = null;

  forward : Vec3 = new Vec3();
  _isStarted : boolean = false;

  override initialize() {
    this.speed = 5;
    this.target = new Vec3();
    this._btWorldTransform = new Ammo.btTransform();
    this._btWRotation = new Ammo.btQuaternion();
  }

  public start() {
    this._isStarted = true;
  }

  public stop() {
    this._isStarted = false;
  }

  override update() {
    if (!this._isStarted) {
      return;
    }
    this.forward.copy(this.entity.forward);
    this.entity.rigidbody.linearVelocity = this.forward.scale(this.speed);
    let distance = this.entity.getLocalPosition().distance(this.endPoint);
    if (this.pointObstacle) {
      this.forward.copy(this.pointObstacle.forward);
      this.entity.rigidbody.linearVelocity = this.forward.scale(this.speed);
      this.entity.setRotation(this.pointObstacle.getRotation());
      this._applyRotate(this.pointObstacle.getEulerAngles().y);
    }
    if (distance < 2) {
      this.entity.rigidbody.linearVelocity = new Vec3();
      this.entity.rigidbody.angularVelocity = new Vec3();
      this.entity.fire(MoveToPath.Events.OnMoveToPathEnd);
    }
  }

  private _applyRotate(rotate: number) : void {
    let curQua = new Quat();
    let euler = this.entity.getEulerAngles().clone();
    euler.y = rotate;
    curQua.setFromEulerAngles(euler);
    this._btWRotation.setValue(curQua.x, curQua.y, curQua.z, curQua.w);
    this._btWorldTransform = this.entity.rigidbody.body.getWorldTransform();
    this._btWorldTransform.setRotation(this._btWRotation);
    this.entity.rigidbody.body.setWorldTransform(this._btWorldTransform);
    this.entity.setEulerAngles(euler);
  }
}
