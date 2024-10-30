import { ELEMENTTYPE_GROUP, Entity, Vec2, Vec4 } from "playcanvas";

export class UIEntity extends Entity {
  constructor() {
    super();
    this.addComponent("element", {
      type: ELEMENTTYPE_GROUP,
      anchor: new Vec4(0.5, 1, 0.5, 1),
      pivot: new Vec2(0, 0.5),
      width : 0,
      height : 0,
    });
  }
}