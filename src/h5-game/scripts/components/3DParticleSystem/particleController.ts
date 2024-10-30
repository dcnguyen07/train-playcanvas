import { Curve, ScriptType, StandardMaterial, Vec3 } from "playcanvas";
import { Spawner } from "../spawner";
import { Time } from "../../../../template/systems/time/time";

export type ParticleConfig = {
  material?: StandardMaterial;
  alignToMotion: boolean;
  lifeTime: [number, number];
  startAngle: Vec3;
  startAngle2?: Vec3;
  startSize: Vec3;
  startSize2?: Vec3;
  angularVelocity: Vec3;
  angularVelocity2?: Vec3;
  linearDampen: number;
  useShapeVelocity?: boolean;
  shapeSpeed?: Curve;
  gravity: number;
  velocity: Vec3;
  velocity2?: Vec3;
  alphaGraph?: Curve;
  scaleGraph?: Curve;
  emitterShape: EmitterShape;
  boxEmitterExtents?: Vec3;
  sphereEmitterRadius?: number;
  sphereInnerRadius?: number;
  circleEmitterRadius?: number;
  circleInnerRadius?: number;
}

export enum EmitterShape {
  Box = "box",
  Sphere = "sphere",
  Circle = "circle",
}


export default class ParticleController extends ScriptType {
  static override get scriptName() {
    return "particleController";
  }

  public config : ParticleConfig = null;
  private _tmpPosition: Vec3;
  private _tmpEuler: Vec3;
  private _tmpSize: Vec3 = new Vec3();
  private _angularVelocity: Vec3;
  private _velocity: Vec3;
  private _startSize: Vec3;
  private _isPlay = false;
  private _lifeTime = 0;
  private _curTime = 0;
  private _directionVector : Vec3;

  override initialize() {
    if (this.config.velocity2 === undefined) {
      this.config.velocity2 = this.config.velocity;
    }

    if (this.config.startAngle2 === undefined) {
      this.config.startAngle2 = this.config.startAngle;
    }

    if (this.config.startSize2 === undefined) {
      this.config.startSize2 = this.config.startSize;
    }

    if (this.config.angularVelocity2 === undefined) {
      this.config.angularVelocity2 = this.config.angularVelocity;
    }

    if (this.config.sphereInnerRadius === undefined) {
      this.config.sphereInnerRadius = 0;
    }

    if (this.config.circleInnerRadius === undefined) {
      this.config.circleInnerRadius = 0;
    }
  }

  override update() {
    if (this._isPlay) {
      this._curTime += Time.dt;
      if (this._curTime > this._lifeTime) {
        this._isPlay = false;
        this.entity.fire(Spawner.Event.Despawn, this.entity);
        return;
      }

      if (this.config.useShapeVelocity) {
        this._directionVector = this._tmpPosition.clone().normalize();
        this._velocity.set(
          this._directionVector.x * this.config.shapeSpeed.value(this._curTime / this._lifeTime),
          this._directionVector.y * this.config.shapeSpeed.value(this._curTime / this._lifeTime),
          this._directionVector.z * this.config.shapeSpeed.value(this._curTime / this._lifeTime)
        );
      }
      this._tmpPosition.addScaled(this._velocity, Time.dt);
      this.entity.setLocalPosition(this._tmpPosition);
      this._velocity.mulScalar(Math.max(1 - this.config.linearDampen * Time.dt, 0));
      this._velocity.y -= this.config.gravity * Time.dt;

      this._tmpEuler.addScaled(this._angularVelocity, Time.dt);
      this.entity.setLocalEulerAngles(this._tmpEuler);

      this.rotateWithVelocity();

      if (this.config.material && this.config.alphaGraph) {
        this.config.material.opacity = this.config.alphaGraph.value(this._curTime / this._lifeTime);
        this.config.material.update();
      }

      if (this.config.scaleGraph) {
        this._tmpSize.set(
          this._startSize.x * this.config.scaleGraph.value(this._curTime / this._lifeTime),
          this._startSize.y * this.config.scaleGraph.value(this._curTime / this._lifeTime),
          this._startSize.z * this.config.scaleGraph.value(this._curTime / this._lifeTime)
        );
        this.entity.setLocalScale(this._tmpSize);
      }
    }
  }

  reset() {
    this._tmpEuler = this.getSpawnAngle();
    this._tmpPosition = this.getSpawnPosition();
    this._velocity = this.getSpawnVelocity();
    this.rotateWithVelocity();
    this.entity.setLocalEulerAngles(this._tmpEuler);
    this._angularVelocity = this.getAngularVelocity();
    this._lifeTime = this.config.lifeTime[0] + (this.config.lifeTime[1] - this.config.lifeTime[0]) * Math.random();
    this._startSize = this.getStartSize();
    this.entity.setLocalScale(this._startSize);
    this._curTime = 0;
    this._isPlay = true;
  }

  getSpawnPosition() : Vec3 {
    if (this.config.emitterShape === EmitterShape.Box) {
      return new Vec3(
        this.config.boxEmitterExtents.x * (Math.random() - 0.5),
        this.config.boxEmitterExtents.y * (Math.random() - 0.5),
        this.config.boxEmitterExtents.z * (Math.random() - 0.5)
      );
    }

    if (this.config.emitterShape === EmitterShape.Sphere) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const radius = this.config.sphereInnerRadius + Math.random() * (this.config.sphereEmitterRadius - this.config.sphereInnerRadius);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      return new Vec3(x, y, z);
    }

    if (this.config.emitterShape === EmitterShape.Circle) {
      const theta = Math.random() * Math.PI * 2;
      const radius = this.config.circleInnerRadius + Math.random() * (this.config.circleEmitterRadius - this.config.circleInnerRadius);
      const x = radius * Math.cos(theta);
      const z = radius * Math.sin(theta);
      return new Vec3(x, 0, z);
    }

    return null;
  }

  getSpawnAngle() : Vec3 {
    return new Vec3(
      this.config.startAngle.x + (this.config.startAngle2.x - this.config.startAngle.x) * Math.random(),
      this.config.startAngle.y + (this.config.startAngle2.y - this.config.startAngle.y) * Math.random(),
      this.config.startAngle.z + (this.config.startAngle2.z - this.config.startAngle.z) * Math.random()
    );
  }

  getSpawnVelocity() : Vec3 {
    if (this.config.useShapeVelocity) {
      this._directionVector = this._tmpPosition.clone().normalize();
      return new Vec3(
        this._directionVector.x * this.config.shapeSpeed.value(0),
        this._directionVector.y * this.config.shapeSpeed.value(0),
        this._directionVector.z * this.config.shapeSpeed.value(0)
      );
    }
    else {
      return new Vec3(
        this.config.velocity.x + (this.config.velocity2.x - this.config.velocity.x) * Math.random(),
        this.config.velocity.y + (this.config.velocity2.y - this.config.velocity.y) * Math.random(),
        this.config.velocity.z + (this.config.velocity2.z - this.config.velocity.z) * Math.random()
      );
    }
  }

  getStartSize() : Vec3 {
    return new Vec3(
      this.config.startSize.x + (this.config.startSize2.x - this.config.startSize.x) * Math.random(),
      this.config.startSize.y + (this.config.startSize2.y - this.config.startSize.y) * Math.random(),
      this.config.startSize.z + (this.config.startSize2.z - this.config.startSize.z) * Math.random()
    );
  }

  getAngularVelocity() : Vec3 {
    return new Vec3(
      this.config.angularVelocity.x + (this.config.angularVelocity2.x - this.config.angularVelocity.x) * Math.random(),
      this.config.angularVelocity.y + (this.config.angularVelocity2.y - this.config.angularVelocity.y) * Math.random(),
      this.config.angularVelocity.z + (this.config.angularVelocity2.z - this.config.angularVelocity.z) * Math.random()
    );
  }

  rotateWithVelocity() {
    if (this.config.alignToMotion) {
      let direction = Math.atan(this._velocity.z / this._velocity.x);
      let direction2 = Math.atan(this._velocity.y / this._velocity.x);
      if (this._velocity.x > 0) {
        direction += Math.PI;
      }
      this._tmpEuler.x = 0;
      this._tmpEuler.y = direction * -180 / Math.PI;
      this._tmpEuler.z = direction2 * 180 / Math.PI;
    }
  }
}
