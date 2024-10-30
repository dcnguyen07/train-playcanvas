/* eslint-disable default-param-last */
import * as pc from "playcanvas";
import { AssetManager } from "../../../../template/assetManager";
import { Util } from "../../../../template/helpers/util";
import { GameConstant } from "../../../../gameConstant";
import { DIALOG_PADDING, DIALOG_WIDTH } from "./dialog";
import { SoundManager } from "../../../../template/soundManager";

const BUTTON_WIDTH = DIALOG_WIDTH - DIALOG_PADDING / 4;
 
export class DialogButton extends pc.Entity {

  constructor(text: string, color: pc.Color = pc.Color.WHITE, onClick?: () => void) {
    super("DialogButton");

    const asset = AssetManager.find("spr_dialog_button");

    const frame = Util.getSpriteFrame(asset!.resource, 1);
    const width = BUTTON_WIDTH * 0.95;
    const height = frame.height * (width / frame.width) * 0.75;

    this.addComponent("element", {
      type        : pc.ELEMENTTYPE_IMAGE,
      anchor      : new pc.Vec4(0.5, 0.5, 0.5, 0.5),
      pivot       : new pc.Vec2(0.5, 0.5),
      margin      : new pc.Vec4(0, 0, 0, 0),
      spriteAsset : asset,
      color       : color,
      width       : width,
      height      : height,
      useInput    : true,
    });
    const hoverTint = color.clone();
    hoverTint.r *= 0.95;
    hoverTint.g *= 0.95;
    hoverTint.b *= 0.95;

    const pressedTint = color.clone();
    pressedTint.r *= 0.8;
    pressedTint.g *= 0.8;
    pressedTint.b *= 0.8;

    this.addComponent("button", {
      hoverTint   : hoverTint,
      pressedTint : pressedTint,
      imageEntity : this,
    });

    const label = new pc.Entity("Label");
    label.addComponent("element", {
      type      : pc.ELEMENTTYPE_TEXT,
      anchor    : new pc.Vec4(0.5, 0.5, 0.5, 0.5),
      pivot     : new pc.Vec2(0.5, 0.5),
      margin    : new pc.Vec4(0, 0, 0, 0),
      text      : text,
      fontSize  : 24,
      fontAsset : AssetManager.find(GameConstant.GAME_FONT_POPPINS_BOLD),
      color     : new pc.Color(1, 1, 1),
    });
    this.addChild(label);

    if (onClick) {
      this.button!.on("click", onClick);
    }

    this.button!.on("click", () => {
      SoundManager.play("sfx_menu_button");
    });
  }

  registerClick(onClick: () => void) {
    this.button!.on("click", onClick);
  }
}
