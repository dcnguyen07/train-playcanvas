import { Entity, Vec3, StandardMaterial } from "playcanvas";

export class BoxFragment extends Entity {
  constructor() {
    super();
    this._initBox();
  }

  _initBox() {
    this.addComponent("model", {
      type: "box",
    });

    let material = new StandardMaterial();
    material.diffuse.set(255 / 255, 163 / 255, 0 / 255);
    this.model.material = material;


  }
}
