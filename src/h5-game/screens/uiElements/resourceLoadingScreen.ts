import { Entity, ELEMENTTYPE_GROUP, Vec4, Vec2, Color } from "playcanvas";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { Tween } from "../../../template/systems/tween/tween";

export class ResourceLoadingScreen extends Entity {
  fakeBackground: Entity;
  iconLoading: Entity;
  constructor() {
    super();
    this.addComponent("element", {
      type   : ELEMENTTYPE_GROUP,
      anchor : new Vec4(0, 0, 1, 1),
      pivot  : new Vec2(0.5, 0.5),
    });
    this._createBackground();
    this._initIconLoading();
  }

  private _createBackground() {
    this.fakeBackground = ObjectFactory.createEmptyImageElement({
      color    : Color.BLACK,
      useInput : true,
      opacity  : 0.6,
    });
    this.fakeBackground.element.anchor = new Vec4(0, 0, 1, 1);
    this.addChild(this.fakeBackground);
  }

  private _initIconLoading() {
    this.iconLoading = ObjectFactory.createImageElement("spr_icon_loading", {
      width  : 200,
      height : 200,
      pivot  : new Vec2(0.5, 0.5),
    });
    this.addChild(this.iconLoading);
    Tween.createRotateTween(this.iconLoading, { z: -360 }, {
      duration : 1,
      loop     : true,
    }).start();
  }

  show() {
    this.enabled = true;
  }

  hide() {
    this.enabled = false;
  }
}
