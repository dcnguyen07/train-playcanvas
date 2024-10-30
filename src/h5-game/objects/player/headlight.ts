import { Entity } from "playcanvas";
import ResourceHelper from "../ResourceHelper";

export class Headlight extends Entity {
  constructor() {
    super("headLight");
    this._initLight();
  }

  private async _initLight() {
    this.addComponent("model", {
      type: "plane",
    });
    this.setLocalEulerAngles(0, 90, 0);
    this.setLocalScale(2, 2, 2);
    let matHeadlight = await ResourceHelper.loadMaterial("mat_lightray");
    this.model.meshInstances[0].material = matHeadlight.resource;
  }
}
