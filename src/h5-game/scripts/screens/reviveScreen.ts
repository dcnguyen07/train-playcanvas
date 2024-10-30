import { Easing } from "@tweenjs/tween.js";
import { Vec4, Vec2, Entity, ELEMENTTYPE_IMAGE, StandardMaterial, BLEND_MAX, Color, Vec3 } from "playcanvas";
import { Game } from "../../../game";
import { GameConstant } from "../../../gameConstant";
import { AssetManager } from "../../../template/assetManager";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { SoundManager } from "../../../template/soundManager";
import { Tween } from "../../../template/systems/tween/tween";
import { Tweener } from "../../../template/systems/tween/tweener";
import { UIScreen } from "../../../template/ui/uiScreen";

export class ReviveScreen extends UIScreen {
  public static readonly Event = {
    BUTTON_REVIVE_CLICKED : "Revive:ButtonReviveClicked",
    SHOW_LOSE_SCREEN      : "Revive:ShowLoseScreen",
  };
  private groupElement: Entity;
  private loadingRadial: Entity;
  private circleLoading: Entity;
  private numberText: number;
  private textNumber: Entity;
  private tweenCircleLoading: Tweener;
  private background: Entity;
  private _buttonRevive: Entity;
  private _adsIcon: Entity;
  private _reviveText: Entity;
  private _checkRewardAdsIntervalID: any;

  constructor() {
    super();
  }

  override create() {
    super.create();
    this._initBackground();
    this._initTitle();
    this._initCircleLoading();
    this._initButtonRevive();
    this._initTween();
    this._checkIsRewardAdsAvailable();
  }

  override onActivated() {
    super.onActivated();
    Tween.createScaleTween(this._buttonRevive, new Vec3(1, 1, 1), {
      duration : 0.4,
      easing   : Easing.Back.InOut,
    }).start();
  }

  override onDeactivated() {
    super.onDeactivated();
    Tween.createScaleTween(this._buttonRevive, new Vec3(0, 0, 0), {
      duration : 0.4,
      easing   : Easing.Back.InOut,
    }).start();
  }

  private _initBackground() {
    this.background = ObjectFactory.createEmptyImageElement({
      color   : new Color(0, 0, 0),
      opacity : 0.85,
    });
    this.addChild(this.background);
    this.background.element.anchor = new Vec4(0, 0, 1, 1);
  }

  private _initTitle() {
    let title = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text         : "Continue?",
      anchor       : new Vec4(0.5, 0.8, 0.5, 0.8),
      pivot        : new Vec2(0.5, 0.5),
      color        : Color.WHITE,
      autoWidth    : false,
      autoFitWidth : true,
      minFontSize  : 90,
      maxFontSize  : 120,
      width        : 300,
      wrapLines    : false,
    });
    title.element.key = "continue-revive";
    this.addChild(title);
  }

  private _initCircleLoading() {
    this.groupElement = ObjectFactory.createGroupElement({
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
    });
    this.addChild(this.groupElement);

    this.loadingRadial = new Entity("loadingRadial");
    this.groupElement.addChild(this.loadingRadial);
    this.loadingRadial.addComponent("element", {
      type   : ELEMENTTYPE_IMAGE,
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      mask   : true,
      width  : 300,
      height : 300,
    });
    let matRadialProgress = new StandardMaterial();
    matRadialProgress.diffuse = new Color(0, 0, 0);
    matRadialProgress.opacityMap = AssetManager.find("tex_radial_gradient").resource;
    matRadialProgress.opacityMapChannel = "r";
    matRadialProgress.alphaTest = 0.1;
    matRadialProgress.blendType = BLEND_MAX;
    matRadialProgress.depthTest = false;
    matRadialProgress.depthWrite = false;
    matRadialProgress.useFog = false;
    matRadialProgress.useLighting = false;
    matRadialProgress.useGammaTonemap = false;
    matRadialProgress.useSkybox = false;
    this.loadingRadial.element.material = matRadialProgress;

    this.circleLoading = new Entity("circleLoading");
    this.circleLoading.addComponent("element", {
      type    : "image",
      anchor  : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot   : new Vec2(0.5, 0.5),
      color   : new Color(1, 1, 1),
      opacity : 1,
      mask    : false,
      width   : 300,
      height  : 300,
    });
    this.circleLoading.element.textureAsset = AssetManager.find("tex_radialProgressContinue").id;
    this.loadingRadial.addChild(this.circleLoading);

    this.numberText = 5;

    this.textNumber = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text     : this.numberText.toString(),
      color    : new Color(1, 1, 1),
      fontSize : 150,
    });
    this.groupElement.addChild(this.textNumber);
  }

  private _initButtonRevive() {
    this._buttonRevive = ObjectFactory.createButtonElement("spr_btn_orange", {
      anchor : new Vec4(0.5, 0.1, 0.5, 0.1),
      y      : 50,
      scale  : 1.5,
    });
    this._buttonRevive.setLocalScale(0, 0, 0);
    this.addChild(this._buttonRevive);

    this._reviveText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text         : "Revive",
      anchor       : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot        : new Vec2(0.5, 0.5),
      color        : Color.WHITE,
      autoWidth    : false,
      autoFitWidth : true,
      minFontSize  : 30,
      maxFontSize  : 45,
      width        : 150,
      x            : 50,
      wrapLines    : false,
    });
    this._reviveText.element.key = "revive";
    this._reviveText.element.isUpperCase = true;
    this._buttonRevive.addChild(this._reviveText);

    this._adsIcon = ObjectFactory.createImageElement("spr_icon_ads", {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      x      : -135,
    });
    this._buttonRevive.addChild(this._adsIcon);

    this._buttonRevive.button.on("click", () => {
      this._onAdsButtonClicked();
    });
  }

  private _onAdsButtonClicked() {
    SoundManager.play("sfx_button");
    this._setInputStateAllButtons(false);
    this._resetTween();
    Tween.createCountTween({
      duration   : 0.1,
      onComplete : () => {
        this._setInputStateAllButtons(true);
        this._checkIsRewardAdsAvailable();
        this.fire(ReviveScreen.Event.BUTTON_REVIVE_CLICKED);
      },
    }).start();
  }

  private _setInputStateAllButtons(isEnable: boolean) {
    this._buttonRevive.element.useInput = isEnable;
  }

  private _checkIsRewardAdsAvailable() {
    this._activeButtonAds(true);
  }

  private _activeButtonAds(isActive: boolean) {
    this._buttonRevive.element.useInput = isActive;
    let opacity = isActive ? 1 : 0.25;
    this._buttonRevive.element.opacity = opacity;
    this._reviveText.element.opacity = opacity;
    this._adsIcon.element.opacity = opacity;
  }

  private _initTween() {
    this.numberText = 5;
    this.tweenCircleLoading = Tween.createCountTween({
      duration : 5,
      onStart  : () => {
        this.numberText = 5;
        this.textNumber.element.text = this.numberText.toString();
        this.groupElement.enabled = true;
      },
      onUpdate: (target: any) => {
        this.loadingRadial.element.material.alphaTest = target.percent;
        this.numberText = Math.floor(6 - target.percent * 5);
        this.textNumber.element.text = this.numberText.toString();
      },

      onComplete: () => {
        this.textNumber.element.text = "0";
        this.groupElement.enabled = false;
        this.fire(ReviveScreen.Event.SHOW_LOSE_SCREEN);
      },
    });
  }

  public playTween() {
    this.tweenCircleLoading.start();
  }

  private _resetTween() {
    this.tweenCircleLoading.stop();
    this.numberText = 5;
  }
}
