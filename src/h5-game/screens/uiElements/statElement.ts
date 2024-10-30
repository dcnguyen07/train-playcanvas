import { Color, ELEMENTTYPE_GROUP, Entity, ORIENTATION_HORIZONTAL, Vec2, Vec4 } from "playcanvas";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { GameConstant } from "../../../gameConstant";

export class StatElement extends Entity {
  textValue: Entity;
  textValueUpgrade: Entity;
  constructor(label : string, value : number, icon : string) {
    super();
    this.addComponent("element", {
      type   : ELEMENTTYPE_GROUP,
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
    });
    this.addComponent("layoutgroup", {
      orientation : ORIENTATION_HORIZONTAL,
      spacing     : new Vec2(30, 0),
      alignment   : new Vec2(0, 0.5),
      padding     : new Vec4(50, 0, 0, 0),
    });

    let iconStat = ObjectFactory.createImageElement(icon, {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
    });

    this.addChild(iconStat);
    let textLabel = ObjectFactory.createTextElement(GameConstant.GAME_FONT_POPPINS_BOLD, {
      text      : `${label.toString()} :`,
      color     : Color.WHITE,
      autoWidth : true,
      alignment : new Vec2(0, 0.5),
      fontSize  : 28,
    });
    this.addChild(textLabel);

    let textValue = ObjectFactory.createTextElement(GameConstant.GAME_FONT_POPPINS_BOLD, {
      text      : value.toString(),
      color     : Color.WHITE,
      width     : 100,
      autoWidth : false,
      alignment : new Vec2(0, 0.5),
      fontSize  : 28,
    });
    this.textValue = textValue;
    this.addChild(textValue);
  }

  public setValue(value : number) {
    this.textValue.element.text = value.toString();
  }
}
