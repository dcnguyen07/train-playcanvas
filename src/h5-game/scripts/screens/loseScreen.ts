import { Easing } from "@tweenjs/tween.js";
import { Entity, Vec4, Color, Vec2, Vec3 } from "playcanvas";
import { GameConstant } from "../../../gameConstant";
import { Util } from "../../../template/helpers/util";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { Tween } from "../../../template/systems/tween/tween";
import { Tweener } from "../../../template/systems/tween/tweener";
import { UIScreen } from "../../../template/ui/uiScreen";

export class LoseScreen extends UIScreen {

  public static readonly Event = {
    BUTTON_REPLAY_CLICKED : "LoseScreen:ButtonReplayClicked",
    BUTTON_REVIVE_CLICKED : "LoseScreen:ButtonReviveClicked",
  };

  private _background: Entity;
  private _titleText: Entity;
  private _tutorialText: Entity;
  private _loseBanner: Entity;
  private _tutorialTextTween: Tweener;
  private _container: Entity;
  private _buttonRevive: Entity;

  constructor() {
    super(GameConstant.LOSE_SCREEN_NAME);
  }

  override onActivated() {
    super.onActivated();
    this._fadeIn();
  }

  override onDeactivated() {
    super.onDeactivated();
    this._fadeOut();
  }

  override create() {
    super.create();
    this._initBackground();
    this._initComponents();
  }

  override resize() {
    super.resize();
    this._onResizeBackground();
  }

  private _initBackground() {
    this._background = ObjectFactory.createEmptyImageElement({
      width   : GameConstant.GAME_WIDTH,
      height  : GameConstant.GAME_HEIGHT,
      color   : Color.BLACK,
      opacity : 0.25,
    });
    this.addChild(this._background);
    this._onResizeBackground();
    Util.registerOnTouch(this._background.element, this._onTouchBackground, this);
  }

  private _onResizeBackground() {
    let res = this.screen.resolution;
    let width = res.x / this.screen.scale;
    let height = res.y / this.screen.scale;
    let scale = 1 / Math.min(width / GameConstant.GAME_WIDTH, height / GameConstant.GAME_HEIGHT);
    this._background?.setLocalScale(scale, scale, 1);
    this._loseBanner?.setLocalScale(scale, 1, 1);
  }

  private _initComponents() {
    this._loseBanner = ObjectFactory.createImageElement("spr_lose_banner", {
      anchor : new Vec4(0.5, 0.8, 0.5, 0.8),
      pivot  : new Vec2(0.5, 0.5),
      width  : GameConstant.GAME_WIDTH,
      height : 175,
    });
    this.addChild(this._loseBanner);
    this._onResizeBackground();

    this._titleText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text         : "Level failed",
      anchor       : new Vec4(0.5, 0.8, 0.5, 0.8),
      pivot        : new Vec2(0.5, 0.5),
      color        : Color.WHITE,
      autoWidth    : false,
      autoFitWidth : true,
      minFontSize  : 60,
      maxFontSize  : 75,
      fontSize     : 70,
      width        : 500,
      wrapLines    : false,
    });
    this._titleText.element.key = "level-failed";
    this._titleText.element.isUpperCase = true;
    this.addChild(this._titleText);
    this._titleText.setLocalPosition(-1000, 0, 0);

    this._tutorialText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text         : "Tap to replay",
      anchor       : new Vec4(0.5, 0.3, 0.5, 0.3),
      pivot        : new Vec2(0.5, 0.5),
      color        : Color.WHITE,
      autoWidth    : false,
      autoFitWidth : true,
      minFontSize  : 50,
      maxFontSize  : 75,
      fontSize     : 60,
      width        : 600,
      wrapLines    : false,
    });
    this._tutorialText.element.key = "tap-to-replay";
    this.addChild(this._tutorialText);

    this._tutorialTextTween = Tween.createScaleTween(this._tutorialText, new Vec2(0.85, 0.85), {
      duration : 0.5,
      loop     : true,
      yoyo     : true,
      easing   : Easing.Quadratic.InOut,
    }).start();
  }

  private _onTouchBackground() {
    this.fire(LoseScreen.Event.BUTTON_REPLAY_CLICKED);
  }

  private _fadeIn() {
    Tween.createLocalTranslateTween(this._titleText, new Vec3(0, 0, 0), {
      duration : 0.4,
      easing   : Easing.Back.InOut,
    }).start();
  }

  private _fadeOut() {
    Tween.createLocalTranslateTween(this._titleText, new Vec3(-1000, 0, 0), {
      duration : 0.3,
      easing   : Easing.Back.InOut,
    }).start();
  }
}
