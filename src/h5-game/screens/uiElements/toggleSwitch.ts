import { Entity, ELEMENTTYPE_GROUP, Vec4, Vec2, Color } from "playcanvas";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { SoundManager } from "../../../template/soundManager";

export const ToggleSwitchEvent = Object.freeze({
  TurnOn  : "turnOn",
  TurnOff : "turnOff",
});

export class ToggleSwitch extends Entity {
  spriteActive: string;
  spriteInactive: string;
  activeIcon: Entity;
  inactiveIcon: Entity;
  constructor(spriteActive = "spr_icon_toggle_switch_on", spriteInactive = "spr_icon_toggle_switch_off") {
    super();
    this.spriteActive = spriteActive;
    this.spriteInactive = spriteInactive;

    this.addComponent("element", {
      type   : ELEMENTTYPE_GROUP,
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      width  : 100,
      height : 50,
    });

    this._initActiveIcon();
    this._initInactiveIcon();
  }

  _initActiveIcon() {
    this.activeIcon = ObjectFactory.createImageElement(this.spriteActive, {
      useInput: true,
    });
    this.addChild(this.activeIcon);

    this.activeIcon.addComponent("button", {
      active      : true,
      imageEntity : this.activeIcon,
      hoverTint   : new Color(0.7, 0.7, 0.7),
      pressedTint : new Color(0.5, 0.5, 0.5),
    });
    this.activeIcon.button.on("click", () => {
      this.turnOff();
      this.fire(ToggleSwitchEvent.TurnOff);
    });
  }

  _initInactiveIcon() {
    this.inactiveIcon = ObjectFactory.createImageElement(this.spriteInactive, {
      useInput: true,
    });
    this.addChild(this.inactiveIcon);

    this.inactiveIcon.addComponent("button", {
      active      : true,
      imageEntity : this.inactiveIcon,
      hoverTint   : new Color(0.7, 0.7, 0.7),
      pressedTint : new Color(0.5, 0.5, 0.5),
    });
    this.inactiveIcon.button.on("click", () => {
      this.turnOn();
      this.fire(ToggleSwitchEvent.TurnOn);
    });
  }

  turnOn() {
    SoundManager.play("sfx_button");
    this.activeIcon.enabled = true;
    this.inactiveIcon.enabled = false;
  }

  turnOff() {
    SoundManager.play("sfx_button");
    this.activeIcon.enabled = false;
    this.inactiveIcon.enabled = true;
  }
}
