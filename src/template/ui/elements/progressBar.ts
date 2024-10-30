import { Color, ELEMENTTYPE_GROUP, ELEMENTTYPE_IMAGE, Entity, ORIENTATION_HORIZONTAL, Vec4 } from "playcanvas";

export class ProgressBar extends Entity {
  static EVENT_PROGRESS_CHANGED = "ProgressBar:ProgressChanged";

  orientation: number;
  imgBackground!: Entity;
  imgProgress!: Entity;

  private _progress: number = 0;
  get progress() {
    return this._progress;
  }
  set progress(value) {
    const oldValue = this._progress;
    this._progress = value;
    this.onProgressChanged(this._progress, oldValue);
  }

  constructor(orientation: number = ORIENTATION_HORIZONTAL, data: any = {}) {
    super("ProgressBar");

    this.orientation = orientation;

    data.type = ELEMENTTYPE_GROUP;
    data.margin = data.margin || new Vec4();
    this.addComponent("element", data);

    this._initBackground();
    this._initProgress();
  }

  private _initBackground() {
    this.imgBackground = new Entity("bg");
    this.addChild(this.imgBackground);
    this.imgBackground.addComponent("element", {
      type   : ELEMENTTYPE_IMAGE,
      anchor : new Vec4(0, 0, 1, 1),
      margin : new Vec4(),
    });
  }

  private _initProgress() {
    this.imgProgress = new Entity("progress");
    this.addChild(this.imgProgress);
    this.imgProgress.addComponent("element", {
      type   : ELEMENTTYPE_IMAGE,
      margin : new Vec4(),
      color  : new Color(),
    });

    if (this.orientation === ORIENTATION_HORIZONTAL) {
      this.imgProgress.element!.anchor = new Vec4(0, 0, 0, 1);
    }
    else {
      this.imgProgress.element!.anchor = new Vec4(0, 0, 1, 0);
    }
  }

  protected onProgressChanged(newValue: number, oldValue: number) {
    if (this.orientation === ORIENTATION_HORIZONTAL) {
      this.imgProgress.element!.anchor.z = newValue;
    }
    else {
      this.imgProgress.element!.anchor.w = newValue;
    }
    this.imgProgress.element!.anchor = this.imgProgress.element!.anchor;

    this.fire(ProgressBar.EVENT_PROGRESS_CHANGED, newValue, oldValue);
  }
}
