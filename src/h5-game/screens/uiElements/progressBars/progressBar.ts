import { ELEMENTTYPE_GROUP, ELEMENTTYPE_IMAGE, Entity, Vec2, Vec4, Color } from "playcanvas";
import { GameConstant } from "../../../../gameConstant";
import { AssetManager } from "../../../../template/assetManager";
import { Util } from "../../../../template/helpers/util";
import { Tween } from "../../../../template/systems/tween/tween";
import { ObjectFactory } from "../../../../template/objects/objectFactory";
import { Tweener } from "../../../../template/systems/tween/tweener";

export class ProgressBar extends Entity {
  sline: Entity;
  mask: Entity;
  fill: Entity;
  bars: any[];
  iconClock: Entity;
  iconLevel: Entity;
  text: Entity;
  tweens: Array<Tweener> = [];

  constructor() {
    super();
    this.bars = [];
    this.addComponent("element", {
      type   : ELEMENTTYPE_GROUP,
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
    });
    this._createProgress();
    this._createIconClock();
    this._initText();
  }

  private _initText() {
    this.text = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text  : "0%",
      color : Color.WHITE,
      y     : 75,
    });
    this.addChild(this.text);
    this.text.enabled = true;
  }

  private _createProgress() {
    this.sline = new Entity();
    this.addChild(this.sline);
    this.sline.addComponent("element", {
      type        : ELEMENTTYPE_IMAGE,
      anchor      : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot       : new Vec2(0.5, 0.5),
      spriteAsset : AssetManager.find("spr_progress_bg"),
      width       : 600,
      height      : 50,
    });

    this.mask = new Entity();
    this.sline.addChild(this.mask);
    this.mask.addComponent("element", {
      type    : ELEMENTTYPE_IMAGE,
      anchor  : new Vec4(0.01, 0.5, 0.01, 0.5),
      pivot   : new Vec2(0, 0.5),
      mask    : true,
      width   : 0,
      height  : 50,
      opacity : 1,
    });

    this.fill = new Entity();
    this.mask.addChild(this.fill);
    this.fill.addComponent("element", {
      type        : ELEMENTTYPE_IMAGE,
      anchor      : new Vec4(0, 0.5, 0, 0.5),
      pivot       : new Vec2(0, 0.5),
      width       : 587,
      height      : 36,
      // color       : Util.createColor(0, 210, 255),
      spriteAsset : AssetManager.find("spr_progress_fill"),
    });
  }

  private _createIconClock() {
    this.iconClock = ObjectFactory.createImageElement("spr_icon_currency", {
      scale : 0.8,
      x     : -30,
    });
    this.iconClock.element.anchor = new Vec4(1, 0.5, 1, 0.5);
    // this.sline.addChild(this.iconClock);
  }

  public setCurrentProgress(value: number) {
    this.mask.element.width = this.fill.element.width * value;
  }

  public updateProgress(percent: number) {
    Tween.createTween(this.mask.element, { width: 600 * (percent) }, {
      duration: 1,
    }).start();
  }

  public setProgress(value: number, total: number, duration: number = 0.2, delay: number = 0, callback: any = undefined) {
    let percent = value / total;
    let tween = Tween.createTween(this.mask.element, { width: this.fill.element.width * (value / total) }, {
      duration,
      onComplete: () => {
        if (delay <= 0) {
          return;
        }
        // handle callback when progress bar full
        let tweenDelay = Tween.createCountTween({
          duration   : delay,
          onComplete : () => {
            if (percent >= 1) {
              this.mask.element.width = 0;
            }
            callback && callback();
          },
        }).start();
        this.tweens.push(tweenDelay);
      },
    }).start();
    this.tweens.push(tween);
  }

  public setFullProgress() {
    this.text.element.text = "100%";
    this.tweens.forEach((tween) => {
      tween.pause();
      tween.stop();
    });
    this.mask.element.width = this.fill.element.width;
  }

  public updateText(current: number, total: number) {
    this.text.element.text = `${current}%`;
    this.text.enabled = true;

    const duration = 1;
    let tweenValue = { value: current };

    Tween.createTween(
      tweenValue,
      { value: total },
      {
        duration : duration,
        onUpdate : () => {
          this.text.element.text = `${Math.round(tweenValue.value)}%`;
        },
      },
    ).start();
  }

  public resetProgress() {
    this.mask.element.width = 0;
    this.text.element.text = "0%";
  }
}
