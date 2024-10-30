import { ElementComponent, ScriptType } from "playcanvas";

export class HandleClickOutsideOfElement extends ScriptType {
  static override get scriptName() {
    return "HandleClickOutsideOfElement";
  }

  static EVENT_INVOKED = "HandleClickOutsideOfElement:Invoked";

  element!: ElementComponent;

  private _pointerDown = false;
  private _pointerUp = false;
  private _clickedElementThisFrame = false;

  override onEnable(): void {
    this.app.mouse?.on("mousedown", this._onPointerDown, this);
    this.app.mouse?.on("mouseup", this._onPointerUp, this);
    this.app.touch?.on("touchstart", this._onPointerDown, this);
    this.app.touch?.on("touchend", this._onPointerUp, this);
    this.app.touch?.on("touchcancel", this._onPointerUp, this);
    this.element.on("mouseup", this._onElementClick, this);
    this.element.on("touchend", this._onElementClick, this);
    this.element.on("touchcancel", this._onElementClick, this);
    this.element.on("click", this._onElementClick, this);
  }

  override onDisable(): void {
    this.app.mouse?.off("mousedown", this._onPointerDown, this);
    this.app.mouse?.off("mouseup", this._onPointerUp, this);
    this.app.touch?.off("touchstart", this._onPointerDown, this);
    this.app.touch?.off("touchend", this._onPointerUp, this);
    this.app.touch?.off("touchcancel", this._onPointerUp, this);
    this.element.off("mouseup", this._onElementClick, this);
    this.element.off("touchend", this._onElementClick, this);
    this.element.off("touchcancel", this._onElementClick, this);
    this.element.off("click", this._onElementClick, this);
  }

  override update(): void {
    if (this._pointerDown && this._pointerUp && !this._clickedElementThisFrame) {
      this.fire(HandleClickOutsideOfElement.EVENT_INVOKED);
    }

    if (this._pointerUp) {
      this._pointerDown = false;
      this._pointerUp = false;
    }
    this._clickedElementThisFrame = false;
  }

  private _onPointerDown() {
    this._pointerDown = true;
  }

  private _onPointerUp() {
    this._pointerUp = true;
  }

  private _onElementClick() {
    this._clickedElementThisFrame = true;
  }
}
