import { Easing } from "@tweenjs/tween.js";
import { Entity, Vec4, Vec2, Color, Vec3 } from "playcanvas";
import { GameConstant } from "../../../gameConstant";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { SoundManager } from "../../../template/soundManager";
import { Tween } from "../../../template/systems/tween/tween";
import { UIScreen } from "../../../template/ui/uiScreen";
import TutorialManager from "../../tutorials/tutorialManager";
import { Rotate } from "../components/rotate";

export class HomeScreen extends UIScreen {

  public static readonly Events = {
    OnShopButtonClicked     : "HomeScreen:OnShopButtonClicked",
    OnSettingsButtonClicked : "HomeScreen:OnSettingsButtonClicked",
    OnBackgroundTouched     : "HomeScreen:OnBackgroundTouched",
  };

  private _background: Entity;
  private _shopButton: Entity;
  private _settingsButton: Entity;
  private _hintIcon: Entity;
  private _loading: Entity;
  private _loadingIcon: Entity;

  constructor() {
    super(GameConstant.HOME_SCREEN_NAME);
  }

  override create() {
    super.create();
    this._initBackground();
    this._initShopButton();
    this._initSettingsButton();
    this._initLoading();

    this._onResizeBackground();
  }

  override resize() {
    super.resize();
    this._onResizeBackground();
  }

  override onActivated() {
    super.onActivated();
    this._onResizeBackground();
  }

  override onDeactivated() {
    super.onDeactivated();
  }

  private _initBackground() {
    this._background = ObjectFactory.createEmptyImageElement({
      width    : GameConstant.GAME_WIDTH,
      height   : GameConstant.GAME_HEIGHT,
      useInput : true,
    });
    this._background.element.opacity = 0;
    this.addChild(this._background);

    this._background.element.useInput = true;
    this._background.element.on("mousedown", this._onBackgroundTouched.bind(this));
    this._background.element.on("touchstart", this._onBackgroundTouched.bind(this));
  }

  private _onBackgroundTouched() {
    if (TutorialManager.instance.showingTutorial) {
      return;
    }
    this._background.element.useInput = false;
    this.fire(HomeScreen.Events.OnBackgroundTouched);
  }

  private _onResizeBackground() {
    let res = this.screen.resolution;
    let width = res.x / this.screen.scale;
    let height = res.y / this.screen.scale;
    let scale = 1 / Math.min(width / GameConstant.GAME_WIDTH, height / GameConstant.GAME_HEIGHT);
    this._background?.setLocalScale(scale, scale, 1);
  }

  private _initLoading() {
    this._loading = ObjectFactory.createEmptyImageElement({
      color    : Color.BLACK,
      opacity  : 0.65,
      useInput : true,
    });
    this._loading.element.anchor = new Vec4(0, 0, 1, 1);
    this.addChild(this._loading);

    this._loadingIcon = new Entity("loadingIcon");
    this._loadingIcon = ObjectFactory.createImageElement("spr_icon_loading", {
      anchor: new Vec4(0.5, 0.5, 0.5, 0.5),
    });
    this.addChild(this._loadingIcon);
    this._loadingIcon.addScript(Rotate, {
      attributes: {
        speed: new Vec3(0, 0, -300),
      },
    });
    this._showLoading(false);
  }

  private _showLoading(active: boolean) {
    this._loading.enabled = active;
    this._loadingIcon.enabled = active;
  }

  private _initShopButton() {
    this._shopButton = ObjectFactory.createButtonElement("spr_btn_shop", {
      anchor : new Vec4(0, 0.6, 0, 0.6),
      pivot  : new Vec2(0, 0.5),
      x      : 25,
    });
    this.addChild(this._shopButton);
    this._shopButton.name = "buttonShop";
    this._shopButton.element.on("click", this._onShopButtonClicked.bind(this));

    this._hintIcon = ObjectFactory.createImageElement("tex_icon_alert", {
      anchor : new Vec4(1, 1, 1, 1),
      pivot  : new Vec2(0.5, 0.5),
      scale  : 0.85,
      y      : -10,
      x      : -5,
    });
    this._shopButton.addChild(this._hintIcon);
    this._hintIcon.enabled = false;

    let tween1 = Tween.createRotateTween(this._hintIcon, { z: 10 }, {
      duration : 0.1,
      repeat   : 5,
      yoyo     : true,
      easing   : Tween.Easing.Quadratic.InOut,
    });
    let tween2 = Tween.createCountTween({
      duration: 0.5,
    });

    tween1.chain(tween2);
    tween2.chain(tween1);
    tween1.start();
  }

  private _onShopButtonClicked() {
    SoundManager.play("sfx_button");
    this.fire(HomeScreen.Events.OnShopButtonClicked);
  }

  private _initSettingsButton() {
    this._settingsButton = ObjectFactory.createButtonElement("spr_btn_setting", {
      anchor : new Vec4(0, 1, 0, 1),
      pivot  : new Vec2(0, 1),
      x      : 25,
      y      : -35,
    });
    this.addChild(this._settingsButton);
    this._settingsButton.element.on("click", this._onSettingsButtonClicked.bind(this));
  }

  private _onSettingsButtonClicked() {
    this.fire(HomeScreen.Events.OnSettingsButtonClicked);
  }

  public fadeOut() {
    Tween.createLocalTranslateTween(this._settingsButton, new Vec3(-300, -35, 0), {
      duration : 0.3,
      easing   : Easing.Back.InOut,
    }).start();

    Tween.createLocalTranslateTween(this._shopButton, new Vec3(-300, -35, 0), {
      duration : 0.3,
      easing   : Easing.Back.InOut,
    }).start();

    Tween.createLocalTranslateTween(this._shopButton, new Vec3(-300, -35, 0), {
      duration : 0.3,
      easing   : Easing.Back.InOut,
    }).start();
  }

  public fadeIn() {
    this._background.element.useInput = true;
    Tween.createLocalTranslateTween(this._settingsButton, new Vec3(25, -35, 0), {
      duration : 0.3,
      easing   : Easing.Back.InOut,
    }).start();

    Tween.createLocalTranslateTween(this._shopButton, new Vec3(25, -35, 0), {
      duration : 0.3,
      easing   : Easing.Back.InOut,
    }).start();
  }

  public showHint(active: boolean) {
    this._hintIcon.enabled = active;
  }
}
