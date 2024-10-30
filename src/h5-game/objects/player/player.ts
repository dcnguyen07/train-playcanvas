import { Entity, Vec3 } from "playcanvas";
import { Game } from "../../../game";
import { GameConstant } from "../../../gameConstant";
import { AssetManager } from "../../../template/assetManager";
import { Util } from "../../../template/helpers/util";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { SoundManager } from "../../../template/soundManager";
import { ShopData } from "../../data/shopData";
import { UserData } from "../../data/userData";
import Ribbon from "../../scripts/components/ribbon";
import { TrainObstacle } from "../car/trainObstacle";
import { CarCrashEffect } from "../effects/carCrashEffect";
import { FragmentEffect } from "../effects/fragments/fragmentEffect";
import { Car } from "../car/car";
import { SmokeCarEffect } from "../effects/smokeCarEffect";
import ResourceHelper from "../ResourceHelper";
import { CarWheels } from "./carWheels";
import { Headlight } from "./headlight";
import { PlayerController } from "./playerController";

export class Player extends Entity {
  public static readonly Events = {
    Initialized      : "initialized",
    DistancePassed   : "distancePassed",
    SkinLoaded       : "skinLoaded",
    Finished         : "finished",
    OnDied           : "onDied",
    CheckPointPassed : "checkPointPassed",
  };

  _modelEntity: Entity;
  _backLight: Entity;
  _collisionEntity: Entity;
  _carWheels: CarWheels;
  controller: PlayerController;
  smoke: SmokeCarEffect;
  fragmentEffect: FragmentEffect;

  _skinData: any[] = [];
  isInitialized: boolean = false;
  private _ribbon: Ribbon;
  private listTrail: any[] = [];
  private _ribbon2: Ribbon;
  private timeoutId: any[] = [];
  private trail: Entity;
  private trail2: Entity;
  private crashEffect: CarCrashEffect;

  constructor() {
    super("player");
    this._loadSkinData();
    this._initModel();
    this._initController();
    this._initSmoke();
    this._initEffects();
  }

  private _loadSkinData() {
    this._skinData = AssetManager.find("skinData.json").resources;
    if (!this._skinData) {
      console.warn("Skin data not found");
    }
  }

  private async _initModel() {
    this._modelEntity = new Entity();
    this.addChild(this._modelEntity);

    let currentModelName = ShopData.getShopItemByName(UserData.currentSkin).model;
    if (currentModelName === undefined) {
      currentModelName = GameConstant.USER_DATA_DEFAULT_CAR_MODEL;
    }
    let modelAsset = await ResourceHelper.loadModel(currentModelName);
    this._modelEntity.addComponent("model", {
      type  : "asset",
      asset : modelAsset,
    });

    this.addComponent("rigidbody", {
      type            : "dynamic",
      mass            : 1,
      angularDamping  : 0,
      linearDamping   : 0,
      angularFactor   : new Vec3(1, 1, 1),
      friction        : 0.5,
      rollingFriction : 1,
      restitution     : 0,
    });

    this.addComponent("collision", {
      type: "compound",
    });

    this._collisionEntity = new Entity();
    this._collisionEntity.setLocalPosition(0, 0.553, 0);
    this._collisionEntity.addComponent("collision", {
      type        : "box",
      halfExtents : new Vec3(0.45, 0.4, 0.83),
    });
    this.addChild(this._collisionEntity);

    this._carWheels = new CarWheels();
    this.addChild(this._carWheels);

    await this._initBackLight();
    this._initHeadLight();

    this.rigidbody.on("triggerenter", this._onCollisionStart.bind(this));
    this.rigidbody.on("collisionstart", this._onCollisionStart.bind(this));
    this.rigidbody.on("collisionend", this._onCollisionEnd.bind(this));
    this.rigidbody.on("triggerleave", this._onCollisionEnd.bind(this));
    this.initRibbon();

    this.isInitialized = true;
    this.changeSkin(UserData.currentSkin);
    this.fire(Player.Events.Initialized);
  }

  initRibbon() {
    this.listTrail = [];
    this.trail = new Entity();
    this._modelEntity.addChild(this.trail);

    this.trail.setLocalEulerAngles(-90, 90, 0);
    this.trail.setLocalPosition(0.3, 0.05, 0.5);
    // this.trail.enabled = false;
    this._ribbon = this.trail.addScript(Ribbon, {
      attributes: {
        lifeTime   : 0.2,
        height     : 0.1,
        minHeight  : 0.1,
        xOffset    : -1,
        yOffset    : 1,
        color      : [99, 235, 255],
        useTexture : true,
        texture    : AssetManager.find("tex_ribbon").resource,
        alpha      : 0,
      },
    });
    this.listTrail.push(this._ribbon);

    this.trail2 = new Entity();
    this._modelEntity.addChild(this.trail2);

    this.trail2.setLocalEulerAngles(-90, 90, 0);
    this.trail2.setLocalPosition(-0.3, 0.05, 0.5);
    // this.trail2.enabled = false;
    this._ribbon2 = this.trail2.addScript(Ribbon, {
      attributes: {
        lifeTime   : 0.2,
        height     : 0.1,
        minHeight  : 0.1,
        xOffset    : -1,
        yOffset    : 1,
        color      : [99, 235, 255],
        useTexture : true,
        texture    : AssetManager.find("tex_ribbon").resource,
        alpha      : 0,
      },
    });
    this.listTrail.push(this._ribbon2);

  }

  disableTrail() {
    this.trail.enabled = false;
    this.trail2.enabled = false;
    this.listTrail.forEach((ribbon) => {
      ribbon.enabled = false;
    });
  }

  enableTrail() {
    this.trail.enabled = true;
    this.trail2.enabled = true;
    this.listTrail.forEach((ribbon) => {
      ribbon.enabled = true;
    });
  }

  private async _initBackLight() {
    this._backLight = new Entity();
    this._backLight.setLocalPosition(0, 0.4, 0.9);
    this._backLight.setLocalScale(1, 1, 1);
    this.addChild(this._backLight);

    let backLightAsset = await ResourceHelper.loadMaterial("mat_backlight");
    let backLightLeft = ObjectFactory.createPlane();
    backLightLeft.setLocalPosition(-0.25, 0, 0);
    backLightLeft.setLocalScale(0.5, 0.5, 0.5);
    backLightLeft.setLocalEulerAngles(90, 0, 0);
    backLightLeft.model.meshInstances[0].material = backLightAsset.resource;
    this._backLight.addChild(backLightLeft);

    let backLightRight = ObjectFactory.createPlane();
    backLightRight.setLocalPosition(0.25, 0, 0);
    backLightRight.setLocalScale(0.5, 0.5, 0.5);
    backLightRight.setLocalEulerAngles(90, 0, 0);
    backLightRight.model.meshInstances[0].material = backLightAsset.resource;
    this._backLight.addChild(backLightRight);
  }

  private async _initHeadLight() {
    let headlightLeft = new Headlight();
    headlightLeft.setLocalPosition(-0.2, 0.4, -1.5);
    this.addChild(headlightLeft);

    let headlightRight = new Headlight();
    headlightRight.setLocalPosition(0.2, 0.4, -1.5);
    this.addChild(headlightRight);
  }

  private _initController() {
    this.controller = this.addScript(PlayerController, {
      attributes: {
        speed        : 15,
        acceleration : 5,
        modelEntity  : this,
      },
    });
  }

  private _initSmoke() {
    this.smoke = new SmokeCarEffect();
    this.smoke.setLocalPosition(0, 0, 0.7);
    this.addChild(this.smoke);
    this.smoke.play();
  }

  private _initEffects() {
    this.fragmentEffect = new FragmentEffect();
    Game.app.root.addChild(this.fragmentEffect);

    this.crashEffect = new CarCrashEffect();
    this.crashEffect.setLocalScale(0.5, 0.5, 0.5);
    this.crashEffect.setLocalPosition(0, 0.8, 0.5);
    this.addChild(this.crashEffect);
  }

  public showFragment(pos: Vec3) {
    // this.fragmentEffect.showFragment();
    // this.fragmentEffect.setLocalPosition(pos);
  }

  public hideFragment() {
    // this.fragmentEffect.hideFragment();
  }

  private _onCollisionStart(other: any) {
    if (this.controller.isDied || !this.controller.isRunning) {
      return;
    }

    let collisionTags = other.other ? other.other.tags : other.tags;
    if (collisionTags.has(GameConstant.CHANGE_DIRECTION_TAG)) {
      other.other ? other.other.enabled = false : other.enabled = false;
      this.controller.hasChangeDirection = true;
    }

    if (collisionTags.has(GameConstant.FINISH_POINT_TAG)) {
      this._onReachFinishPoint();
    }

    if (collisionTags.has(GameConstant.WATER_TAG)) {
      this._onCollideObstacle();
    }

    if (other.other === undefined) {
      return;
    }

    if (collisionTags.has(GameConstant.OBSTACLE_TAG)) {
      this._onCollideObstacle();
    }

    if (collisionTags.has(GameConstant.CAR_OBSTACLE_TAG)) {
      this.controller.enabled = false;
      this.rigidbody.linearVelocity = Vec3.ZERO;
      let otherCar = other.other ? other.other : other;

      this.controller.isDied = true;

      this.rigidbody.applyImpulse(otherCar.forward.clone().scale(otherCar.rigidbody.linearVelocity.length() * 0.1));
      this.rigidbody.applyTorqueImpulse(otherCar.forward.clone().scale(3)); // 6 is multiplier

      otherCar.rigidbody.applyImpulse(this.forward.clone().scale(this.rigidbody.linearVelocity.length() * 0.1));
      otherCar.rigidbody.applyTorqueImpulse(this.forward.clone().scale(3)); // 6 is multiplier

      if (otherCar instanceof Car) {
        otherCar.moveToPath.stop();
      }

      if (otherCar instanceof TrainObstacle) {
        otherCar.rigidbody.linearVelocity = Vec3.ZERO;
        otherCar.moveToPath.enabled = false;
      }
      this._onCollideObstacle();
    }
  }

  private _onCollisionEnd(other: any) {
    if (this.controller.isDied || !this.controller.isRunning) {
      return;
    }
    let collisionTags = other.other ? other.other.tags : other.tags;
    if (collisionTags.has(GameConstant.JUMP_TAG)) {
      this.rigidbody.angularVelocity = Vec3.ZERO;
    }
  }

  private _onReachFinishPoint() {
    this.controller.enabled = false;
    this.controller.isRunning = false;
    let linearVelocity = this.rigidbody.linearVelocity.clone();
    linearVelocity.normalize().scale(30);
    this.rigidbody.linearVelocity = linearVelocity;
    this.rigidbody.angularVelocity = Vec3.ZERO;
    this.fire(Player.Events.Finished);
  }

  private _onCollideObstacle() {
    SoundManager.play("sfx_car_crash");
    this.listTrail.forEach((ribbon) => {
      ribbon.reset();
      ribbon.updateAlpha(0);
    });
    this.controller.enabled = false;
    this.controller.isDied = true;
    this.crashEffect.play();
    this.fire(Player.Events.OnDied);
  }

  public resetTimeout(i : number, ribbon:Ribbon) {
    const timeoutId = setTimeout(() => {
      ribbon.isStop = false;
    }, 1000);

    if (i < this.timeoutId.length) {
      if (this.timeoutId[i]) {
        clearTimeout(this.timeoutId[i]);
      }
      this.timeoutId[i] = timeoutId;
    }
    else {
      this.timeoutId.push(timeoutId);
    }
  }

  public onPointerDown() {
    this.controller.onPointerDown();
    this._backLight.enabled = false;
    this.listTrail.forEach((ribbon) => {
      ribbon.isStop = false;
      ribbon.updateAlpha(0);
    });
  }

  public onPointerUp() {
    this.controller.onPointerUp();
    if (this.controller.grounded) {
      for (let i = 0; i < this.listTrail.length; i++) {
        this.listTrail[i].isStop = true;
        this.listTrail[i].updateAlpha(1);
        this.resetTimeout(i, this.listTrail[i]);
      }
    }
    this._backLight.enabled = true;
    if (!SoundManager.isPlaying("sfx_car_brake")) {
      SoundManager.play("sfx_car_brake");
    }
  }

  public setStartPosition(position: Vec3) {
    this.rigidbody.teleport(position, new Vec3(0, 0, 0));
  }

  public setRevivePosition(position: Vec3, eulerAngles: Vec3) {
    this.rigidbody.teleport(position, eulerAngles);
  }

  public changePath(path: Entity[]) {
    this.controller.changePath(path);
  }

  public changeCheckpoint(checkPoint: Entity[]) {
    this.controller.changeCheckPoints(checkPoint);
  }

  public async changeSkin(skinId: string) {
    let skinData = this._skinData.find((data) => data.id === skinId);
    if (!skinData) {
      console.warn("Skin not found");
      return;
    }
    let modelAsset = await ResourceHelper.loadModel(skinData.model);
    this._modelEntity.model.asset = modelAsset;
    this.smoke.setLocalPosition(Util._arrayToVec3(skinData.smoke.position));
    this._backLight.setLocalPosition(Util._arrayToVec3(skinData.backLight.position));
    this._backLight.setLocalScale(Util._arrayToVec3(skinData.backLight.scale));
    this._collisionEntity.setLocalPosition(Util._arrayToVec3(skinData.collision.position));
    this._collisionEntity.collision.halfExtents = Util._arrayToVec3(skinData.collision.halfExtents);
    this._carWheels.changeWheelsData(skinData.wheelsData);
    this.fire(Player.Events.SkinLoaded);
  }

  public reset() {
    if (this.rigidbody) {
      this.rigidbody.linearVelocity = Vec3.ZERO;
      this.rigidbody.angularVelocity = Vec3.ZERO;
    }
    this.controller.enabled = true;
    this.controller.reset();
    this.controller._checkPointIndex = 0;
    this.crashEffect.stop();
  }

  public resetRevive() {
    this.listTrail.forEach((ribbon) => {
      ribbon.reset();
      ribbon.updateAlpha(0);
    });
    if (this.rigidbody) {
      this.rigidbody.linearVelocity = Vec3.ZERO;
      this.rigidbody.angularVelocity = Vec3.ZERO;
    }
    this.controller.enabled = true;
    this.controller.resetRevive();
    this.crashEffect.stop();
  }
}
