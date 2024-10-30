import { Entity, Vec3 } from "playcanvas";
import { GameConstant } from "../../../gameConstant";
import { AssetManager } from "../../../template/assetManager";
import { Util } from "../../../template/helpers/util";
import { Headlight } from "../player/headlight";
import ResourceHelper from "../ResourceHelper";
import { MoveToPath } from "./moveToPath";

export class Car extends Entity {
  static readonly Events = {
    onCollide: "onCollide",
  };
  moveToPath: MoveToPath;
  startPoint : Vec3 = new Vec3(0, 0, 0);
  endPoint : Vec3 = new Vec3(0, 0, 35);
  isInitialized: boolean = false;
  private modelEntity: Entity;
  constructor() {
    super("car");
    this.tags.add(GameConstant.CAR_OBSTACLE_TAG);
    this._initModel();
    this._initHeadlight();
    this.setLocalScale(1.2, 1.2, 1.2);
  }

  private async _initModel() {
    let modelAsset = await ResourceHelper.loadModel("model_car_obstacle_01");
    this.modelEntity = new Entity();
    this.addChild(this.modelEntity);
    this.modelEntity.addComponent("model", {
      type  : "asset",
      asset : modelAsset,
    });

    this.addComponent("rigidbody", {
      type            : "dynamic",
      mass            : 1,
      restitution     : 0,
      friction        : 1,
      rollingFriction : 1,
      angularFactor   : new Vec3(1, 1, 1),
      angularDamping  : 0,
      linearDamping   : 0,
    });

    this.addComponent("collision", {
      type         : "box",
      halfExtents  : new Vec3(0.5, 0.37, 1),
      linearOffset : new Vec3(0, 0.4, 0),
    });
    this.moveToPath = this.addScript(MoveToPath, {
      attributes: {
        speed      : 10,
        startPoint : this.startPoint,
        endPoint   : this.endPoint,
      },
    });
    this.isInitialized = true;
    this.fire("loaded");

    this.rigidbody.on("triggerenter", this._onCollisionStart.bind(this));
    this.rigidbody.on("collisionstart", this._onCollisionStart.bind(this));
    this.randomColor();
  }

  private async _initHeadlight() {
    let headlightLeft = new Headlight();
    headlightLeft.setLocalPosition(-0.25, 0.25, -1.5);
    this.addChild(headlightLeft);

    let headlightRight = new Headlight();
    headlightRight.setLocalPosition(0.25, 0.25, -1.5);

    this.addChild(headlightRight);
  }

  async changeModel(modelName: string) {
    let modelAsset = await ResourceHelper.loadModel(modelName);
    if (!modelAsset) {
      console.error("Model not found");
      return;
    }
    this.modelEntity.model.asset = modelAsset;
  }

  private _onCollisionStart(other: any) {
    if (other.name === GameConstant.POINT_OBSTACLE_TAG) {
      this.moveToPath.pointObstacle = other;
    }
  }

  public randomColor() {
    let index = Util.randomInt(1, 4);
    let matCarObstacle = AssetManager.find(`mat_car_obstacle_0${index}`).resource;
    this.modelEntity.model.meshInstances[0].material = matCarObstacle;
    this.modelEntity.model.meshInstances[0].material.update();
  }
}
