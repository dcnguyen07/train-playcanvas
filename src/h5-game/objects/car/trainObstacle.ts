import { Vec3, Entity } from "playcanvas";
import ResourceHelper from "../ResourceHelper";
import { Car } from "./car";
import { MoveToPath } from "./moveToPath";

// @ts-ignore
export class TrainObstacle extends Car {
  override isInitialized: boolean = false;

  constructor() {
    super();
  }

  override async _initModel() {
    let modelAsset = await ResourceHelper.loadModel("model_train");
    let modelEntity = new Entity();
    modelEntity.addComponent("model", {
      type  : "asset",
      asset : modelAsset,
    });
    modelEntity.setLocalEulerAngles(0, 90, 0);
    this.addChild(modelEntity);

    this.addComponent("rigidbody", {
      type            : "dynamic",
      mass            : 100,
      restitution     : 0,
      friction        : 0,
      rollingFriction : 0,
      angularFactor   : new Vec3(0, 0, 0),
    });
    this.addComponent("collision", {
      type         : "box",
      halfExtents  : new Vec3(0.5, 0.5, 5),
      linearOffset : new Vec3(0, 1, 0),
    });

    this.moveToPath = this.addScript(MoveToPath, {
      attributes: {
        speed      : 20,
        startPoint : this.startPoint,
        endPoint   : this.endPoint,
      },
    });
    this.isInitialized = true;
    this.fire("loaded");
  }
}
