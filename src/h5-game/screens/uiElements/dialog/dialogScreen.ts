import * as pc from "playcanvas";
import { Util } from "../../../../template/helpers/util";
import { ObjectFactory } from "../../../../template/objects/objectFactory";
import { UIScreen } from "../../../../template/ui/uiScreen";
import { Dialog } from "./dialog";


export default class DialogScreen extends UIScreen {
  private static _instance: DialogScreen;
  public static get Instance() : DialogScreen {
    if (!DialogScreen._instance) {
      DialogScreen._instance = new DialogScreen();
    }
    return DialogScreen._instance;
  }

  constructor() {
    super();
    DialogScreen._instance = this;
  }

  background!: pc.Entity;
  foreground!: pc.Entity;
  dialogQueue: Dialog[] = [];
  currentDialog!: Dialog;

  override create() {
    super.create();
    this._createBackground();
    this._createForeground();
  }

  private _createForeground() {
    this.foreground = ObjectFactory.createEmptyImageElement({
      color    : pc.Color.BLACK,
      opacity  : 0.01,
      useInput : true,
    });
    if (this.foreground.element) {
      this.foreground.element.anchor = new pc.Vec4(0, 0, 1, 1);
      this.foreground.element.pivot = new pc.Vec2(0.5, 1);
    }
    this.foreground.enabled = false;
  }

  private _createBackground() {
    this.background = ObjectFactory.createEmptyImageElement({
      color    : pc.Color.BLACK,
      opacity  : 0.8,
      useInput : true,
    });
    if (this.background.element) {
      this.background.element.anchor = new pc.Vec4(0, 0, 1, 1);
      this.background.element.pivot = new pc.Vec2(0.5, 1);
    }
    this.addChild(this.background);
    this.background.enabled = false;
  }

  showDialog(dialog: Dialog) {
    if (this.currentDialog) {
      this.dialogQueue.push(dialog);
      return;
    }
    this.currentDialog = dialog;
    this.addChild(dialog);
    dialog.fit();
    if (dialog.tapAnywhereToClose) {
      Util.registerOnceTouch(this.background.element!, this.closeDialog.bind(this, dialog));
    }
    dialog.once(Dialog.EVENT_CLOSE, this._onDialogClosed, this);
    dialog.fire(Dialog.EVENT_SHOW);
    this.background.enabled = true;
    this.foreground.enabled = true;
    this.addChild(this.foreground);
    setTimeout(() => {
      this.foreground.enabled = false;
      this.removeChild(this.foreground);
    }, 500);
  }

  closeDialog(dialog: Dialog) {
    dialog.close();
    this.fire(Dialog.EVENT_CLOSE, dialog);
  }

  private _onDialogClosed() {
    this.currentDialog = undefined!;
    if (this.dialogQueue.length > 0) {
      this.showDialog(this.dialogQueue.shift()!);
    }
    else {
      this.background.enabled = false;
    }
    this.fire(Dialog.EVENT_CLOSE);
  }
}
