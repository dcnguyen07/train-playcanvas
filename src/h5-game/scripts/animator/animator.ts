import { AnimationComponent, ScriptType, Animation } from "playcanvas";
import { AnimationConfig } from "./animationConfig";
import { AssetManager } from "../../../template/assetManager";
import { Util } from "../../../template/helpers/util";
import GamePlayManager from "../../objects/gamePlayManager/gamePlayManager";

export default class Animator extends ScriptType {
  static override get scriptName() {
    return "animator";
  }

  animation: AnimationComponent = null;
  scaleWithGamePlayTimeScale = false;

  currIndex = 0;
  currPercent = 0;
  currConfig: AnimationConfig;
  configs: AnimationConfig[];
  currName = "";
  currAnim: Animation;
  anims: string[];

  private _speedMultiplier = 1;

  override initialize() {
    this.anims = this.getAnims();
    this.animation.loop = false;
    if (this.scaleWithGamePlayTimeScale) {
      if (GamePlayManager.instance.isPause) {
        this.animation.speed = 0;
      }
      else {
        this.animation.speed = this.currConfig ? this.currConfig.speed * this._speedMultiplier : 1;
      }
      GamePlayManager.instance.on(GamePlayManager.Event.Pause, this.pause, this);
      GamePlayManager.instance.on(GamePlayManager.Event.Resume, this.resume, this);
    }
  }

  override update() {
    if (!this.currAnim) {
      return;
    }

    this.currPercent = this.animation.currentTime / this.currAnim.duration;
    this.currConfig.keyEvents.forEach((keyEvent) => {
      if (!keyEvent.called && keyEvent.key <= this.currPercent) {
        keyEvent.event();
        keyEvent.called = true;
      }
    });

    if (this.currPercent >= 1) {
      if (this.configs[this.currIndex + 1]) {
        this.start(this.currIndex + 1);
      }
      else if (this.currConfig.loop) {
        this.currConfig.keyEvents.forEach((keyEvent) => keyEvent.called = false);
        this.start(this.currIndex);
      }
    }
  }

  start(index:number, blendTime = 0) {
    this.currPercent = 0;
    this.currIndex = index;

    let config = this.configs[this.currIndex];
    this.currConfig = new AnimationConfig();
    Util.copyObject(config, this.currConfig);

    this.currName = this.currConfig.name;
    this.currAnim = this.animation.getAnimation(this.currName);

    this.animation.play(this.currName, blendTime);
    if (this.scaleWithGamePlayTimeScale && GamePlayManager.instance.isPause) {
      this.animation.speed = 0;
    }
    else {
      this.animation.speed = this.currConfig.speed * this._speedMultiplier;
    }
  }

  setAnimation(configs: AnimationConfig[]) {
    this.configs = configs;
    this.configs?.forEach((config) => {
      config?.keyEvents?.forEach((keyEvent) => keyEvent.called = false);
    });
    this.start(0, this.configs[0].blendTime);
  }

  setSpeed(speed: number) {
    this.configs[this.currIndex].speed = speed;
    this.animation.speed = speed * this._speedMultiplier;
  }

  getAnims() : string[] {
    return this.animation.assets.map((asset) => {
      if (typeof (asset) === "number") {
        return AssetManager.assets.get(asset).name;
      }
      else {
        return asset.name;
      }
    });
  }

  pause() {
    this.animation.speed = 0;
    this.disable();
  }

  resume() {
    this.animation.speed = this.currConfig.speed * this._speedMultiplier;
    this.enable();
  }

  get speedMultiplier() {
    return this._speedMultiplier;
  }

  set speedMultiplier(value: number) {
    this._speedMultiplier = value;
    if (this.currConfig) {
      this.animation.speed = this.currConfig.speed * this._speedMultiplier;
    }
  }
}
