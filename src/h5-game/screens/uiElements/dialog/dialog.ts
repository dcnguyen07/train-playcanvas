/* eslint-disable default-param-last */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as pc from "playcanvas";
import { ObjectFactory } from "../../../../template/objects/objectFactory";
import { GameConstant } from "../../../../gameConstant";
import { LayoutGroupFitter } from "../../../../template/scripts/layoutGroupFitter";
import { Util, waitToNFrames } from "../../../../template/helpers/util";
import { AssetManager } from "../../../../template/assetManager";
import { Tween } from "../../../../template/systems/tween/tween";
import { SoundManager } from "../../../../template/soundManager";
import { Game } from "../../../../game";
// import DialogContent from "./dialogContent";

export const DIALOG_PADDING = 20;
export const DIALOG_WIDTH = 550;
export const DIALOG_SPACING = 20;

export const DIALOG_STROKE_WIDTH = 10;

export enum DialogColor {
  Blue = "#0794d2",
  Green = "#0a8832",
  Red = "#cc1a35",
  Gray = "#353535",
  Orange = "#f2480c"
}

export class Dialog extends pc.Entity {

  // static readonly DIALOG_EVENT_OPEN = "dialog:open";
  static readonly EVENT_CLOSE = "dialog:close";
  static readonly EVENT_OPTION_SELECTED = "dialog:optionSelected";
  static readonly EVENT_SHOW = "dialog:onShow";

  title!: pc.Entity;
  fitter!: LayoutGroupFitter;
  tapAnywhereToClose = false;
  container! : pc.Entity;
  color! : pc.Color;
  closed = false;
  buttonClose! : pc.Entity;
  icon! : pc.Entity;

  protected _stroke! : pc.Entity;
  titleText!: pc.Entity;


  constructor(title: string, color = DialogColor.Blue, iconAssetName?: string) {
    super(`${title} dialog}`);
    this.color = Util.hexToRgb(color);
    window.addEventListener("keyup", (e) => this._onKeyPress(e));

    this.addComponent("element", {
      type        : pc.ELEMENTTYPE_IMAGE,
      anchor      : new pc.Vec4(0.5, 0.5, 0.5, 0.5),
      width       : DIALOG_WIDTH + DIALOG_PADDING + DIALOG_STROKE_WIDTH * 2,
      height      : DIALOG_STROKE_WIDTH * 2,
      pivot       : new pc.Vec2(0.5, 0.5),
      margin      : new pc.Vec4(0, 0, 0, 0),
      spriteAsset : AssetManager.find("spr_dialog_frame_stroke"),
    });
    this.element!.color = this.color;

    this._createContainer();
    this.createTitle(title, iconAssetName);
    waitToNFrames(5).then(() => this.resize());
    window.addEventListener("resize", () => this.resize());
  }


  resize() {
    if (Game.width / Game.height < GameConstant.GAME_RESIZE_RATIO) {
      if (this.element) {
        this.element!.width = (DIALOG_WIDTH + DIALOG_PADDING + DIALOG_STROKE_WIDTH * 2) * 1.5;
        waitToNFrames(20).then(() => {
          this.element!.height = this.container.element!.height * 1.5 + DIALOG_STROKE_WIDTH * 2.5;
        });
      }
      this.container.setLocalScale(1.5, 1.5, 1.5);
    }
    else {
      if (this.element) {
        this.element!.width = (DIALOG_WIDTH + DIALOG_PADDING + DIALOG_STROKE_WIDTH * 2);
        waitToNFrames(20).then(() => {
          this.element!.height = this.container.element!.height + DIALOG_STROKE_WIDTH * 2;
        });
      }
      this.container.setLocalScale(1, 1, 1);
    }
  }

  protected _createContainer() {
    this.container = ObjectFactory.createImageElement("spr_dialog_frame", {
      width  : DIALOG_WIDTH + DIALOG_PADDING,
      height : 0,
    });
    this.container.addComponent("layoutgroup", {
      orientation : pc.ORIENTATION_VERTICAL,
      padding     : new pc.Vec4(DIALOG_PADDING, 0, DIALOG_PADDING, DIALOG_PADDING + DIALOG_STROKE_WIDTH),
      spacing     : new pc.Vec2(0, DIALOG_SPACING),
      alignment   : new pc.Vec2(0.5, 1),
      reverseY    : false,
    });
    this.addChild(this.container);

    this.fitter = this.container.addScript(LayoutGroupFitter) as LayoutGroupFitter;
  }

  public createTitle(title: string, iconAssetName?: string) {
    this.titleText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_POPPINS_BOLD, {
      fontSize : 32,
      text     : title,
      color    : new pc.Color(64 / 255, 12 / 255, 16 / 255),
    });

    const titleEntity = ObjectFactory.createGroupElement();
    titleEntity.element!.margin = new pc.Vec4(0, 0, 0, 0);
    titleEntity.addComponent("layoutgroup", {
      orientation : pc.ORIENTATION_HORIZONTAL,
      spacing     : new pc.Vec2(20, 0),
      alignment   : new pc.Vec2(0.5, 0.5),
    });

    if (iconAssetName) {
      const icon = ObjectFactory.createImageElement(iconAssetName);
      const height = 70;
      icon.element!.width = icon.element!.width * (height / icon.element!.height) * 0.7;
      icon.element!.height = height * 0.7;

      titleEntity.addChild(icon);
      this.icon = icon;
    }
    titleEntity.addChild(this.titleText);

    this.title = titleEntity;
    this.addContent(titleEntity, false);
  }

  public addTapToClose() {
    /*
     * const tapToClose = ObjectFactory.createTextElement(GameConstant.GAME_FONT_FIRA_SANS_REGULAR, {
     *   fontSize : 24,
     *   text     : "Tap anywhere to close",
     *   color    : new pc.Color(80 / 255, 108 / 255, 130 / 255),
     * });
     *
     * this.container.insertChild(tapToClose, this.container.children.length);
     */
    this.tapAnywhereToClose = true;
  }

  public addButtonClose() {
    const buttonClose = ObjectFactory.createButtonElement("spr_button_close_dialog", {
      anchor : new pc.Vec4(0, 1, 0, 1),
      pivot  : new pc.Vec2(0.5, 0.5),
      scale  : 1.5,
    });
    this.addChild(buttonClose);
    buttonClose.element?.on("click", () => {
      this.close();
      SoundManager.play("sfx_menu_button");
    });
    this.buttonClose = buttonClose;
  }

  public close() {
    if (this.closed) {
      return;
    }
    this.closed = true;
    this.fire(Dialog.EVENT_CLOSE);
    waitToNFrames().then(() => this.destroy());
  }

  public addContent(entity: pc.Entity, fit = true, index = -1) {
    if (index === -1) {
      // add the element to index 0 to make sure elements on top will overlap the bottom ones
      this.container.insertChild(entity, 0);
    }
    else {
      this.container.insertChild(entity, index);
    }
    if (fit) {
      this.fit();
    }
  }

  fit() {
    this.fitter.fit();
    waitToNFrames(2).then(() => {
      if (this.element && this.container && this.container.element) {
        this.element.height = this.container.element.height + DIALOG_STROKE_WIDTH * 2;
      }
    });
  }

  protected _onKeyPress(e: KeyboardEvent) {
    if (e.key === "Escape") {
      if (this.tapAnywhereToClose || this.buttonClose) {
        this.close();
      }
    }
  }
}
