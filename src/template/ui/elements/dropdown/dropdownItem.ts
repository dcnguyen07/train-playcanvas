import { Color, ELEMENTTYPE_IMAGE, ELEMENTTYPE_TEXT, Entity, Vec2, Vec4 } from "playcanvas";
import { AssetManager } from "../../../assetManager";

export class DropdownItem extends Entity {
  static EVENT_SELECTED = "DropdownItem:Selected";
  static EVENT_DESELECTED = "DropdownItem:Deselected";

  txtLabel!: Entity;

  constructor(data: any = {}) {
    super("DropdownItem");

    data.type = ELEMENTTYPE_IMAGE;
    data.useInput = true;
    data.margin = data.margin || new Vec4();
    data.anchor = data.anchor || new Vec4(0, 0, 1, 0);
    data.height = data.height || 100;
    data.opacity = data.opacity || 0;
    const title = data.title || "Dropdown Item";
    this.addComponent("element", data);
    this.addComponent("button", {
      imageEntity: this,
    });

    this.txtLabel = new Entity("Label");
    this.addChild(this.txtLabel);
    this.txtLabel.addComponent("element", {
      type         : ELEMENTTYPE_TEXT,
      text         : title,
      fontAsset    : AssetManager.find("FiraSans-Regular"),
      fontSize     : 30,
      maxFontSize  : 30,
      color        : new Color(),
      anchor       : new Vec4(0, 0.5, 1, 0.5),
      pivot        : new Vec2(0.5, 0.5),
      alignment    : new Vec2(0, 0.5),
      margin       : new Vec4(0, 0, 0, 0),
      autoWidth    : false,
      autoFitWidth : true,
    });
  }

  onSelected() {
    this.fire(DropdownItem.EVENT_SELECTED);
  }

  onDeselected() {
    this.fire(DropdownItem.EVENT_DESELECTED);
  }

  get value() {
    return this.txtLabel.element!.text;
  }

    set value(value: string) {
        this.txtLabel.element!.text = value;
    }
}
