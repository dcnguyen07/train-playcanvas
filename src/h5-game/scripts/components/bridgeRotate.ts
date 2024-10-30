import { ScriptType, Entity, Vec3, Quat } from "playcanvas";

export class BridgeRotate extends ScriptType {
  static override get scriptName() {
    return "bridgeRotate";
  }

  children: Entity[] = [];
  angle: number = 0;
  speed: number = 0;
  delayStart: number = 0;
  delayRevert: number = 0;

  private _curTime = 0;
  private _curAngle = 0;

  private _isRevert = false;
  private _isDelaying = false;
  private _delayTime = 0;
  private _originalRot: Vec3[] = [];


  override initialize() {
    this._isDelaying = true;
    this._isRevert = false;
    this._delayTime = this.delayStart;
    this.children.forEach((child) => {
      let curEuler = child.getEulerAngles();
      this._originalRot.push(curEuler.clone());
    });
  }

  override update(dt: number) {
    this._curTime += dt;
    if (this._isDelaying) {
      if (this._curTime >= this._delayTime) {
        this._isDelaying = false;
      }
    }
    else {
      if (this._isRevert) {
        this._curAngle -= this.speed * dt;
        if (this._curAngle <= 0) {
          this._curAngle = 0;
          this._isRevert = false;
          this._isDelaying = true;
          this._delayTime = this.delayStart;
          this._curTime = 0;
        }
      }
      else {
        this._curAngle += this.speed * dt;
        if (this._curAngle >= this.angle) {
          this._curAngle = this.angle;
          this._isRevert = true;
          this._isDelaying = true;
          this._curTime = 0;
          this._delayTime = this.delayRevert;
        }
      }
      this.children.forEach((child, index) => {
        let curEuler = this._originalRot[index].clone();
        curEuler.x += this._curAngle;
        let rotate = new Quat();
        let newQuat = rotate.clone().setFromEulerAngles(curEuler, curEuler.y, curEuler.z);
        child.setRotation(newQuat);
        // @ts-ignore
        child.rigidbody.syncEntityToBody();
      });
    }
  }
}
