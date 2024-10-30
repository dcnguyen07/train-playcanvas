import { Entity, Vec2, Vec4, Color, ELEMENTTYPE_GROUP } from "playcanvas";
import { GameConstant } from "../../../gameConstant";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { Tween } from "../../../template/systems/tween/tween";
import { UserData } from "../../data/userData";

export class ShopViewItem extends Entity {

  static readonly EVENTS = {
    UNLOCK_ITEM: "shopViewItem:clickItem",
  };

  private _background: any;
  private _iconItem: Entity;
  private _rectActive!: Entity;
  private _iconTick!: Entity;
  private _backgroundLock: Entity;
  private _hint: Entity;
  private _data: any;
  private _textPrice: Entity;

  public isUnlocked: boolean = false;

  constructor(data: any) {
    super();

    this._data = data;
    this.isUnlocked = UserData.isSkinUnlocked(data.name);
    this.addComponent("element", {
      type   : ELEMENTTYPE_GROUP,
      anchor : new Vec4(0, 0, 0, 0),
      pivot  : new Vec2(0.5, 0.5),
      width  : 230,
      height : 254,
    });
    this._createBackground();
    this._createLockBackground();
    this._createRectActive();
    this._createIconTick();
    this._createHint();
    this._createIcon();
    this.updateState();
  }

  private _createBackground() {
    this._background = ObjectFactory.createImageElement("spr_background_item_active", {
      useInput: true,
    });
    this.addChild(this._background);
  }

  private _createIcon() {
    this._iconItem = ObjectFactory.createImageElement(`${this._data.iconSprite}`, {
      useInput : true,
      anchor   : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot    : new Vec2(0.5, 0.5),
      scale    : 1.25,
      y        : 25,
    });
    this.addChild(this._iconItem);
  }

  private _createRectActive() {
    this._rectActive = ObjectFactory.createImageElement("spr_boder_item_active", {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
    });
    this.addChild(this._rectActive);
    this._rectActive.enabled = false;
  }

  private _createIconTick() {
    this._iconTick = ObjectFactory.createImageElement("spr_icon_tick", {
      anchor : new Vec4(1, 1, 1, 1),
      pivot  : new Vec2(0.5, 0.5),
      y      : -5,
      x      : -5,
      scale  : 1.35,
    });
    this.addChild(this._iconTick);
    this._iconTick.enabled = false;
  }

  private _createLockBackground() {
    this._backgroundLock = ObjectFactory.createImageElement("spr_lock", {
      useInput: true,
    });
    this.addChild(this._backgroundLock);

    let currencyIcon = ObjectFactory.createImageElement("spr_icon_currency", {
      anchor : new Vec4(1, 0, 1, 0),
      pivot  : new Vec2(0.5, 0.5),
      x      : -50,
      y      : 35,
      scale  : 0.85,
    });
    this._backgroundLock.addChild(currencyIcon);

    this._textPrice = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text     : `${this._data.price}`,
      color    : Color.WHITE,
      anchor   : new Vec4(0.5, 0, 0.5, 0),
      pivot    : new Vec2(0.5, 0.5),
      fontSize : 35,
      x        : -20,
      y        : 35,
    });
    this._backgroundLock.addChild(this._textPrice);
  }

  private _createHint() {
    this._hint = ObjectFactory.createImageElement("tex_icon_alert", {
      anchor : new Vec4(1, 1, 1, 1),
      pivot  : new Vec2(0.5, 0.5),
      scale  : 0.85,
      x      : -10,
      y      : -5,
    });
    this.addChild(this._hint);
    this._hint.enabled = false;

    let tween1 = Tween.createRotateTween(this._hint, { z: 10 }, {
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

  public updateState() {
    this._background.enabled = this.isUnlocked;
    this._backgroundLock.enabled = !this.isUnlocked;
    if (!this.isUnlocked && UserData.currency >= this._data.price) {
      this._activeHint(true);
      return true;
    }
    else if (!this.isUnlocked && UserData.currency < this._data.price) {
      this._activeHint(false);
      return false;
    }
    return false;
  }

  private _activeHint(active) {
    this._hint.enabled = active;
  }

  public getHintState() {
    return this._hint.enabled;
  }

  public active() {
    this._rectActive.enabled = true;
    this._iconTick.enabled = this.isUnlocked;
    if (this.isUnlocked) {
      UserData.currentSkin = this._data.name;
    }
  }

  public deactive() {
    this._rectActive.enabled = false;
    this._iconTick.enabled = false;
  }

  public unlockItem() {
    this.isUnlocked = true;
    this._hint.enabled = false;
    UserData.unlockSkin(this._data.name);
    UserData.currentSkin = this._data.name;
  }

  public getPrice() {
    return this._data.price;
  }

  public getModelName() {
    return this._data.model;
  }

  public getItemName() {
    return this._data.name;
  }
}
