/* eslint-disable default-param-last */
import { Util } from "../../../../template/helpers/util";
import { SoundManager } from "../../../../template/soundManager";
/* eslint-disable max-params */
import { Dialog, DialogColor } from "./dialog";
import { DialogContentBuilder } from "./dialogBuilder";
import { DialogButton } from "./dialogButton";
import { LabeledDialog } from "./labeledDialog";

export class OptionDialog extends LabeledDialog {
  buttonColor!: pc.Color;

  data: string[];
  private _onOptionSelected?: (index: number, item: string) => void;
  constructor({
    options,
    label,
    title,
    message,
    color = DialogColor.Blue,
    buttonColor = DialogColor.Blue,
    titleIconAssetName,
  }: {
    label: string,
    title: string,
    message?: string,
    options: string[],
    color?: DialogColor,
    buttonColor?: DialogColor,
    contentBuilder?: DialogContentBuilder,
    titleIconAssetName?: string,
  }) {
    super(label, title, message, color, titleIconAssetName);
    this.buttonColor = Util.hexToRgb(buttonColor);
    this.data = options;

    this.createButtons();
  }

  override resize() {
    super.resize();
  }

  createButtons() {
    this.data.forEach((item, index) => {
      const button = new DialogButton(item, this.buttonColor);
      button.registerClick(this._optionSelected.bind(this, index));
      this.addButtons(button);
    });
  }

  public onOptionSelected(callback: (index: number, item: string) => void) {
    this._onOptionSelected = callback;
  }

  protected _optionSelected(index: number) {
    this.fire(Dialog.EVENT_OPTION_SELECTED, index, this.data[index]);
    if (this._onOptionSelected) {
      this._onOptionSelected(index, this.data[index]);
    }
    this.close();
    SoundManager.play("sfx_menu_button");
  }
}
