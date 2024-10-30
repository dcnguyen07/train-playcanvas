import { Easing } from "@tweenjs/tween.js";
import { Vec4, Vec2, Color, Entity } from "playcanvas";
import { GameConstant } from "../../../gameConstant";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { Tween } from "../../../template/systems/tween/tween";
import { Tweener } from "../../../template/systems/tween/tweener";
import { UIScreen } from "../../../template/ui/uiScreen";

export class TutorialScreen extends UIScreen {

  private _handTutorial: Entity;
  private _textTutorialGroup: Entity;
  private _tabAndHoldText: Entity;
  private _releaseText: Entity;
  private _handSmallScaleTween: Tweener;
  private _handBigScaleTween: Tweener;
  private _handRotateTween: Tweener;
  private _circleScaleTween: Tweener;

  constructor() {
    super(GameConstant.WIN_SCREEN_NAME);
  }

  override create() {
    super.create();
    this._createHandTutorial();
    this._createTextTutorial();
  }

  override resize() {
    super.resize();
  }

  override onActivated() {
    super.onActivated();
  }

  override onDeactivated() {
    super.onDeactivated();
  }

  private _createHandTutorial() {
    let circle = ObjectFactory.createImageElement("spr_circle_white", {
      anchor  : new Vec4(0.5, 0.15, 0.5, 0.15),
      pivot   : new Vec2(0.5, 0.5),
      x       : -250,
      y       : 65,
      opacity : 0.5,
    });
    circle.setLocalScale(0, 0, 1);
    this.addChild(circle);

    this._handTutorial = ObjectFactory.createImageElement("spr_icon_hand", {
      anchor : new Vec4(0.5, 0.15, 0.5, 0.15),
      pivot  : new Vec2(0.5, 1),
      scale  : 0.85,
      x      : -250,
      y      : 65,
    });
    this.addChild(this._handTutorial);
    this._handTutorial.setLocalEulerAngles(0, 0, 15);

    this._circleScaleTween = Tween.createScaleTween(circle, new Vec2(1, 1), {
      duration : 1,
      easing   : Easing.Quadratic.InOut,
    });

    this._handRotateTween = Tween.createRotateTween(this._handTutorial, { z: 30 }, {
      duration : 1,
      easing   : Easing.Quadratic.InOut,
    });

    this._handSmallScaleTween = Tween.createScaleTween(this._handTutorial, new Vec2(0.75, 0.75), {
      duration : 1,
      easing   : Easing.Quadratic.InOut,
      onStart  : () => {
        this._circleScaleTween.start();
        this._setOpacityTextTutorial(1, 0.25);
        this._handRotateTween.start();
      },
      onComplete: () => {
        this._handBigScaleTween.start();
      },
    }).start();

    this._handBigScaleTween = Tween.createScaleTween(this._handTutorial, new Vec2(1, 1), {
      duration : 1,
      delay    : 0.5,
      easing   : Easing.Quadratic.InOut,
      onStart  : () => {
        this._setOpacityTextTutorial(0.25, 1);
        circle.setLocalScale(0, 0, 1);
        this._handTutorial.setLocalEulerAngles(0, 0, 15);
      },
      onComplete: () => {
        this._handSmallScaleTween.start();
      },
    });
  }

  private _createTextTutorial() {
    this._textTutorialGroup = ObjectFactory.createGroupElement({
      anchor : new Vec4(0.5, 0.15, 0.5, 0.15),
      pivot  : new Vec2(0.5, 0.5),
      x      : 150,
    });
    this.addChild(this._textTutorialGroup);

    this._tabAndHoldText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text         : "1. Tab & Hold",
      anchor       : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot        : new Vec2(0.5, 0.5),
      alignment    : new Vec2(0, 0.5),
      color        : Color.WHITE,
      autoWidth    : false,
      autoFitWidth : true,
      minFontSize  : 45,
      maxFontSize  : 55,
      fontSize     : 50,
      width        : 600,
      y            : 50,
      x            : 75,
      lineHeight   : 50,
    });
    this._tabAndHoldText.element.key = "tab-and-hold";
    this._textTutorialGroup.addChild(this._tabAndHoldText);

    this._releaseText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text         : "2. Release",
      anchor       : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot        : new Vec2(0.5, 0.5),
      alignment    : new Vec2(0, 0.5),
      color        : Color.WHITE,
      autoWidth    : false,
      autoFitWidth : true,
      minFontSize  : 45,
      maxFontSize  : 55,
      fontSize     : 50,
      width        : 600,
      y            : -75,
      x            : 75,
      lineHeight   : 50,
      opacity      : 0.25,
    });
    this._releaseText.element.key = "release";
    this._textTutorialGroup.addChild(this._releaseText);
  }

  private _setOpacityTextTutorial(tabAndHoldOpacity: number, releaseOpacity: number) {
    this._tabAndHoldText.element.opacity = tabAndHoldOpacity;
    this._releaseText.element.opacity = releaseOpacity;
  }
}
