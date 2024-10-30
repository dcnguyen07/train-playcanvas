import { Easing } from "@tweenjs/tween.js";
import { Entity, ELEMENTTYPE_IMAGE, Vec4, Vec2, math, Color, Vec3 } from "playcanvas";
import { Game } from "../../../game";
import { GameConstant } from "../../../gameConstant";
import { AssetManager } from "../../../template/assetManager";
import { Util } from "../../../template/helpers/util";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { Time } from "../../../template/systems/time/time";
import { Tween } from "../../../template/systems/tween/tween";
import { UIScreen } from "../../../template/ui/uiScreen";
import { UserData } from "../../data/userData";

export class PlayScreen extends UIScreen {

  private _progress: Entity;
  private _fillContainer: Entity;
  private _fill: Entity;
  private _txtDistance: Entity;
  private _textCurrentLevel: Entity;
  private _textNextLevel: Entity;
  private _distance: number = 0;
  private _percent: number = 0;

  private _progressBarWidth: number = 649;
  private _progressFillWidth: number = 635;
  private _totalCoinBeforeStart: number = 0;
  private _isLevelStarted: boolean = false;

  constructor() {
    super(GameConstant.PLAY_SCREEN_NAME);

  }

  override create() {
    super.create();

    this._initProgress();
    this._initScore();
    this._initDecorObjects();
    this.fadeOut();
  }

  override resize() {
    super.resize();
    this._onResizeScore();
    this._onResizeProgress();
  }

  override onActivated() {
    super.onActivated();

    this._resetProgress();
    this.setDistance(0);

    if (!this._isLevelStarted) {
      this._isLevelStarted = true;
      this._totalCoinBeforeStart = UserData.currency;
    }
  }

  private _initScore() {
    this._txtDistance = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      anchor     : new Vec4(0.5, 1, 0.5, 1),
      text       : "0 m",
      fontText   : "0123456789",
      fontWeight : "bold",
      fontSize   : 100,
      color      : Util.createColor(255, 255, 255),
    });
    this._txtDistance.element.outlineThickness = 1;
    this._txtDistance.element.outlineColor = Util.createColor(153, 153, 153);
    this._txtDistance.element.spacing = 1.2;
    this.addChild(this._txtDistance);
    this.setDistance(this._distance);
    this._onResizeScore();
  }

  private _onResizeScore() {
    let scale = 1;
    if (Game.isLandscape) {
      scale = 0.7;
    }
    this._txtDistance.setLocalScale(scale, scale, scale);
  }

  private _onResizeProgress() {
    let y = 0;
    if (Game.isLandscape) {
      y = -155;
      this._txtDistance.setLocalPosition(0, -225, 0);
    }
    else {
      y = -200;
      this._txtDistance.setLocalPosition(0, -300, 0);
    }
    this._progress.setLocalPosition(0, y, 0);
  }

  private _resetProgress() {
    this._distance = 0;
    this._percent = 0;
    // @ts-ignore
    this._fill.setLocalPosition(-this._progressFillWidth + 5, 0, 0);
  }

  private _initProgress() {
    this._progress = new Entity();
    this._progress.addComponent("element", {
      type        : ELEMENTTYPE_IMAGE,
      spriteAsset : AssetManager.find("spr_bg_progress"),
      anchor      : new Vec4(0.5, 1, 0.5, 1),
      pivot       : new Vec2(0.5, 0.5),
      width       : this._progressBarWidth,
      height      : 47,
    });
    this.addChild(this._progress);
    this._progress.setLocalPosition(0, 300, 0);

    this._fillContainer = ObjectFactory.createImageElement("spr_progress_fill_yellow", {
      anchor : new Vec4(0.5, 1, 0.5, 1),
      pivot  : new Vec2(0.5, 0.5),
      width  : this._progressFillWidth + 5,
      height : 40,
    });
    this._fillContainer.element.mask = true;
    this._fillContainer.setLocalPosition(0, -23, 0);
    this._progress.addChild(this._fillContainer);

    this._fill = new Entity();
    this._fill.addComponent("element", {
      type        : ELEMENTTYPE_IMAGE,
      spriteAsset : AssetManager.find("spr_progress_fill_yellow"),
      pivot       : new Vec2(0.5, 0.5),
      anchor      : new Vec4(0.5, 0.5, 0.5, 0.5),
      width       : this._progressFillWidth,
      height      : 33,
    });

    this._fillContainer.addChild(this._fill);
    this._fill.setLocalPosition(-this._progressFillWidth + 5, 0, 0);
  }

  private _initDecorObjects() {
    let decorObjectLeft = ObjectFactory.createImageElement("spr_square", {
      anchor : new Vec4(0, 0.5, 0, 0.5),
      pivot  : new Vec2(1, 0.5),
    });
    this._progress.addChild(decorObjectLeft);

    this._textCurrentLevel = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      anchor   : new Vec4(0.5, 0.5, 0.5, 0.5),
      text     : "1",
      fontSize : 50,
      color    : Color.WHITE,
    });
    decorObjectLeft.addChild(this._textCurrentLevel);

    let decorObjectRight = ObjectFactory.createImageElement("spr_square", {
      anchor : new Vec4(1, 0.5, 1, 0.5),
      pivot  : new Vec2(0, 0.5),
    });
    this._progress.addChild(decorObjectRight);

    this._textNextLevel = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      anchor   : new Vec4(0.5, 0.5, 0.5, 0.5),
      text     : "2",
      fontSize : 50,
      color    : Color.WHITE,
    });
    decorObjectRight.addChild(this._textNextLevel);
  }

  override update() {
    super.update();
    // @ts-ignore
    let currentX = this._fill.getLocalPosition().x;
    let targetX = -this._progressFillWidth + (this._progressFillWidth * this._percent);
    let percentageLerp = math.lerp(currentX, targetX, Time.dt * 5);
    this._fill.setLocalPosition(percentageLerp, 0, 0);
  }

  public setDistance(distance: number) {
    this._distance = distance;
    this._txtDistance.element.text = `${distance.toString()} m`;
  }

  public setPercent(percent: number) {
    this._percent = math.clamp(percent, 0, 1);
  }

  public setLevel(currentLevel: number) {
    this._textCurrentLevel.element.text = currentLevel.toString();
    this._textNextLevel.element.text = (currentLevel + 1).toString();
  }

  public fadeIn() {
    let y = 0;
    if (Game.isLandscape) {
      y = -125;
    }
    else {
      y = -200;
    }
    Tween.createLocalTranslateTween(this._progress, new Vec3(0, y, 0), {
      duration : 0.4,
      easing   : Easing.Back.InOut,
    }).start();

    Tween.createLocalTranslateTween(this._txtDistance, new Vec3(0, y - 100, 0), {
      duration : 0.4,
      easing   : Easing.Back.InOut,
    }).start();
  }

  public fadeOut() {
    Tween.createLocalTranslateTween(this._progress, new Vec3(0, 300, 0), {
      duration : 0.3,
      easing   : Easing.Back.InOut,
    }).start();

    Tween.createLocalTranslateTween(this._txtDistance, new Vec3(0, 300, 0), {
      duration : 0.3,
      easing   : Easing.Back.InOut,
    }).start();
  }

  public getTotalCoinClaimed(): number {
    return UserData.currency - this._totalCoinBeforeStart;
  }

  public onReset() {
    this._isLevelStarted = false;
  }
}

