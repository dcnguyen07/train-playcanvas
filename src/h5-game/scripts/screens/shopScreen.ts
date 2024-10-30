import {
  Entity,
  Color,
  Vec4,
  Vec2,
  Layer,
  Texture,
  PIXELFORMAT_RGBA8,
  FILTER_LINEAR,
  ADDRESS_CLAMP_TO_EDGE,
  RenderTarget,
  StandardMaterial, BLEND_NORMAL, ELEMENTTYPE_IMAGE, Vec3,
} from "playcanvas";
import { Game } from "../../../game";
import { GameConstant } from "../../../gameConstant";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { SoundManager } from "../../../template/soundManager";
import { Tween } from "../../../template/systems/tween/tween";
import { UIScreen } from "../../../template/ui/uiScreen";
import { ShopData } from "../../data/shopData";
import { UserData } from "../../data/userData";
import ResourceHelper from "../../objects/ResourceHelper";
import { ShopView } from "../../screens/uiElements/shopView";
import { ShopViewItem } from "../../screens/uiElements/shopViewItem";
import TutorialManager from "../../tutorials/tutorialManager";
import { Rotate } from "../components/rotate";

export class ShopScreen extends UIScreen {

  public static readonly Event = {
    BackButtonClicked: "back-button-clicked",
  };

  private _background: Entity;
  private _backButton: Entity;
  private _buyButton: Entity;
  private _textPrice: Entity;
  private _currencyIcon: Entity;
  private _adsButton: Entity;
  private _shopView: ShopView;
  private _adsIcon: Entity;
  private _adsText: Entity;
  private _currencyIconAds: Entity;
  private _currentItemSelected: ShopViewItem;
  private _shopData: any;
  private _carModel: Entity;
  private _platformModel: Entity;
  private _shopCamera: Entity;
  private _renderTargetsElement: Entity;
  private _loading: Entity;
  private _loadingIcon: Entity;
  private _fakePointTutorial: Entity;

  private _checkRewardAdsIntervalID: any;

  constructor() {
    super(GameConstant.SHOP_SCREEN_NAME);
  }

  override create() {
    super.create();

    this._shopData = ShopData.getData();
    this._initBackground();
    this._createRenderTargetsElement();
    this._initCarModel();
    this._initBackButton();
    this._initShopView();
    this._initGroupButton();
    this._initLoading();
    this._initFakePointTutorial();

    this._onResizeBackground();
    this._onResizeComponents();
  }

  override resize() {
    super.resize();
    this._onResizeBackground();
    this._onResizeComponents();
    this._shopView.onResize();
  }

  override onActivated() {
    super.onActivated();
    this._onResizeBackground();
    this._onResizeComponents();

    this._shopView.onActivated();
    this._setDefaultBuyButtonState();
    this._loadCurrentModel();
    this._checkIsRewardAdsAvailable();
    this._showShopTutorial();
  }

  override onDeactivated() {
    super.onDeactivated();
  }

  private _showShopTutorial() {
    if (TutorialManager.instance.showingTutorial) {
      this._fakePointTutorial.enabled = true;
    }
    else {
      this._fakePointTutorial.enabled = false;
    }
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

  private _initFakePointTutorial() {
    this._fakePointTutorial = ObjectFactory.createEmptyImageElement({
      color    : Color.GREEN,
      width    : 220,
      height   : 220,
      anchor   : new Vec4(0.5, 0.7, 0.5, 0.7),
      pivot    : new Vec2(0.5, 0.5),
      x        : 0,
      opacity  : 0.01,
      useInput : true,
    });
    this._shopView.addChild(this._fakePointTutorial);
    this._fakePointTutorial.addComponent("button", {
      active: true,
    });

    this._fakePointTutorial.button.on("click", (event: any) => {
      if (UserData.skinUnlocked.length === GameConstant.TOTAL_CAR_SKINS) {
        return;
      }

      this._shopView.onTutorialItemClick();
    });

    this._fakePointTutorial.name = "fake-point-tutorial";
  }

  private _onResizeComponents() {
    if (Game.isLandscape) {
      this._buyButton?.setLocalPosition(0, 50, 0);
      this._adsButton?.setLocalPosition(0, 50, 0);
      this._carModel?.setLocalPosition(0.15, 1000.25, 0);
      this._platformModel?.setLocalPosition(0.15, 1000.25, 0);
      this._carModel?.setLocalScale(0.65, 0.65, 0.65);
      this._platformModel?.setLocalScale(0.7, 0.7, 0.7);
      this._fakePointTutorial?.setLocalScale(0.75, 0.75, 0.75);
      this._fakePointTutorial?.setLocalPosition(0, -165, 0);
    }
    else {
      this._buyButton?.setLocalPosition(0, 0, 0);
      this._adsButton?.setLocalPosition(0, 0, 0);
      this._carModel?.setLocalPosition(0.15, 1000.5, 0);
      this._platformModel?.setLocalPosition(0.15, 1000.5, 0);
      this._carModel?.setLocalScale(0.75, 0.75, 0.75);
      this._platformModel?.setLocalScale(0.8, 0.8, 0.8);
      this._fakePointTutorial?.setLocalScale(1, 1, 1);
      this._fakePointTutorial?.setLocalPosition(0, 0, 0);
    }
  }

  private _createRenderTargetsElement() {
    let layer = new Layer({
      name: "shopLayer",
    });
    Game.app.scene.layers.insert(layer, 1);
    const worldLayer = Game.app.scene.layers.getLayerByName("World");
    const texture = new Texture(Game.app.graphicsDevice, {
      width     : 1280,
      height    : 1000,
      format    : PIXELFORMAT_RGBA8,
      mipmaps   : true,
      minFilter : FILTER_LINEAR,
      magFilter : FILTER_LINEAR,
      addressU  : ADDRESS_CLAMP_TO_EDGE,
      addressV  : ADDRESS_CLAMP_TO_EDGE,
    });

    let renderTarget = new RenderTarget({
      name        : "RT",
      colorBuffer : texture,
      depth       : true,
      flipY       : true,
      samples     : 2,
    });

    this._shopCamera = new Entity("shopCamera");
    this._shopCamera.addComponent("camera", {
      clearColor   : new Color(0, 0, 0, 0),
      nearClip     : 0.1,
      farClip      : 1000,
      fov          : 60,
      priority     : -1,
      renderTarget : renderTarget,
      layers       : [layer.id, worldLayer.id],
    });

    this._shopCamera.setLocalPosition(0, 1002, 3);
    this.addChild(this._shopCamera);
    this._shopCamera.lookAt(0, 1000, 0);
    this._shopCamera.camera.clearColorBuffer;

    this._renderTargetsElement = new Entity("renderTargetsElement");
    this._renderTargetsElement.addComponent("element", {
      type   : ELEMENTTYPE_IMAGE,
      anchor : new Vec4(0.5, 0.7, 0.5, 0.7),
      pivot  : new Vec2(0.5, 0.5),
      width  : 1024,
      height : 1024,
    });
    this._renderTargetsElement.setLocalPosition(-50, 0, 0);

    let material = new StandardMaterial();
    material.diffuseMap = texture;
    material.blendType = BLEND_NORMAL;
    material.opacityMap = texture;
    material.update();
    material.emissiveMap = texture;
    this._renderTargetsElement.element.material = material;
    this.addChild(this._renderTargetsElement);
  }

  private async _initCarModel() {
    this._carModel = new Entity();
    this.addChild(this._carModel);

    let currentShopItem = this._shopData.find((item: any) => item.name === UserData.currentSkin);
    let currentCarModel = GameConstant.USER_DATA_DEFAULT_CAR_MODEL;
    if (currentShopItem) {
      currentCarModel = currentShopItem.model;
    }
    let modelAsset = await ResourceHelper.loadModel(currentCarModel);
    this._carModel.addComponent("model", {
      type  : "asset",
      asset : modelAsset,
    });

    this._platformModel = new Entity();
    this.addChild(this._platformModel);

    let platformModelAsset = await ResourceHelper.loadModel("model_platform");
    this._platformModel.addComponent("model", {
      type  : "asset",
      asset : platformModelAsset,
    });

    this._carModel.setLocalEulerAngles(0, 0, 0);
    this._carModel.setLocalPosition(0.1, 1000, 0);
    this._carModel.setLocalScale(0.75, 0.75, 0.75);

    this._platformModel.setLocalEulerAngles(0, 0, 0);
    this._platformModel.setLocalPosition(0.1, 1000, 0);
    this._platformModel.setLocalScale(0.65, 0.65, 0.65);

    this._carModel.addScript(Rotate, {
      attributes: {
        speed: new Vec3(0, -35, 0),
      },
    });

    this._platformModel.addScript(Rotate, {
      attributes: {
        speed: new Vec3(0, -35, 0),
      },
    });
  }

  private async changeCarModel(modelId: string) {
    let modelAsset = await ResourceHelper.loadModel(modelId);
    this._carModel.model.asset = modelAsset;
  }

  private _initBackButton() {
    this._backButton = ObjectFactory.createButtonElement("spr_btn_back",
      {
        anchor : new Vec4(0, 1, 0, 1),
        pivot  : new Vec2(0.5, 0.5),
        x      : 100,
        y      : -100,
      });
    this._backButton.element.on("click", this._onBackButtonClicked.bind(this));
    this.addChild(this._backButton);
  }

  private _initShopView() {
    this._shopView = new ShopView(this._shopData);
    this.addChild(this._shopView);
    this._shopView.on(ShopView.CLICK_ITEM, this._onItemSelected.bind(this));
  }

  private _onBackButtonClicked() {
    SoundManager.play("sfx_button");
    this.fire(ShopScreen.Event.BackButtonClicked);
  }

  private _onItemSelected(item: any) {
    this._currentItemSelected = item;
    this._showLoading(true);
    this.changeCarModel(item.getModelName()).then(() => {
      this._showLoading(false);
    });
    const isItemUnlocked = this._currentItemSelected?.isUnlocked;
    const isItemCanBuy = UserData.currency >= this._currentItemSelected?.getPrice() && !isItemUnlocked;
    this._textPrice.element.text = item.getPrice();
    this._setBuyButtonState(isItemCanBuy);
  }

  private _initGroupButton() {
    this._initBuyButton();
    this._initAdsButton();
  }

  private _initBuyButton() {
    this._buyButton = ObjectFactory.createButtonElement("spr_button_green",
      {
        anchor : new Vec4(0.2, 0.05, 0.2, 0.05),
        pivot  : new Vec2(0.5, 0.5),
        scale  : 1.25,
      });
    this._buyButton.element.on("click", this._onBuyButtonClicked.bind(this));
    this.addChild(this._buyButton);
    this._buyButton.name = "buy-by-coin";

    this._currencyIcon = ObjectFactory.createImageElement("spr_icon_currency", {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      x      : 100,
      scale  : 1.25,
    });
    this._buyButton.addChild(this._currencyIcon);

    this._textPrice = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text     : "100",
      anchor   : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot    : new Vec2(0.5, 0.5),
      x        : -50,
      color    : Color.WHITE,
      fontSize : 50,
    });
    this._buyButton.addChild(this._textPrice);
  }

  private _onBuyButtonClicked() {
    SoundManager.play("sfx_button");
    UserData.currency -= this._currentItemSelected.getPrice();
    this._currentItemSelected.unlockItem();
    this._shopView.updateItemsState();
    this._setBuyButtonState(false);
  }

  private _initAdsButton() {
    this._adsButton = ObjectFactory.createButtonElement("spr_btn_orange",
      {
        anchor : new Vec4(0.8, 0.05, 0.8, 0.05),
        pivot  : new Vec2(0.5, 0.5),
        scale  : 1.25,
      });
    this._adsButton.element.on("click", this._onAdsButtonClicked.bind(this));
    this.addChild(this._adsButton);

    this._adsIcon = ObjectFactory.createImageElement("spr_icon_ads", {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      x      : -115,
    });
    this._adsButton.addChild(this._adsIcon);

    this._adsText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text     : `+${GameConstant.DEFAULT_GET_CURRENCY_BY_ADS}`,
      anchor   : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot    : new Vec2(0.5, 0.5),
      x        : 15,
      color    : Color.WHITE,
      fontSize : 50,
    });
    this._adsButton.addChild(this._adsText);

    this._currencyIconAds = ObjectFactory.createImageElement("spr_icon_currency", {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      x      : 125,
      scale  : 1.25,
    });
    this._adsButton.addChild(this._currencyIconAds);
  }

  private _onAdsButtonClicked() {
    SoundManager.play("sfx_button");
    this._setInputStateAllButtons(false);
    Tween.createCountTween({
      duration   : 0.1,
      onComplete : () => {
        UserData.currency += GameConstant.DEFAULT_GET_CURRENCY_BY_ADS;
        this._setInputStateAllButtons(true);
        this._checkIsRewardAdsAvailable();
      },
    }).start();
  }

  private _setBuyButtonState(isCanBuy: boolean) {
    const opacity = isCanBuy ? 1 : 0.5;
    this._buyButton.element.opacity = opacity;
    this._textPrice.element.opacity = opacity;
    this._currencyIcon.element.opacity = opacity;
    this._buyButton.element.useInput = isCanBuy;
  }

  private _setDefaultBuyButtonState() {
    this._textPrice.element.text = ShopData.getShopItemByName(UserData.currentSkin).price.toString();
    this._setBuyButtonState(false);
  }

  private _loadCurrentModel() {
    this._showLoading(true);
    this.changeCarModel(ShopData.getShopItemByName(UserData.currentSkin).model).then(() => {
      this._showLoading(false);
    });
  }

  public onCurrencyChanged(currency: number) {
    const isItemUnlocked = this._currentItemSelected?.isUnlocked;
    const isItemCanBuy = currency >= this._currentItemSelected?.getPrice() && !isItemUnlocked;
    this._setBuyButtonState(isItemCanBuy);
    return this._shopView.updateItemsState();
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
    this._currencyIconAds.element.opacity = opacity;
  }

  private _setInputStateAllButtons(isActive: boolean) {
    this._buyButton.element.useInput = isActive;
    this._adsButton.element.useInput = isActive;
  }
}
