// @ts-nocheck
import { ScriptType, math, Vec3, Entity, Mat4, Quat, Color } from "playcanvas";
import { GameConstant } from "../../../gameConstant";
import { Util } from "../../../template/helpers/util";
import { SoundManager } from "../../../template/soundManager";
import { Player } from "./player";

export class PlayerController extends ScriptType {

  public static override get scriptName() {
    return "playerController";
  }

  speed : number = 1;
  acceleration : number = 0.5;
  targetRotationY : number = 0;
  modelEntity : any = null;
  grounded : boolean = false;
  hasChangeDirection : boolean = false;
  isRunning : boolean = false;
  isDied : boolean = false;
  trainSoundObjets : any[] = [];
  isPlaySound : boolean = false;

  private _hasControl : boolean = false;
  private _speed = 0;
  public _currentRotationY: Vec3 = new Vec3();
  private _rotationSpeed = 5;
  private _curRotationSpeed = 0;
  private _minAngle = 0.1;
  private _angularVelocitySpeed = 30;

  private _path : Entity[] = [];
  private _pathIndex = 0;

  private _btWorldTransform : Ammo.btTransform;
  private _btWRotation : Ammo.btQuaternion;

  private _distancePassed: number = 0;
  private _checkPoints : Entity[] = [];
  public _checkPointIndex : number = 0;
  currentCheckPoint : Entity;

  override initialize(): void {
    this._hasControl = false;
    this._btWorldTransform = new Ammo.btTransform();
    this._btWRotation = new Ammo.btQuaternion();
    this.isPlaySound = false;
  }

  override postUpdate(dt: number) : void {
    this._checkGrounded(dt);
    if (dt === 0 || !this.grounded || this._path.length === 0 || this.isDied || !this.isRunning) {
      return;
    }
    if (this._hasControl) {
      this._curRotationSpeed = this._rotationSpeed;
      this._speed = math.lerp(this._speed, this.speed, dt * this.acceleration);
    }
    else {
      this._speed = 0;
      this._curRotationSpeed = 0;
    }

    this._distancePassed += this._speed;
    this.entity.fire(Player.Events.DistancePassed, Math.round(this._distancePassed));

    if (this.hasChangeDirection) {
      this.hasChangeDirection = false;
      if (Math.abs(this.targetRotationY - this.modelEntity.getEulerAngles().clone().y) > this._minAngle) {
        this._applyRotate(this.targetRotationY);
      }

      this._lookAtPos = this._path[this._pathIndex].getPosition().clone();
      this.targetRotationY = this._path[this._pathIndex].getEulerAngles().y;

      if (this._pathIndex >= this._path.length - 1) {
        this._pathIndex = this._path.length - 1;
      }
      else {
        this._pathIndex++;
      }
    }
    if (Math.abs(this.targetRotationY - this.modelEntity.getEulerAngles().clone().y) > this._minAngle) {
      this._currentRotationY.y = math.lerp(this.modelEntity.getEulerAngles().clone().y, this.targetRotationY, dt * (this._curRotationSpeed + this.modelEntity.rigidbody.linearVelocity.length()));
      this._applyRotate(this._currentRotationY.y);
    }
    let direction = this._path[this._pathIndex].getPosition().clone().sub(this.modelEntity.getPosition().clone()).normalize();
    let force = direction.scale(this._speed);
    force.y = 0;
    this.modelEntity.rigidbody.applyForce(force);
    if (direction.y < 0) {
      direction.y = GameConstant.GRAVITY_Y;
    }
    else {
      direction.y = this.modelEntity.rigidbody.linearVelocity.y;
    }
    this.modelEntity.rigidbody.linearVelocity = direction;
    this._playSoundTrain();
    this.checkCollideCheckPoint();
  }

  private _applyRotate(rotate: number) : void {
    let curQua = new Quat();
    let euler = this.modelEntity.getEulerAngles().clone();
    euler.y = rotate;
    curQua.setFromEulerAngles(euler);
    this._btWRotation.setValue(curQua.x, curQua.y, curQua.z, curQua.w);
    this._btWorldTransform = this.entity.rigidbody.body.getWorldTransform();
    this._btWorldTransform.setRotation(this._btWRotation);
    this.entity.rigidbody.body.setWorldTransform(this._btWorldTransform);
    this.entity.setEulerAngles(euler);
  }

  onPointerDown() {
    if (GameConstant.DEBUG_ORBIT_CAMERA) {
      return;
    }
    this._hasControl = true;
  }

  onPointerUp() {
    if (GameConstant.DEBUG_ORBIT_CAMERA) {
      return;
    }
    if (this.isRunning && this.grounded) {
      this.modelEntity.rigidbody.linearVelocity = Vec3.ZERO;
    }
    this._hasControl = false;
  }

  changePath(path : Entity[]) {
    this._path = [];
    this._path = path;
    this._path.length > 1 ? this._pathIndex = 1 : this._pathIndex = 0;
  }

  changeCheckPoints(checkPoints : Entity[]) {
    this._checkPoints = [];
    this._checkPoints = checkPoints;
    this._checkPointIndex = 0;
  }

  resetRevive() {
    this._speed = 0;
    this._hasControl = false;
    this.isDied = false;
    this.isRunning = false;
    this.grounded = false;
  }

  reset() {
    this._speed = 0;
    this._hasControl = false;
    this._path = [];
    this._pathIndex = 0;
    this._distancePassed = 0;
    this.targetRotationY = 0;
    this.isDied = false;
    this.isRunning = false;
    this.grounded = false;
    this._checkPoints = [];
    this._checkPointIndex = 0;
  }

  private checkCollideCheckPoint() {
    if (this._checkPoints.length === 0) {
      return;
    }
    if (this._checkPointIndex >= this._checkPoints.length) {
      return;
    }
    let curPos = this.modelEntity.getPosition();
    let checkPointPos = this._checkPoints[this._checkPointIndex].getPosition();
    let distance = curPos.distance(checkPointPos);
    if (distance < 1) {
      this.currentCheckPoint = this._checkPoints[this._checkPointIndex];
      this._checkPointIndex++;
    }
  }

  private _checkGrounded(dt: number) {
    if (this.isDied) {
      return;
    }
    let curPos = this.modelEntity.getPosition();
    let up = this.modelEntity.up;
    let rayStart = curPos.clone().add(up.clone().scale(1));
    let rayEnd = curPos.clone().add(up.clone().scale(-0.4));

    let raycastResult = this.app.systems.rigidbody.raycastFirst(rayStart, rayEnd, {
      filterTags: ["ground"],
    });

    if (raycastResult) {
      if (GameConstant.DEBUG_AMMO) {
        this.app.drawLine(rayStart, rayEnd, Color.GREEN, false);
      }
      this.grounded = true;
    }
    else {
      if (GameConstant.DEBUG_AMMO) {
        this.app.drawLine(rayStart, rayEnd, Color.RED, false);
      }

      this.grounded = false;
    }

    let angularVelocity = this.modelEntity.rigidbody.angularVelocity;
    this.modelEntity.rigidbody.angularVelocity = angularVelocity.lerp(angularVelocity, Vec3.ZERO, this._angularVelocitySpeed * dt);
  }

  _playSoundTrain() {
    if (!this.trainSoundObjets) {
      SoundManager.setVolume("sfx_train", 0);
      return;
    }
    this.trainSoundObjets.forEach((trainSoundObjet) => {
      if (!this.isPlaySound) {
        this.isPlaySound = true;
        SoundManager.playSoundByDistance("sfx_train", false, this.entity, trainSoundObjet);
        SoundManager.setVolume("sfx_train", 0);

      }

      let distanceWithTrainObject = this.entity.getLocalPosition().distance(trainSoundObjet.getPosition()) / 1.3;
      let volume = 1 - distanceWithTrainObject / 10;
      if (volume >= 0 && volume <= 1) {
        SoundManager.setVolume("sfx_train", volume);
      }
    });
  }
}
