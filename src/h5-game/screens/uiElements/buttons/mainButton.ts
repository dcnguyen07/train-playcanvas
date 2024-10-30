import { Color, ELEMENTTYPE_GROUP, Entity, ORIENTATION_HORIZONTAL, Vec2, Vec4 } from "playcanvas";
import { ObjectFactory } from "../../../../template/objects/objectFactory";
import { GameConstant } from "../../../../gameConstant";
import { SoundManager } from "../../../../template/soundManager";

export class MainButton extends Entity {
  mainButton: Entity;
  text: Entity;
  icon: Entity;
  active: boolean;

  constructor(mainButton: string, icon: string, text: string) {
    super();
    this.addComponent("element", {
      type   : ELEMENTTYPE_GROUP,
      anchor : new Vec4(0.5, 0, 0.5, 0),
      pivot  : new Vec2(0.5, 0),
    });

    this._createMainButton(mainButton);
    this._createText(text);
    this._createIcon(icon);
  }

  private _createMainButton(mainButton: string) {
    this.mainButton = ObjectFactory.createButtonElement(mainButton, {
      scale  : 0.4,
      anchor : new Vec4(0.5, 0, 0.5, 0),
      pivot  : new Vec2(0.5, 0),
      width  : 239,
      x      : -15,
      y      : -87,
    });
    this.addChild(this.mainButton);
    this.mainButton.addComponent("layoutgroup", {
      orientation : ORIENTATION_HORIZONTAL,
      spacing     : new Vec2(20, 0),
      alignment   : new Vec2(0.5, 0.5),
    });
  }

  private _createText(text: string) {
    this.text = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text      : text,
      color     : Color.WHITE,
      autoWidth : true,
      alignment : new Vec2(0.5, 0.5),
      fontSize  : 28,
    });
    this.mainButton.addChild(this.text);
  }

  private _createIcon(icon: string) {
    this.icon = ObjectFactory.createImageElement(icon);
    this.mainButton.addChild(this.icon);
    this.icon.setLocalScale(1.5, 1.5, 1.5);
  }

  public setCurrency(currency: string) {
    this.text.element.text = currency;
  }

  activeButton(active: boolean) {
    this.enabled = active;
    let opacity = active ? 1 : 0.9;
    this.icon.element.opacity = opacity;
    this.text.element.opacity = opacity;
    this.mainButton.element.useInput = active;
    this.mainButton.button.active = active;
  }

}
