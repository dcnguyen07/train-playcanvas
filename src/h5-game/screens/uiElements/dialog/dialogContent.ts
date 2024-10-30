import * as pc from "playcanvas";

export default class DialogContent extends pc.Entity {
  protected _height = -1;

  constructor() {
    super("DialogContent");
  }

  get height() {
    return this._height;
  }

  public verify() {
    if (this._height < 0) {
      this.calculateHeight();
    }
    return this._height > 0;
  }

  protected calculateHeight() {
    console.warn("calculateHeight not implemented");
  }
}
