import { Entity, Vec4, Vec2, Color } from "playcanvas";
import { GameConstant } from "../../../gameConstant";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { UIScreen } from "../../../template/ui/uiScreen";
import { UserData } from "../../data/userData";

export class CurrencyScreen extends UIScreen {

  private _background: Entity;
  private _frameCurrency: Entity;
  private _textCurrency: Entity;
  private _iconCurrency: Entity;

  constructor() {
    super(GameConstant.CURRENCY_SCREEN_NAME);
  }

  override create() {
    super.create();
    this._initBackground();
    this._initCurrencyFrame();

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
      useInput : false,
    });
    this._background.element.opacity = 0;
    this.addChild(this._background);
    this._onResizeBackground();
  }

  private _onResizeBackground() {
    let res = this.screen.resolution;
    let width = res.x / this.screen.scale;
    let height = res.y / this.screen.scale;
    let scale = 1 / Math.min(width / GameConstant.GAME_WIDTH, height / GameConstant.GAME_HEIGHT);
    this._background?.setLocalScale(scale, scale, 1);
  }

  private _initCurrencyFrame() {
    this._frameCurrency = ObjectFactory.createImageElement("spr_currency_background", {
      anchor : new Vec4(1, 1, 1, 1),
      pivot  : new Vec2(1, 1),
      x      : -25,
      y      : -35,
      scale  : 1.75,
    });
    this.addChild(this._frameCurrency);

    this._iconCurrency = ObjectFactory.createImageElement("spr_icon_currency", {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      x      : -100,
    });
    this._frameCurrency.addChild(this._iconCurrency);

    this._textCurrency = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text     : UserData.currency.toString(),
      fontSize : 55,
      color    : Color.WHITE,
      anchor   : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot    : new Vec2(0.5, 0.5),
      x        : 35,
    });
    this._frameCurrency.addChild(this._textCurrency);
  }

  public onUpdateCurrency(currency: number) {
    this._textCurrency.element.text = currency.toString();
  }
}
