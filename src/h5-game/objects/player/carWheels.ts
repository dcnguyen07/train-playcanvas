import { Entity, Vec3 } from "playcanvas";
import { Util } from "../../../template/helpers/util";

export class CarWheels extends Entity {

  FR: Entity;
  FL: Entity;
  BR: Entity;
  BL: Entity;

  constructor() {
    super();
    this._initCarWheels();
  }

  private _initCarWheels() {
    this.FL = new Entity();
    this.FL.setLocalPosition(-0.412, 0.176, -0.471);
    this.FL.addComponent("collision", {
      type   : "sphere",
      radius : 0.2,
    });
    this.addChild(this.FL);

    this.BL = new Entity();
    this.BL.setLocalPosition(-0.412, 0.176, 0.49);
    this.BL.addComponent("collision", {
      type   : "sphere",
      radius : 0.2,
    });
    this.addChild(this.BL);

    this.BR = new Entity();
    this.BR.setLocalPosition(0.383, 0.176, 0.49);
    this.BR.addComponent("collision", {
      type   : "sphere",
      radius : 0.2,
    });
    this.addChild(this.BR);

    this.FR = new Entity();
    this.FR.setLocalPosition(0.383, 0.176, -0.461);
    this.FR.addComponent("collision", {
      type   : "sphere",
      radius : 0.2,
    });
    this.addChild(this.FR);
  }

  public changeWheelsData(data: any) {
    this.enabled = false;
    this.FL.setLocalPosition(Util._arrayToVec3(data.FL.position));
    this.FR.setLocalPosition(Util._arrayToVec3(data.FR.position));
    this.BL.setLocalPosition(Util._arrayToVec3(data.BL.position));
    this.BR.setLocalPosition(Util._arrayToVec3(data.BR.position));
    this.enabled = true;
  }
}
