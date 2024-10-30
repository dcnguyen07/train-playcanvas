import { ELEMENTTYPE_IMAGE, Entity, Vec4 } from "playcanvas";
import { UIScreen } from "../../template/ui/uiScreen";

export class AdsScreen extends UIScreen {
  bg!: Entity;

  constructor() {
    super();
  }

  override create() {
    super.create();

    this.bg = new Entity("AdsScreenBG");
    this.addChild(this.bg);
    this.bg.addComponent("element", {
      type     : ELEMENTTYPE_IMAGE,
      anchor   : new Vec4(0, 0, 1, 1),
      margin   : new Vec4(),
      opacity  : 0,
      useInput : true,
    });
  }
}
