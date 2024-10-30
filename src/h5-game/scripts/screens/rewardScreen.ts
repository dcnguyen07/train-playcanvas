import { Easing } from "@tweenjs/tween.js";
import { Color, Entity, Vec4, Vec2, ORIENTATION_VERTICAL } from "playcanvas";
import { Game } from "../../../game";
import { GameConstant } from "../../../gameConstant";
import { AssetManager } from "../../../template/assetManager";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { SoundManager } from "../../../template/soundManager";
import { Tween } from "../../../template/systems/tween/tween";
import { UIScreen } from "../../../template/ui/uiScreen";
import { ShopData } from "../../data/shopData";
import { UserData } from "../../data/userData";
import { ProgressBar } from "../../screens/uiElements/progressBars/progressBar";
import { RewardPopup } from "../../screens/uiElements/rewardPopup";

export class RewardScreen extends UIScreen {

  public static readonly Event = {
    BACK_TO_MAIN            : "backToMain",
    BUTTON_CONTINUE_CLICKED : "buttonContinueClicked",
  };

  private _background: Entity;
  private _titleText: Entity;
  private _carFrame: Entity;
  private _carModelSkin: Entity;
  private _carSkin: Entity;
  private _progressBar: ProgressBar;
  private _buttonGroup: Entity;
  private _adsButton: Entity;
  private _adsIcon: Entity;
  private _adsText: Entity;
  private _continueButton: Entity;
  private _rewardPopup: RewardPopup;
  private _tweenContinueButton: Tween;
  private _tweenAdsButtonBigScale: Tween;
  private _tweenAdsButtonLoopScale: Tween;
  private _tweenScaleDownItem: Tween;
  private _tweenScaleUpItem: Tween;

  private _isProgressFilled: boolean = false;
  private _tweenScaleDuration: number = 0.5;
  private _currentRandomSkin: string;

  private _checkRewardAdsIntervalID: any;

  constructor() {
    super(GameConstant.REWARD_SCREEN_NAME);
  }

  override create() {
    super.create();
    this._initBackground();
    this._initTitleText();
    this._initCarIcon();
    this._initProgressBar();
    this._initGroupButton();
    this._initRewardPopup();

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

    this._disableButtons();
    this._updateProgress();
    this._rewardPopup.setActive(false);
    this._checkIsRewardAdsAvailable();
    this._carSkin.setLocalScale(0, 0, 1);
    this._carModelSkin.setLocalScale(1, 1, 1);
  }

  override onDeactivated() {
    super.onDeactivated();
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
  }

  private _initRewardPopup() {
    this._rewardPopup = new RewardPopup();
    this._rewardPopup.on(RewardPopup.Event.CLAIM_IT_BUTTON_CLICKED, () => {
      this.fire(RewardScreen.Event.BACK_TO_MAIN);
    });
    this.addChild(this._rewardPopup);
    this._rewardPopup.setActive(false);
  }

  private _onResizeComponents() {
    if (Game.isPortrait) {
      this._titleText?.setLocalPosition(0, 150, 0);
      this._buttonGroup?.setLocalPosition(0, 200, 0);
      this._carFrame?.setLocalScale(1, 1, 1);
      this._carFrame?.setLocalPosition(0, 135, 0);
    }
    else {
      this._titleText?.setLocalPosition(0, 100, 0);
      this._buttonGroup?.setLocalPosition(0, 0, 0);
      this._carFrame?.setLocalScale(0.65, 0.65, 1);
      this._carFrame?.setLocalPosition(0, 80, 0);
    }
  }

  private _initGroupButton() {
    this._buttonGroup = ObjectFactory.createLayoutGroupElement({
      orientation : ORIENTATION_VERTICAL,
      spacing     : new Vec2(0, 100),
      anchor      : new Vec4(0.5, 0.2, 0.5, 0.2),
      pivot       : new Vec2(0.5, 0.5),
    });
    this.addChild(this._buttonGroup);

    this._initContinueButton();
    this._initAdsButton();
  }

  private _initAdsButton() {
    this._adsButton = ObjectFactory.createButtonElement("spr_button_ads", {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
    });
    this._buttonGroup.addChild(this._adsButton);

    this._adsIcon = ObjectFactory.createImageElement("spr_icon_ads", {
      anchor : new Vec4(0.2, 0.5, 0.2, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      scale  : 0.85,
    });
    this._adsButton.addChild(this._adsIcon);

    this._adsText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text          : "CLAIM",
      anchor        : new Vec4(0.6, 0.5, 0.6, 0.5),
      pivot         : new Vec2(0.5, 0.5),
      color         : Color.WHITE,
      fontSize      : 40,
      minFontSize   : 30,
      maxFontSize   : 50,
      autoWidth     : false,
      autoFitWidth  : true,
      autoHeight    : false,
      autoFitHeight : true,
      width         : 250,
    });
    this._adsText.element.isUpperCase = true;
    this._adsText.element.key = "claim";
    this._adsButton.addChild(this._adsText);
    this._adsButton.element.on("click", this._onAdsButtonClicked, this);

    this._tweenAdsButtonBigScale = Tween.createTween({ scale: 0 }, { scale: 1 }, {
      duration : this._tweenScaleDuration,
      easing   : Easing.Back.Out,
      onUpdate : (data: any) => {
        this._adsButton.setLocalScale(data.scale, data.scale, 1);
      },
    });

    this._tweenAdsButtonLoopScale = Tween.createTween({ scale: 1 }, { scale: 1.25 }, {
      duration : this._tweenScaleDuration,
      loop     : true,
      yoyo     : true,
      onUpdate : (data: any) => {
        this._adsButton.setLocalScale(data.scale, data.scale, 1);
      },
    });
  }

  private _onAdsButtonClicked() {
    SoundManager.play("sfx_button");
    this._setInputStateAllButtons(false);
    Tween.createCountTween({
      duration   : 0.1,
      onComplete : () => {
        this._rewardPopup.setIcon(this._currentRandomSkin);
        this._rewardPopup.setActive(true);
        this._isProgressFilled = false;
        this._progressBar.resetProgress();
        UserData.progressRewardSkin = 0;
        UserData.unlockSkin(this._currentRandomSkin);
        UserData.currentSkin = this._currentRandomSkin;
        this._setInputStateAllButtons(true);
      },
    }).start();
  }

  private _initContinueButton() {
    this._continueButton = ObjectFactory.createButtonElement("spr_button_green", {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
    });
    this._buttonGroup.addChild(this._continueButton);

    let continueText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text          : "CONTINUE",
      anchor        : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot         : new Vec2(0.5, 0.5),
      color         : Color.WHITE,
      fontSize      : 40,
      minFontSize   : 30,
      maxFontSize   : 50,
      autoWidth     : false,
      autoFitWidth  : true,
      autoHeight    : false,
      autoFitHeight : true,
      width         : 300,
    });
    continueText.element.isUpperCase = true;
    continueText.element.key = "continue";
    this._continueButton.addChild(continueText);
    this._continueButton.element.on("click", this._onContinueButtonClicked, this);

    this._tweenContinueButton = Tween.createTween({ scale: 0 }, { scale: 1 }, {
      duration : this._tweenScaleDuration,
      easing   : Easing.Back.Out,
      onUpdate : (data: any) => {
        this._continueButton.setLocalScale(data.scale, data.scale, 1);
      },
    });
  }

  private _onContinueButtonClicked() {
    this.fire(RewardScreen.Event.BUTTON_CONTINUE_CLICKED);
    SoundManager.play("sfx_button");
    if (this._isProgressFilled) {
      this._isProgressFilled = false;
      this._progressBar.resetProgress();
      UserData.progressRewardSkin = 0;
    }
  }

  private _initTitleText() {
    this._titleText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text          : "REWARD",
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
    this._titleText.element.isUpperCase = true;
    this._titleText.element.key = "reward";
    this.addChild(this._titleText);
  }

  private _initCarIcon() {
    this._carFrame = ObjectFactory.createImageElement("spr_frame_car_icon", {
      anchor : new Vec4(0.5, 0.65, 0.5, 0.65),
      pivot  : new Vec2(0.5, 0.5),
    });
    this.addChild(this._carFrame);

    this._carModelSkin = ObjectFactory.createImageElement("spr_icon_car_6", {
      anchor  : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot   : new Vec2(0.5, 0.5),
      scale   : 2,
      color   : Color.BLACK,
      opacity : 0.85,
    });
    this._carFrame.addChild(this._carModelSkin);

    this._carSkin = ObjectFactory.createImageElement("spr_icon_car_6", {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      scale  : 2,
    });
    this._carFrame.addChild(this._carSkin);
    this._carSkin.setLocalScale(0, 0, 1);

    this._tweenScaleDownItem = Tween.createTween({ scale: 1 }, { scale: 0 }, {
      duration : this._tweenScaleDuration,
      easing   : Easing.Back.In,
      onUpdate : (data: any) => {
        this._carModelSkin.setLocalScale(data.scale, data.scale, 1);
      },
    });

    this._tweenScaleUpItem = Tween.createTween({ scale: 0 }, { scale: 1 }, {
      duration : this._tweenScaleDuration,
      easing   : Easing.Back.Out,
      onUpdate : (data: any) => {
        this._carSkin.setLocalScale(data.scale, data.scale, 1);
      },
    });
  }

  private _initProgressBar() {
    this._progressBar = new ProgressBar();
    this.addChild(this._progressBar);
  }

  private _updateProgress() {
    let currentProgress = UserData.progressRewardSkin / 100;
    let targetProgress = currentProgress + GameConstant.PROGRESS_VALUE_INCREASE;
    this._isProgressFilled = false;
    if (targetProgress >= 1) {
      this._isProgressFilled = true;
      targetProgress = 1;
      this._randomRewardSkin();
    }
    this._progressBar.setCurrentProgress(currentProgress);
    this._progressBar.updateProgress(targetProgress);
    this._progressBar.updateText(currentProgress * 100, targetProgress * 100);
    UserData.progressRewardSkin = targetProgress * 100;
    Tween.createCountTween({
      duration   : 1,
      onComplete : () => {
        this._setButtonState();
      },
    }).start();
  }

  private _randomRewardSkin() {
    const skinsUnlockedSet = new Set(UserData.skinUnlocked);
    const filteredSkins = ShopData.getAllItemNames().filter((skin) => !skinsUnlockedSet.has(skin) && skin !== GameConstant.TUTORIAL_SKIN);

    if (filteredSkins.length === 0) {
      return;
    }

    const randomSkin = filteredSkins[Math.floor(Math.random() * filteredSkins.length)];
    const nameSkinIcon = ShopData.getIconSkinByName(randomSkin);
    this._currentRandomSkin = randomSkin;

    const spriteResource = AssetManager.find(nameSkinIcon)?.resource;
    if (spriteResource) {
      this._carSkin.element.sprite = spriteResource;
      Tween.createCountTween({
        duration   : 0.75,
        onComplete : () => {
          this._tweenScaleDownItem.start().chain(this._tweenScaleUpItem);
        },
      }).start();
    }
  }

  private _setButtonState() {
    this._continueButton.enabled = true;
    this._tweenContinueButton.start();
    this._adsButton.enabled = this._isProgressFilled;
    if (this._isProgressFilled) {
      this._tweenAdsButtonBigScale.start().chain(this._tweenAdsButtonLoopScale);
    }
  }

  private _disableButtons() {
    this._adsButton.enabled = false;
    this._adsButton.setLocalScale(0, 0, 1);
    this._continueButton.enabled = false;
    this._continueButton.setLocalScale(0, 0, 1);
  }

  private _checkIsRewardAdsAvailable() {
    this._activeButtonAds(true);
  }

  private _activeButtonAds(isActive: boolean) {
    this._adsButton.element.useInput = isActive;
    let opacity = isActive ? 1 : 0.25;
    this._adsButton.element.opacity = opacity;
    this._adsText.element.opacity = opacity;
    this._adsIcon.element.opacity = opacity;
  }

  private _setInputStateAllButtons(isActive: boolean) {
    this._continueButton.element.useInput = isActive;
    this._adsButton.element.useInput = isActive;
  }
}
