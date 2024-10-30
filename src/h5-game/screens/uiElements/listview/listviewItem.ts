import * as pc from "playcanvas";

export default class ListViewItem extends pc.Entity {
  protected _index: number = 0;

  constructor() {
    super("ListViewItem");
    window.addEventListener("resize", () => this.resize());
  }

  get index(): number {
    return this._index;
  }

  set index(value: number) {
    this._index = value;
  }

  public verify() {
    return !!this.element;
  }

  resize(): void {
  }
}
