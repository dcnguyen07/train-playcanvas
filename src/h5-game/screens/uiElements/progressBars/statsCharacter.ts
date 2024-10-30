import { ObjectFactory } from "../../../../template/objects/objectFactory";
import { Color, Entity, ORIENTATION_VERTICAL, Vec2, Vec4 } from "playcanvas";
import { StatElement } from "../statElement";

export class StatsCharacter extends Entity {
  background: any;
  statsGroup: Entity;
  hp: StatElement;
  attack: StatElement;
  speed: StatElement;
  exp: StatElement;
  constructor() {
    super();
    this.addComponent("element", {
      anchor : new Vec4(0.5, 0.7, 0.5, 0.7),
      pivot  : new Vec2(0.5, 0.5),
    });
    this._createBackground();
    this._initStats();
  }
  _createBackground() {
    this.background = ObjectFactory.createImageElement("spr_background_stats", {
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      width  : 900,
      height : 355,
      x      : -15,
    });
    this.addChild(this.background);
  }

  _initStats() {
    this.statsGroup = ObjectFactory.createGroupElement({
      pivot  : new Vec2(0.5, 0.5),
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
    });
    this.background.addChild(this.statsGroup);
    this.statsGroup.addComponent("layoutgroup", {
      orientation : ORIENTATION_VERTICAL,
      spacing     : new Vec2(0, 40),
      alignment   : new Vec2(0.5, 0.5),
    });

    this.hp = new StatElement("HP", 0, "spr_icon_health");
    this.statsGroup.addChild(this.hp);

    this.speed = new StatElement("Speed", 0, "spr_icon_speed");
    this.statsGroup.addChild(this.speed);
  }

  updateStats(stats : any) {
    this.hp.setValue(stats.maxHealth);
    this.speed.setValue(stats.speed);
  }
}
