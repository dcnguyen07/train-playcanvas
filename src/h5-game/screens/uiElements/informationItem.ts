/* eslint-disable max-len */
import { ELEMENTTYPE_IMAGE } from "playcanvas";
import * as pc from "playcanvas";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { GameConstant } from "../../../gameConstant";
import { AssetManager } from "../../../template/assetManager";
import { Util } from "../../../template/helpers/util";

export enum InformationBackgroundColor {
  EvenNumber = "#ecebe8",
  OddNumber = "#f4f3f0",
}

export default class InformationItem extends pc.Entity {
  constructor(
    { title, text,
      alignment = new pc.Vec2(0.5, 0.5),
      padding = pc.Vec4.ZERO, textSize = 26,
      color = Util.hexToRgb(InformationBackgroundColor.EvenNumber),
      width = 500,
      anchor = new pc.Vec4(0.5, 0.5, 0.5, 0.5) }
    :
      { title: string,
        text?: string,
        alignment?: pc.Vec2, padding?: pc.Vec4, textSize?: number, color?: pc.Color, width?: number, anchor?: pc.Vec4}
  ) {
    super(title);
    this.addComponent("element", {
      type        : ELEMENTTYPE_IMAGE,
      anchor      : anchor,
      width       : width,
      height      : textSize * 2,
      pivot       : new pc.Vec2(0.5, 0.5),
      spriteAsset : AssetManager.find("spr_rectangle"),
    });

    this.element!.color = color;

    this.addComponent("layoutgroup", {
      orientation : pc.ORIENTATION_HORIZONTAL,
      alignment   : alignment,
      padding     : padding,
      spacing     : new pc.Vec2(20, 0),
    });

    title = Util.upperFirstLetter(title);
    if (text) {
      title += ":";
    }
    const titleEntity = ObjectFactory.createTextElement(GameConstant.GAME_FONT_FIRA_SANS_BOLD, {
      fontSize : textSize,
      text     : title,
      color    : new pc.Color(64 / 255, 12 / 255, 16 / 255),
    });
    this.addChild(titleEntity);
    if (text) {
      const textEntity = ObjectFactory.createTextElement(GameConstant.GAME_FONT_FIRA_SANS_REGULAR, {
        fontSize : textSize,
        text     : text,
        color    : new pc.Color(64 / 255, 12 / 255, 16 / 255),
      });
      this.addChild(textEntity);
    }
  }


  public static createGroupItem(data: {title: string, text?: string}[], { alignment = new pc.Vec2(0.5, 0.5),
    padding = pc.Vec4.ZERO, textSize = 26,
    width = 500,
    anchor = new pc.Vec4(0.5, 0.5, 0.5, 0.5) } = {}) {
    const entity = ObjectFactory.createFittedLayoutGroupElement({
      anchor      : anchor,
      width       : width,
      orientation : pc.ORIENTATION_VERTICAL,
      reverseY    : true,
    });

    let i = 0;
    for (const item of data) {
      const title = item.title;
      const text = item.text;
      const c = i % 2 === 0 ? InformationBackgroundColor.EvenNumber : InformationBackgroundColor.OddNumber;
      const bgColor = Util.hexToRgb(c);
      const itemEntity = new InformationItem({ title, text, alignment, padding, textSize, color: bgColor });
      entity.addChild(itemEntity);
      i++;
    }
    // @ts-ignore
    entity.fitter.fit();
    return entity;
  }
}
