import { ORIENTATION_VERTICAL, Vec2, Vec4 } from "playcanvas";
import { StatElement } from "./statElement";
import { StatsCharacter } from "./progressBars/statsCharacter";
import { ObjectFactory } from "../../../template/objects/objectFactory";

export class StatsWeapon extends StatsCharacter {
  damage: any;
  trajectory: StatElement;
  shootSpeed: StatElement;
  reloadTime: StatElement;
  magazine: StatElement;
  statsWeaponGroup: any;
  range: StatElement;
  trajectoryAngle: StatElement;
  constructor() {
    super();
  }

  override _initStats() {
    this.statsGroup = ObjectFactory.createGroupElement({
      pivot  : new Vec2(0.5, 0.5),
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
    });
    this.background.addChild(this.statsGroup);
    this.statsGroup.addComponent("layoutgroup", {
      orientation : ORIENTATION_VERTICAL,
      spacing     : new Vec2(0, 30),
      alignment   : new Vec2(0.5, 0.5),
    });

    this.damage = new StatElement("Damage", 0, "spr_icon_damage");
    this.statsGroup.addChild(this.damage);

    this.magazine = new StatElement("Magazine", 0, "spr_icon_magazine");
    this.statsGroup.addChild(this.magazine);

    this.range = new StatElement("Range", 0, "spr_icon_range");
    this.statsGroup.addChild(this.range);

    this.reloadTime = new StatElement("Reload Time", 0, "spr_icon_reload_time");
    this.statsGroup.addChild(this.reloadTime);

    this.shootSpeed = new StatElement("Shoot Speed", 0, "spr_icon_shoot_speed");
    this.statsGroup.addChild(this.shootSpeed);


  }

  override updateStats(stats : any) {
    this.damage.setValue(stats.damage);
    this.magazine.setValue(stats.magazine);
    this.range.setValue(stats.range);
    this.reloadTime.setValue(stats.reloadTime);
    this.shootSpeed.setValue(stats.shootSpeed);
  }
}
