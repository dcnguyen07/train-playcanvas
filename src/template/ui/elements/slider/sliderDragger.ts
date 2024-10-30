import { EVENT_MOUSEDOWN, EVENT_MOUSEMOVE, EVENT_MOUSEUP, EVENT_TOUCHCANCEL, EVENT_TOUCHEND, EVENT_TOUCHMOVE, EVENT_TOUCHSTART,
  ElementMouseEvent, ElementTouchEvent, Entity, ScriptType, Vec2, Vec3, ORIENTATION_HORIZONTAL } from "playcanvas";
import { UIScreen } from "../../uiScreen";
import { SliderBar } from "./sliderBar";

export class SliderDragger extends ScriptType {
  static override get scriptName() {
    return "SliderHandlerDragger";
  }

  orientation: number = ORIENTATION_HORIZONTAL;
  slider!: SliderBar;
  handler!: Entity;
  screen!: UIScreen;

  protected pointerDown = false;
  protected lastScreenPos: Vec3 | null = null;

  private _tempPointerPos = new Vec2();
  private _tempScreenPos = new Vec3();
  private _tempDeltaScreenPos = new Vec3();

  override initialize(): void {
    if (!this.slider) {
      this.slider = this.entity.parent as SliderBar;
    }

    if (!this.handler) {
      this.handler = this.slider.handler;
    }

    if (!this.screen) {
      this.screen = this.slider.element!.screen as UIScreen;
    }

    this.handler.element!.on(EVENT_MOUSEDOWN, this._onPointerDown, this);
    this.handler.element!.on(EVENT_MOUSEMOVE, this._onPointerMove, this);
    this.handler.element!.on(EVENT_MOUSEUP, this._onPointerUp, this);

    this.handler.element!.on(EVENT_TOUCHSTART, this._onPointerDown, this);
    this.handler.element!.on(EVENT_TOUCHMOVE, this._onPointerMove, this);
    this.handler.element!.on(EVENT_TOUCHEND, this._onPointerUp, this);
    this.handler.element!.on(EVENT_TOUCHCANCEL, this._onPointerUp, this);
  }

  private _onPointerDown() {
    this.pointerDown = true;
  }

  private _onPointerMove(event: ElementMouseEvent | ElementTouchEvent) {
    if (!this.pointerDown || this.slider.size === 0) {
      return;
    }

    this._tempPointerPos.set(event.x, event.y);
    this.screen.getScreenSpacePosition(this._tempPointerPos, this._tempScreenPos);

    if (!this.lastScreenPos) {
      this.lastScreenPos = this._tempScreenPos.clone();
      return;
    }

    this._tempDeltaScreenPos.sub2(this._tempScreenPos, this.lastScreenPos);
    const deltaPercent = this._tempDeltaScreenPos[this.slider.axis] / this.slider.size;
    this.slider.value += deltaPercent;

    this.lastScreenPos.copy(this._tempScreenPos);
  }

  private _onPointerUp() {
    this.pointerDown = false;
    this.lastScreenPos = null;
  }
}
