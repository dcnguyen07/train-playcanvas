import { GameConstant } from "../../../../gameConstant";
import { AssetManager } from "../../../../template/assetManager";
import { waitToNFrames, Util } from "../../../../template/helpers/util";
import { ObjectFactory } from "../../../../template/objects/objectFactory";
import { Dropdown } from "../../../../template/ui/elements/dropdown/dropdown";
import { DropdownItem } from "../../../../template/ui/elements/dropdown/dropdownItem";
import { InputField } from "../../../../template/ui/elements/inputField/inputField";
import { InformationBackgroundColor } from "../informationItem";
import { DIALOG_WIDTH, Dialog, DialogColor } from "./dialog";
import { DialogButton } from "./dialogButton";
import { LabeledDialog } from "./labeledDialog";
import { OptionDialog } from "./optionDialog";
import * as pc from "playcanvas";
import { Tween } from "../../../../template/systems/tween/tween";
import { Easing } from "@tweenjs/tween.js";
import { SoundManager } from "../../../../template/soundManager";

export type DialogContentBuilder = () => pc.Entity[];
export type DialogButtonsBuilder = () => DialogButton[];

export default class DialogBuilder {

  public static createMessageDialog(title: string, message: string, color = DialogColor.Blue) {
    const dialog = new Dialog(title, color);
    dialog.setLocalScale(0, 0, 0);
    const messageEntity = ObjectFactory.createTextElement(GameConstant.GAME_FONT_POPPINS_REGULAR, {
      width      : DIALOG_WIDTH,
      autoWidth  : false,
      autoHeight : true,
      fontSize   : 24,
      text       : message,
      color      : new pc.Color(64 / 255, 12 / 255, 16 / 255),
    });
    dialog.addContent(messageEntity);
    dialog.tapAnywhereToClose = true;
    Tween.createScaleTween(dialog, {
      x : 1,
      y : 1,
      z : 1,
    }, {
      duration   : GameConstant.DURATION_DIALOG,
      onComplete : () => {
        SoundManager.play("sfx_feedback_scenario_appears");
      },
    }).start();
    return dialog;
  }

  public static createMessage(message: string) {
    const messageEntity = ObjectFactory.createTextElement(GameConstant.GAME_FONT_POPPINS_REGULAR, {
      width      : DIALOG_WIDTH,
      autoWidth  : false,
      autoHeight : true,
      fontSize   : 24,
      text       : message,
      color      : new pc.Color(64 / 255, 12 / 255, 16 / 255),
    });
    return messageEntity;
  }

  public static createDropdownSelection({
    title,
    dropdownOptions,
    showIndicator = true,
    width = 450,
    height = 50,
  }: {
    title: string,
    dropdownOptions: string[],
    showIndicator?: boolean,
    width?: number,
    height?: number,
  }) {

    const group = ObjectFactory.createFittedLayoutGroupElement({
      orientation : pc.ORIENTATION_VERTICAL,
      alignment   : new pc.Vec2(0, 0.5),
      spacing     : new pc.Vec2(0, 0),
      width       : width,
      height      : height,
      reverseY    : true,
    });

    const dropdown = new Dropdown({
      anchor : new pc.Vec4(0, 0.5, 1, 0.5),
      height : 50,
    });
    // @ts-ignore
    dropdown.btnTrigger.element!.spriteAsset = AssetManager.find("spr_stroke_rectangle");
    dropdown.selectedContent.element!.margin = new pc.Vec4(10, 0, 10, 0);

    if (showIndicator) {
      const indicator = ObjectFactory.createImageElement("spr_button_dropdown", {
        pivot  : new pc.Vec2(1, 0.5),
        width  : height,
        height : height,
      });
      indicator.element!.anchor = new pc.Vec4(1, 0.5, 1, 0.5),
      dropdown.btnTrigger.addChild(indicator);
    }

    const items = this.createDropdownItems(dropdownOptions, height);
    dropdown.setItems(items);
    // @ts-ignore
    dropdown.contentBackground.element!.spriteAsset = AssetManager.find("spr_stroke_rectangle");

    const txtTitle = ObjectFactory.createTextElement(GameConstant.GAME_FONT_POPPINS_BOLD, {
      fontSize : 24,
      text     : title,
      color    : pc.Color.BLACK,
    });
    group.addChild(txtTitle);
    group.addChild(dropdown);
    waitToNFrames(2).then(() => {
      // @ts-ignore
      group.fitter.fit();
    });
    // @ts-ignore
    group.dropdown = dropdown;
    return group;
  }

  public static createDropdownItems(dropdownOptions: string[], height: number) {
    return dropdownOptions.map((option, index) => {
      const colorHex = index % 2 === 0 ? InformationBackgroundColor.OddNumber : InformationBackgroundColor.EvenNumber;
      const item = new DropdownItem({
        title   : option,
        height  : height,
        opacity : 1,
        color   : Util.hexToRgb(colorHex),
      });
      item.txtLabel.element!.margin = new pc.Vec4(10, 0, 0, 0);
      return item;
    });
  }

  public static createInputField(data :{
    label?: string,
    placeholder?: string,
    value?: string,
    width?: number,
    height?: number,
    fontSize?: number,
    alignment?: pc.Vec2,
    spacing?: pc.Vec2,
    maxLength?: number,
  }) {
    const group = ObjectFactory.createFittedLayoutGroupElement({
      orientation : pc.ORIENTATION_VERTICAL,
      alignment   : data.alignment ?? new pc.Vec2(0, 0.5),
      padding     : new pc.Vec4(0, 10, 0, 10),
      spacing     : data.spacing ?? new pc.Vec2(0, 0),
      width       : data.width ?? 400,
      reverseY    : true,
    });
    if (data.label) {
      const txtLabel = ObjectFactory.createTextElement(GameConstant.GAME_FONT_POPPINS_BOLD, {
        fontSize : data.fontSize ?? 24,
        text     : data.label ?? "",
        color    : pc.Color.BLACK,
      });
      group.addChild(txtLabel);
    }
    const inputField = new InputField({
      anchor : new pc.Vec4(0, 0.5, 1, 0.5),
      pivot  : new pc.Vec2(0, 0.5),
      height : data.height ?? 50,
    });
    inputField.value = data.value ?? "";
    inputField.setFontSize(data.fontSize ?? 24);
    // @ts-ignore
    inputField.imgBackground.element!.spriteAsset = AssetManager.find("spr_square_rounded_stroke");

    if (data.placeholder) {
      inputField.txtPlaceHolder.element!.text = data.placeholder;
    }
    else {
        inputField.txtPlaceHolder.element!.enabled = false;
    }

    group.addChild(inputField);
    // @ts-ignore
    group.inputField = inputField;
    // @ts-ignore
    group.fitter.fit();
    return group;
  }

  public static createLabeledMessageDialog({
    label,
    title,
    message,
    color = DialogColor.Blue,
    titleIconAssetName,
    onClosed,
  }: {
    label: string,
    title: string,
    message?: string,
    color?: DialogColor,
    titleIconAssetName?: string,
    onClosed?: () => void,
  }) {
    const dialog = new LabeledDialog(label, title, message, color, titleIconAssetName);
    dialog.on(Dialog.EVENT_CLOSE, onClosed!);
    dialog.setLocalScale(0, 0, 0);
    Tween.createScaleTween(dialog, {
      x : 1,
      y : 1,
      z : 1,
    }, {
      duration   : GameConstant.DURATION_DIALOG,
      onComplete : () => {
        SoundManager.play("sfx_main_screen_to_list");
      },
    }).start();
    return dialog;
  }

  public static createLabeledDialog({
    label,
    title,
    contentBuilder,
    buttonsBuilder,
    color = DialogColor.Blue,
    titleIconAssetName,
  }: {
    label: string,
    title: string,
    contentBuilder?: DialogContentBuilder,
    buttonsBuilder?: DialogButtonsBuilder,
    color?: DialogColor,
    titleIconAssetName?: string,
  }) {
    const dialog = new LabeledDialog(label, title, undefined, color, titleIconAssetName);
    if (contentBuilder) {
      const contents = contentBuilder();
      for (const content of contents) {
        dialog.addContent(content);
      }
    }
    if (buttonsBuilder) {
      dialog.addButtons(...buttonsBuilder());
    }
    dialog.setLocalScale(0, 0, 0);
    Tween.createScaleTween(dialog, {
      x : 1,
      y : 1,
      z : 1,
    }, {
      duration   : GameConstant.DURATION_DIALOG,
      onComplete : () => {
        SoundManager.play("sfx_main_screen_to_list");
      },
    }).start();
    return dialog;
  }

  public static createOptionDialog(data: {
    label: string,
    title: string,
    message?: string,
    options: string[],
    color?: DialogColor,
    optionColor?: DialogColor,
    contentBuilder?: DialogContentBuilder,
    titleIconAssetName?: string,
    onClosed ?: () => void,
  }) {
    const dialog = new OptionDialog(data);
    if (data.contentBuilder) {
      const contents = data.contentBuilder();
      for (const content of contents) {
        dialog.addContent(content);
      }
    }
    const tween = Tween.createTween({ x: 0, y: 800, z: 0 }, { x: 0, y: 0, z: 0 }, {
      duration : GameConstant.DURATION_DIALOG,
      easing   : Easing.Cubic.In,
      onUpdate : (pos : any) => {
        dialog.setLocalPosition(pos.x, pos.y, pos.z);
      },
      onComplete: () => {
        SoundManager.play("sfx_main_screen_to_list");
      },
    });
    dialog.on(Dialog.EVENT_SHOW, tween.start.bind(tween));
    return dialog;
  }
}
