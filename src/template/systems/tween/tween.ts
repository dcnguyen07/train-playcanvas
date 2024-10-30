import TWEEN from "@tweenjs/tween.js";
import { Vec3 } from "playcanvas";
import { Tweener } from "./tweener";
import { AccessibleObject, Util } from "../../helpers/util";

interface TweenConfig {
  duration: number,
  easing: (amount: number) => number,
  loop: boolean,
  yoyo: boolean,
  delay: number,
  repeatDelay: number,
  repeat: number,
  onStart: (object: any) => void,
  onRepeat: (object: any) => void,
  onStop: (object: any) => void,
  onUpdate: (object: any) => void,
  onComplete: (object: any) => void,
}

export class Tween {

  static defaultConfig: TweenConfig = Object.freeze({
    duration    : 1,
    easing      : TWEEN.Easing.Linear.None,
    loop        : false,
    yoyo        : false,
    delay       : 0,
    repeatDelay : 0,
    repeat      : 0,
    onStart     : () => {
    },
    onRepeat: () => {
    },
    onStop: () => {
    },
    onUpdate: () => {
    },
    onComplete: () => {
    },
  });

  /**
   * @param {pc.Application} app
   */
  static init(app: pc.Application): void {
    app.on("start", () => {
      app.on("update", this.update, this);
    });
  }

  static update(): void {
    TWEEN.update();
  }

  static createLocalTranslateTween(entity: pc.Entity, dest: object = {}, config: any = Tween.defaultConfig): Tweener {
    const pos = entity.getLocalPosition().clone() as AccessibleObject;
    const tempPos = new Vec3() as AccessibleObject;
    const destKeys = Object.keys(dest);
    const tween = this.createTween(pos, dest, config) as Tweener;
    // @ts-ignore
    const onUpdate = tween._onUpdateCallback;

    tween.onUpdate(() => {
      tempPos.copy(entity.getLocalPosition());
      destKeys.forEach((key) => tempPos[key] = pos[key]);
      entity.setLocalPosition(tempPos as Vec3);
      onUpdate();
    });
    return tween;
  }

  static createGlobalTranslateTween(entity: pc.Entity, dest: object = {}, config: any = Tween.defaultConfig): Tweener {
    const pos = entity.getPosition().clone() as AccessibleObject;
    const tempPos = new Vec3() as AccessibleObject;
    const destKeys = Object.keys(dest);
    const tween = this.createTween(pos, dest, config);
    tween.onUpdate(() => {
      tempPos.copy(entity.getPosition());
      destKeys.forEach((key) => tempPos[key] = pos[key]);
      entity.setPosition(tempPos as Vec3);
    });
    return tween;
  }

  static createRotateTween(entity: pc.Entity, dest: object = {}, config: any = Tween.defaultConfig): Tweener {
    const rotation = entity.getLocalEulerAngles().clone() as AccessibleObject;
    const tempRotation = new Vec3() as AccessibleObject;
    const destKeys = Object.keys(dest);
    const tween = this.createTween(rotation, dest, config);
    tween.onUpdate(() => {
      tempRotation.copy(entity.getLocalEulerAngles());
      destKeys.forEach((key) => tempRotation[key] = rotation[key]);
      entity.setLocalEulerAngles(tempRotation as Vec3);
    });
    return tween;
  }

  static createScaleTween(entity: pc.Entity, dest: AccessibleObject = {}, config: any = Tween.defaultConfig): Tweener {
    const scale = entity.getLocalScale().clone() as AccessibleObject;
    const tempScale = new Vec3() as AccessibleObject;
    const destKeys = Object.keys(dest);
    const tween = this.createTween(scale, dest, config);
    tween.onUpdate(() => {
      tempScale.copy(entity.getLocalScale());
      destKeys.forEach((key) => tempScale[key] = scale[key]);
      entity.setLocalScale(tempScale as Vec3);
    });
    return tween;
  }

  static createMoveToTargetTween(entity: pc.Entity, target: pc.Entity, config: any = Tween.defaultConfig): Tweener {
    const tween = this.createCountTween(config);
    tween.onUpdate((data: any) => {
      let currentPos = entity.getPosition();
      let targetPos = target.getPosition();
      entity.setPosition(currentPos.lerp(currentPos, targetPos, data.percent));
    });
    return tween;
  }

  static createCountTween(config: any = Tween.defaultConfig): Tweener {
    const target = { percent: 0 };
    const tween = this.createTween(target, { percent: 1 }, config);
    return tween;
  }

  static createTween(target: object, dest: object = {}, config: any = Tween.defaultConfig): Tweener {
    const tweenConfig = this._setupConfig(config);
    const tween = new Tweener(target);
    tween.to(dest, tweenConfig.duration * 1000);
    this._setupTween(tween, tweenConfig);
    return tween;
  }

  private static _setupConfig(config: TweenConfig): any {
    return Util.copyObject(config, Util.copyObject(Tween.defaultConfig));
  }

  private static _setupTween(tween: Tweener, config: TweenConfig): void {
    tween.easing(config.easing);
    tween.delay(config.delay * 1000);
    tween.repeatDelay(config.repeatDelay * 1000);
    if (config.loop) {
      tween.repeat(Infinity);
    }
    else {
      tween.repeat(config.repeat);
    }
    tween.yoyo(config.yoyo);
    tween.onStart(config.onStart);
    tween.onRepeat(config.onRepeat);
    tween.onStop(config.onStop);
    tween.onUpdate(config.onUpdate);
    tween.onComplete(config.onComplete);
  }

  static get Easing(): typeof TWEEN.Easing {
    return TWEEN.Easing;
  }
}
