import { Entity, ORIENTATION_HORIZONTAL, Vec2, Vec4 } from "playcanvas";
import { ObjectFactory } from "../../../../template/objects/objectFactory";

export class ExpProgressBar extends Entity {
  star: Entity;
  groupStar: Entity;
  stars : any = [];
  constructor() {
    super();
    this.addComponent("element", {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
    });
    this.groupStar = ObjectFactory.createGroupElement({});
    this.addChild(this.groupStar);
    this.groupStar.addComponent("layoutgroup", {
      orientation : ORIENTATION_HORIZONTAL,
      spacing     : new Vec2(10, 0),
      alignment   : new Vec2(0.5, 0.5),
    });

    for (let i = 0; i < 5; i++) {
      this._createStar();
    }
  }

  private _createStar() {
    let star = ObjectFactory.createImageElement("spr_icon_star", {
      scale: 1,
    });
    this.groupStar.addChild(star);

    let starActive = ObjectFactory.createImageElement("spr_icon_star_active", {
      scale: 1,
    });
    starActive.enabled = false;
    star.addChild(starActive);
    this.stars.push(star);
    return star;
  }

  updateStars(value: number) {
    for (let i = 0; i < this.stars.length; i++) {
      this.stars[i].children[1].enabled = i < value;
    }
  }
}
