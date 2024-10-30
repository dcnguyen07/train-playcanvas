import { Vec3, ScriptType, Entity, Vec4 } from "playcanvas";
import { Game } from "../../../game";
import { GameConstant } from "../../../gameConstant";

export class CameraFollower extends ScriptType {

  public static override get scriptName() {
    return "cameraFollower";
  }

  target: Entity = null;
  offset: Vec3 = new Vec3(0, 0, 0);
  lerpSpeed : number = 0.1;

  private tmpPos = new Vec3();

  override initialize(): void {

  }

  resize() {
    if (Game.isLandscape) {
      this.offset = new Vec3(GameConstant.CAMERA_X_LANDSCAPE, GameConstant.CAMERA_Y_LANDSCAPE, GameConstant.CAMERA_Z_LANDSCAPE);
    }
    else {
      this.offset = new Vec3(GameConstant.CAMERA_X, GameConstant.CAMERA_Y, GameConstant.CAMERA_Z);
    }
  }

  override postUpdate(dt: number): void {
    if (GameConstant.DEBUG_ORBIT_CAMERA) {
      return;
    }
    if (this.target) {
      this.tmpPos = this.target.getPosition();
      let targetPos = this.tmpPos.add(this.offset);
      let currentPos = this.entity.getPosition();
      currentPos.lerp(currentPos, targetPos, this.lerpSpeed * dt);
      this.entity.setPosition(currentPos);
    }
  }
}
