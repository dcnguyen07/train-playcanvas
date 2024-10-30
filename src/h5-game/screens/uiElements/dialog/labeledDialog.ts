/* eslint-disable default-param-last */
import * as pc from "playcanvas";
import { DIALOG_PADDING, DIALOG_STROKE_WIDTH, DIALOG_WIDTH, Dialog, DialogColor } from "./dialog";
import { ObjectFactory } from "../../../../template/objects/objectFactory";
import { GameConstant } from "../../../../gameConstant";
import { Util, waitToNFrames } from "../../../../template/helpers/util";
import { AssetManager } from "../../../../template/assetManager";
import { DialogButton } from "./dialogButton";
import { LayoutGroupFitter } from "../../../../template/scripts/layoutGroupFitter";

export const DIALOG_LABEL_HEIGHT = 70;

export class LabeledDialog extends Dialog {

  buttonGroupFitter!: LayoutGroupFitter;
  labelPlaceHolder!: pc.Entity;
  messageEntity!: pc.Entity;

  protected _buttonGroup!: pc.Entity;

  constructor(label: string, title: string, message?: string, color = DialogColor.Blue, iconAssetName?: string) {
    super(title, color, iconAssetName);
    this.createLabel(label);

    if (message) {
      this.createMessage(message);
    }

    waitToNFrames().then(() => {
      this._addButtonGroup();
    });
  }

  createLabel(label: string) {
    const asset = AssetManager.find("spr_dialog_label");
    const frame = Util.getSpriteFrame(asset!.resource, 1);
    const height = DIALOG_LABEL_HEIGHT;
    const width = frame.width * (height / frame.height);

    const labelEntity = ObjectFactory.createImageElement("spr_dialog_label", {
      width  : width,
      height : height,
      y      : -DIALOG_LABEL_HEIGHT - DIALOG_PADDING,
      x      : -DIALOG_STROKE_WIDTH,
      anchor : new pc.Vec4(1, 1, 1, 1),
      pivot  : new pc.Vec2(1, 0.5),
      color  : this.color,
    });

    const labelTextNode = ObjectFactory.createTextElement(GameConstant.GAME_FONT_POPPINS_BOLD, {
      anchor   : new pc.Vec4(1, 0.5, 1, 0.5),
      pivot    : new pc.Vec2(1, 0.5),
      x        : -DIALOG_PADDING,
      text     : label,
      fontSize : 36,
      maxLines : 1,
      color    : pc.Color.WHITE,
    });
    labelEntity.addChild(labelTextNode);

    this.addChild(labelEntity);

    this.labelPlaceHolder = ObjectFactory.createGroupElement();
    waitToNFrames().then(() => {
      this.labelPlaceHolder.element!.height = labelTextNode.element!.height + DIALOG_PADDING + DIALOG_LABEL_HEIGHT;
      this.addContent(this.labelPlaceHolder, true, this.container.children.length - 1);
    });
  }

  createMessage(message: string) {
    const messageEntity = ObjectFactory.createTextElement(GameConstant.GAME_FONT_POPPINS_REGULAR, {
      width     : DIALOG_WIDTH,
      // autoWidth  : false,
      fontSize  : 26,
      wrapLines : true,
      text      : message,
    });
    this.addContent(messageEntity);
    this.messageEntity = messageEntity;
  }

  protected _addButtonGroup() {
    const buttonGroup = ObjectFactory.createGroupElement();
    buttonGroup.addComponent("layoutgroup", {
      orientation : pc.ORIENTATION_VERTICAL,
      spacing     : new pc.Vec2(0, 10),
      alignment   : new pc.Vec2(0.5, 0.5),
    });
    this.addContent(buttonGroup);
    this.buttonGroupFitter = buttonGroup.addScript(LayoutGroupFitter) as LayoutGroupFitter;
    this._buttonGroup = buttonGroup;
  }

  addButtonOk() {
    const button = new DialogButton("OK", this.color, this.close.bind(this));
    this.addButtons(button);
  }

  addButtons(...buttons: DialogButton[]) {
    if (!this._buttonGroup) {
      waitToNFrames().then(() => {
        this.addButtons(...buttons);
      });
      return;
    }
    buttons.forEach((button) => {
      this._buttonGroup.addChild(button);
      this.buttonGroupFitter.fit();
      waitToNFrames().then(() => {
        this.fitter.fit();
      });
    });
  }
}
