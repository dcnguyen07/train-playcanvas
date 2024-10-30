import { ObjectFactory } from "../../../../template/objects/objectFactory";
import ListViewItem from "./listviewItem";
import * as pc from "playcanvas";

export class LabelItem extends ListViewItem {
  static readonly CLICK = "click";
  panel!: pc.Entity;
  textLabel!: pc.Entity;
  constructor(label : string) {
    super();
    this.addComponent("element", {
      type   : pc.ELEMENTTYPE_GROUP,
      anchor : new pc.Vec4(0, 1, 1, 1),
      pivot  : new pc.Vec2(0, 1),
      height : 50,
      margin : new pc.Vec4(0, 0, 0, 0),
    });

    this._create(label);
  }

  _create(label : string) {
    this.panel = ObjectFactory.createButtonElement("spr_label_relationship", {
      active: false,
    });
    if (this.panel.element) {
      this.panel.element.anchor = new pc.Vec4(0, 0.5, 1, 1);
      this.panel.element.pivot = new pc.Vec2(0.5, 1);
    }
    this.addChild(this.panel);

    this.textLabel = ObjectFactory.createTextElement("FiraSans-Bold", {
      text     : label,
      fontSize : 32,
      color    : new pc.Color(1, 1, 1),
      anchor   : new pc.Vec4(0.5, 0.5, 0.5, 0.5),
      pivot    : new pc.Vec2(0.5, 0.5),
    });
    this.panel.addChild(this.textLabel);
  }
}
