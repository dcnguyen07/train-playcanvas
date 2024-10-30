import { Easing } from "@tweenjs/tween.js";
import { Entity, Color, Vec4, Vec2, Vec3 } from "playcanvas";
import { Game } from "../../../game";
import { GameConstant } from "../../../gameConstant";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { SoundManager } from "../../../template/soundManager";
import { Tween } from "../../../template/systems/tween/tween";
import { Tweener } from "../../../template/systems/tween/tweener";
import { UIScreen } from "../../../template/ui/uiScreen";
import { UserData } from "../../data/userData";

export class WinScreen extends UIScreen {

  public static readonly Event = {
    BUTTON_NEXT_CLICKED: "WinScreen:ButtonNextClicked",
  };

  private _background: Entity;
  private _titleText: Entity;
  private _winBanner: Entity;
  private _currentLevel: Entity;
  private _coinReward: Entity;
  private _coinIcon: Entity;
  private _arrowMoveTween: Tweener;
  private _coefficient: number;
  private _textReward: Entity;
  private _adsButton: Entity;
  private _continueButton: Entity;
  private _continueButtonText: Entity;

  public rewardCoin: number;
  private slider: Entity;
  private levelText: Entity;
  private _adsIcon: Entity;
  private _checkRewardAdsIntervalID: any;

  constructor() {
    super(GameConstant.WIN_SCREEN_NAME);

    this._coefficient = 1;
    this.rewardCoin = 100;
  }

  override create() {
    super.create();

    this._initBackground();
    this._initBanner();
    this._initTextlevel();
    this._initCoinReward();
    this._initAdsButton();
    this._initSliderRewardMultiple();
    this._initContinueButton();

    this._onResizeBackground();
    this._onResizeComponents();
  }

  override resize() {
    super.resize();

    this._onResizeBackground();
    this._onResizeComponents();
  }

  override onActivated() {
    super.onActivated();

    this._onResizeBackground();
    this._onResizeComponents();
    this._arrowMoveTween?.start();
    this.fadeIn();
    this._checkIsRewardAdsAvailable();
  }

  override onDeactivated() {
    super.onDeactivated();

    this.fadeOut();
  }

  private _initBackground() {
    this._background = ObjectFactory.createEmptyImageElement({
      width   : GameConstant.GAME_WIDTH,
      height  : GameConstant.GAME_HEIGHT,
      color   : Color.BLACK,
      opacity : 0.65,
    });
    this.addChild(this._background);
  }

  private _onResizeBackground() {
    let res = this.screen.resolution;
    let width = res.x / this.screen.scale;
    let height = res.y / this.screen.scale;
    let scale = 1 / Math.min(width / GameConstant.GAME_WIDTH, height / GameConstant.GAME_HEIGHT);
    this._background?.setLocalScale(scale, scale, 1);
    this._winBanner?.setLocalScale(scale, scale / 2, 1);
  }

  private _onResizeComponents() {
    if (Game.isPortrait) {
      this._coinReward?.setLocalPosition(-190, -175, 0);
      this._coinIcon?.setLocalPosition(75, -175, 0);
      this._adsButton?.setLocalPosition(0, 175, 0);
      this._adsButton?.setLocalScale(1.35, 1.35, 1);
      this._continueButton?.setLocalPosition(0, 100, 0);
      this._continueButton?.setLocalScale(1, 1, 1);
    }
    else {
      this._coinReward?.setLocalPosition(-190, -100, 0);
      this._coinIcon?.setLocalPosition(75, -100, 0);
      this._adsButton?.setLocalPosition(0, 0, 0);
      this._adsButton?.setLocalScale(0.85, 0.85, 1);
      this._continueButton?.setLocalPosition(0, -25, 0);
      this._continueButton?.setLocalScale(0.75, 0.75, 0.75);
    }
  }

  private _initBanner() {
    this._winBanner = ObjectFactory.createImageElement("spr_win_banner", {
      anchor : new Vec4(0.5, 0.8, 0.5, 0.8),
      pivot  : new Vec2(0.5, 0.5),
      width  : GameConstant.GAME_WIDTH,
      height : 200,
    });
    this.addChild(this._winBanner);
    this._onResizeBackground();

    this._titleText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text          : "Level completed",
      anchor        : new Vec4(0.5, 0.8, 0.5, 0.8),
      pivot         : new Vec2(0.5, 0.5),
      color         : Color.WHITE,
      autoWidth     : false,
      autoFitWidth  : true,
      autoHeight    : false,
      autoFitHeight : true,
      minFontSize   : 60,
      maxFontSize   : 70,
      fontSize      : 65,
      width         : 700,
      wrapLines     : false,
      height        : 150,
    });
    this._titleText.element.key = "level-completed";
    this._titleText.element.isUpperCase = true;
    this.addChild(this._titleText);
    this._titleText.setLocalPosition(-1000, 0, 0);
  }

  private _initTextlevel() {
    this.levelText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text          : "Level ",
      anchor        : new Vec4(0.5, 0.65, 0.5, 0.65),
      pivot         : new Vec2(0.5, 0.5),
      color         : Color.WHITE,
      autoWidth     : false,
      autoFitWidth  : true,
      autoHeight    : false,
      autoFitHeight : true,
      minFontSize   : 45,
      maxFontSize   : 55,
      fontSize      : 50,
      width         : 400,
      wrapLines     : false,
      height        : 150,
      x             : -175,
      alignment     : new Vec2(1, 0.5),
    });
    this.levelText.element.key = "level";
    this.addChild(this.levelText);
    this.levelText.setLocalScale(0, 0, 0);

    this._currentLevel = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text          : 100,
      anchor        : new Vec4(0.5, 0.65, 0.5, 0.65),
      pivot         : new Vec2(0.5, 0.5),
      color         : Color.WHITE,
      autoWidth     : false,
      autoFitWidth  : true,
      autoHeight    : false,
      autoFitHeight : true,
      minFontSize   : 45,
      maxFontSize   : 55,
      fontSize      : 50,
      width         : 400,
      wrapLines     : false,
      height        : 150,
      x             : 265,
      alignment     : new Vec2(0, 0.5),
    });
    this.addChild(this._currentLevel);
  }

  private _initCoinReward() {
    this._coinReward = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text          : 10,
      anchor        : new Vec4(0.5, 0.65, 0.5, 0.65),
      pivot         : new Vec2(0.5, 0.5),
      color         : Color.WHITE,
      autoWidth     : false,
      autoFitWidth  : true,
      autoHeight    : false,
      autoFitHeight : true,
      minFontSize   : 45,
      maxFontSize   : 55,
      fontSize      : 50,
      width         : 400,
      wrapLines     : false,
      height        : 150,
      y             : -100,
      alignment     : new Vec2(1, 0.5),
    });
    this.addChild(this._coinReward);
    this._coinReward.setLocalScale(0, 0, 0);

    this._coinIcon = ObjectFactory.createImageElement("spr_icon_currency", {
      anchor : new Vec4(0.5, 0.65, 0.5, 0.65),
      pivot  : new Vec2(0.5, 0.5),
      x      : 75,
      y      : -100,
    });
    this.addChild(this._coinIcon);
    this._coinIcon.setLocalScale(0, 0, 0);
  }

  private _initSliderRewardMultiple() {
    this.slider = ObjectFactory.createImageElement("spr_slider_reward_multiple", {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      y      : -100,
    });
    this.addChild(this.slider);
    this.slider.setLocalScale(0, 0, 0);

    let arrow = ObjectFactory.createImageElement("spr_icon_arrow", {
      x     : -350,
      y     : -75,
      scale : 0.75,
    });
    this.slider.addChild(arrow);

    let offset = 700 / 7; // 7 is the number of rewards, 700 is the width of the this.slider
    this._arrowMoveTween = Tween.createLocalTranslateTween(arrow, { x: 350 }, {
      duration : 1,
      loop     : true,
      yoyo     : true,
      onUpdate : () => {
        let posX = arrow.getLocalPosition().x;
        let index = Math.floor((posX + 350) / offset + 1);
        if (index <= 4) {
          this._coefficient = index + 1;
        }
        else {
          switch (index) {
          case 5:
            this._coefficient = 4;
            break;
          case 6:
            this._coefficient = 3;
            break;
          case 7:
            this._coefficient = 2;
            break;
          default:
            break;
          }
        }
        this._updateBonusCoin();
      },
    }).start();
    this._onResizeSliderRewardMultiple();
  }

  private _onResizeSliderRewardMultiple() {
  }

  private _initAdsButton() {
    this._adsButton = ObjectFactory.createButtonElement("spr_button_ads", {
      anchor : new Vec4(0.5, 0.2, 0.5, 0.2),
      pivot  : new Vec2(0.5, 0.5),
    });
    this._adsButton.button.on("click", this._onAdsButtonClicked.bind(this));
    this.addChild(this._adsButton);

    this._adsIcon = ObjectFactory.createImageElement("spr_icon_ads", {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      x      : -85,
      scale  : 0.75,
    });
    this._adsButton.addChild(this._adsIcon);

    this._textReward = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      pivot         : new Vec2(0.5, 0.5),
      anchor        : new Vec4(0.5, 0.5, 0.5, 0.5),
      color         : Color.WHITE,
      autoWidth     : false,
      autoFitWidth  : true,
      minFontSize   : 40,
      maxFontSize   : 50,
      autoHeight    : false,
      autoFitHeight : true,
      fontSize      : 45,
      width         : 300,
      text          : 100,
      wrapLines     : false,
      x             : 25,
    });
    this._adsButton.addChild(this._textReward);
  }

  private _initContinueButton() {
    this._continueButton = ObjectFactory.createButtonElement("spr_button_green", {
      anchor : new Vec4(0.5, 0.1, 0.5, 0.1),
      pivot  : new Vec2(0.5, 0.5),
      scale  : 1.25,
    });
    this._continueButton.button.on("click", this._onContinueButtonClicked.bind(this));
    this.addChild(this._continueButton);

    this._continueButtonText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      pivot         : new Vec2(0.5, 0.5),
      anchor        : new Vec4(0.5, 0.5, 0.5, 0.5),
      color         : Color.WHITE,
      autoWidth     : false,
      autoFitWidth  : true,
      minFontSize   : 30,
      maxFontSize   : 50,
      autoHeight    : false,
      autoFitHeight : true,
      fontSize      : 45,
      width         : 300,
      text          : "Continue",
      wrapLines     : false,
    });
    this._continueButtonText.element.key = "continue";
    this._continueButton.addChild(this._continueButtonText);

    // let continueIcon = ObjectFactory.createImageElement("spr_icon_currency", {
    //   anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
    //   pivot  : new Vec2(0.5, 0.5),
    //   x      : 65,
    // });
    // this._continueButton.addChild(continueIcon);
  }

  private _updateBonusCoin() {
    this._textReward.element.text = `+ ${this.rewardCoin * this._coefficient}`;
  }

  private _onAdsButtonClicked() {
    SoundManager.play("sfx_button");
    this._setInputStateAllButtons(false);
    this._arrowMoveTween?.stop();
    Game.pause();
    Tween.createCountTween(
      {
        duration   : 0.1,
        onComplete : () => {
          let reward = this.rewardCoin * (this._coefficient);
          Tween.createTween({ c: this.rewardCoin }, { c: reward }, {
            duration : 1,
            onUpdate : (obj: any) => {
              this._textReward.element.text = `+ ${Math.floor(obj.c)}`;
            },
            onComplete: () => {
              Game.resume();
              UserData.currency += (reward);
              Tween.createCountTween({
                duration   : 0.5,
                onComplete : () => {
                  this.fire(WinScreen.Event.BUTTON_NEXT_CLICKED);
                  this._setInputStateAllButtons(true);
                },
              }).start();
            },
          }).start();
        },
      },
    ).start();
  }

  private _onContinueButtonClicked() {
    this.fire(WinScreen.Event.BUTTON_NEXT_CLICKED);
    SoundManager.play("sfx_button");
  }

  public fadeIn() {
    Tween.createLocalTranslateTween(this._titleText, new Vec3(0, 0, 0), {
      duration : 0.3,
      easing   : Easing.Cubic.InOut,
    }).start();

    Tween.createScaleTween(this.slider, new Vec3(1, 1, 1), {
      duration : 0.5,
      easing   : Tween.Easing.Circular.InOut,
    }).start();

    Tween.createScaleTween(this._coinReward, new Vec3(1, 1, 1), {
      duration : 0.5,
      easing   : Tween.Easing.Circular.InOut,
    }).start();

    Tween.createScaleTween(this._coinIcon, new Vec3(1, 1, 1), {
      duration : 0.5,
      easing   : Tween.Easing.Circular.InOut,
    }).start();

    Tween.createScaleTween(this.levelText, new Vec3(1, 1, 1), {
      duration : 0.5,
      easing   : Tween.Easing.Circular.InOut,
    }).start();

    this._adsButton.setLocalScale(0, 0, 0);
    Tween.createScaleTween(this._adsButton, new Vec3(1, 1, 1), {
      duration   : 0.5,
      easing     : Tween.Easing.Circular.InOut,
      onComplete : () => {
        Tween.createScaleTween(this._adsButton, new Vec3(1.15, 1.15, 1.15), {
          duration : 0.5,
          loop     : true,
          yoyo     : true,
          easing   : Tween.Easing.Circular.InOut,
        }).start();
      },
    }).start();

    this._continueButton.setLocalScale(0, 0, 0);
    Tween.createScaleTween(this._continueButton, new Vec3(1, 1, 1), {
      duration : 0.5,
      easing   : Tween.Easing.Circular.InOut,
    }).start();
  }

  public fadeOut() {
    Tween.createLocalTranslateTween(this._titleText, new Vec3(-1000, 0, 0), {
      duration : 0.3,
      easing   : Easing.Cubic.InOut,
    }).start();

    Tween.createScaleTween(this.slider, new Vec3(0, 0, 0), {
      duration : 0.3,
      easing   : Tween.Easing.Circular.InOut,
    }).start();

    Tween.createScaleTween(this._coinReward, new Vec3(0, 0, 0), {
      duration : 0.3,
      easing   : Tween.Easing.Circular.InOut,
    }).start();

    Tween.createScaleTween(this._coinIcon, new Vec3(0, 0, 0), {
      duration : 0.3,
      easing   : Tween.Easing.Circular.InOut,
    }).start();

    Tween.createScaleTween(this.levelText, new Vec3(0, 0, 0), {
      duration : 0.3,
      easing   : Tween.Easing.Circular.InOut,
    }).start();

    Tween.createScaleTween(this._adsButton, new Vec3(0, 0, 0), {
      duration : 0.3,
      easing   : Tween.Easing.Circular.InOut,
    }).start();

    Tween.createScaleTween(this._continueButton, new Vec3(0, 0, 0), {
      duration : 0.3,
      easing   : Tween.Easing.Circular.InOut,
    }).start();
  }

  public setWin(coinReward: number, currentLevel: number) {
    this.rewardCoin = coinReward;
    this._currentLevel.element.text = currentLevel.toString();
    this._coinReward.element.text = `${coinReward}`;
  }

  private _checkIsRewardAdsAvailable() {
    this._activeButtonAds(true);
  }

  private _activeButtonAds(isActive: boolean) {
    this._adsButton.element.useInput = isActive;
    let opacity = isActive ? 1 : 0.25;
    this._adsButton.element.opacity = opacity;
    this._textReward.element.opacity = opacity;
    this._adsIcon.element.opacity = opacity;
  }

  private _setInputStateAllButtons(isActive: boolean) {
    this._adsButton.element.useInput = isActive;
    this._continueButton.element.useInput = isActive;
  }
}
