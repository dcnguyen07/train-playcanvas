import { Color, ELEMENTTYPE_GROUP, Entity, ORIENTATION_HORIZONTAL, Vec2, Vec4 } from "playcanvas";
import { ObjectFactory } from "../../../../template/objects/objectFactory";
import { GameConstant } from "../../../../gameConstant";

export class LevelProgressBar extends Entity {
  levelPath: Entity;
  frames: any[] = [];
  constructor() {
    super();
    this.addComponent("element", {
      type   : ELEMENTTYPE_GROUP,
      anchor : new Vec4(0.5, 0.8, 0.5, 0.8),
    });
    this._createPath();
  }

  _createPath() {
    this.levelPath = ObjectFactory.createImageElement("spr_path", {
      scale: 0.8,
      width : 800,
    });
    this.addChild(this.levelPath);

    this.levelPath.addComponent("layoutgroup", {
      orientation : ORIENTATION_HORIZONTAL,
      spacing     : new Vec2(40, 0),
      alignment   : new Vec2(0.5, 0.5),
    });

    for (let i = 0; i < 10; i++) {
      let levelFrame = this._createLevelFrame();
      this.levelPath.addChild(levelFrame);
      levelFrame.textLevel.element.text = i + 1;
      levelFrame.textLevel.enabled = true;
      this.frames.push(levelFrame);
    }
  }

  _createLevelFrame() {
    let levelFrame: any = ObjectFactory.createImageElement("spr_stage_frame", {
      scale: 0.35,
    });

    let focusFrame = ObjectFactory.createImageElement("spr_stage_frame_blue", {
      scale: 0.35,
    });
    levelFrame.addChild(focusFrame);
    focusFrame.enabled = false;
    levelFrame.focusFrame = focusFrame;

    let activeFrame = ObjectFactory.createImageElement("spr_stage_green", {
      scale: 0.35,
    });
    levelFrame.addChild(activeFrame);
    activeFrame.enabled = false;
    levelFrame.activeFrame = activeFrame;

    let text = ObjectFactory.createTextElement(GameConstant.GAME_FONT_POPPINS_BOLD, {
      text     : "1",
      color    : Color.WHITE,
      fontSize : 22,
    });
    levelFrame.addChild(text);
    levelFrame.textLevel = text;
    return levelFrame;
  }

  activeFocusFrame(index: number) {
    this.frames.forEach((frame, i) => {
      frame.focusFrame.enabled = i === index - 1;
      frame.activeFrame.enabled = i < index - 1;
    });
  }

  updateTextLevel(index: number) {
    this.frames.forEach((frame, i) => {
      frame.textLevel.element.text = i + 1;
      this.activeFocusFrame(index);
      if (index > this.frames.length) {
        frame.textLevel.element.text = this.frames.length + i + 1;
        this.activeFocusFrame(index % this.frames.length);
        if (index % this.frames.length === 0) {
          this.activeFocusFrame(this.frames.length);
        }
      }
    });
  }
}
