import { EVENT_MOUSEDOWN, EVENT_MOUSEMOVE, EVENT_MOUSEUP, EVENT_TOUCHCANCEL, EVENT_TOUCHEND, EVENT_TOUCHMOVE, EVENT_TOUCHSTART, MouseEvent, ScriptType, TouchEvent, Vec3 } from "playcanvas";

type PointerData = {
  position: Vec3;
  touchID: number;
};
export default class InputHandler extends ScriptType {
  static override get scriptName() {
    return "inputHandler";
  }

  public static readonly InputEvent = {
    OnPointerDown : "InputHandler:OnPointerDown",
    OnPointerUp   : "InputHandler:OnPointerUp",
    OnPointerMove : "InputHandler:OnPointerMove",
  };

  private _isTouched: boolean = false;
  private _currentTouchID: number = null;
  private _currentPointerPosition: Vec3;

  constructor(args: any) {
    super(args);
  }

  override initialize() {
    this._initMouse();
    this._initTouch();
  }

  private _initMouse() {
    let mouse = this.app.mouse;
    if (mouse === null) {
      return;
    }
    // console.log("Mouse is enabled");
    mouse.on(EVENT_MOUSEDOWN, (event) => this._handleInputEvent(event, this._onPointerDown.bind(this)));
    mouse.on(EVENT_MOUSEMOVE, (event) => this._handleInputEvent(event, this._onPointerMove.bind(this)));
    mouse.on(EVENT_MOUSEUP, (event) => this._handleInputEvent(event, this._onPointerUp.bind(this)));
  }

  private _initTouch() {
    let touch = this.app.touch;
    if (touch === null) {
      return;
    }
    // console.log("Touch is enabled");
    touch.on(EVENT_TOUCHSTART, (event) => this._handleInputEvent(event, this._onPointerDown.bind(this)));
    touch.on(EVENT_TOUCHMOVE, (event) => this._handleInputEvent(event, this._onPointerMove.bind(this)));
    touch.on(EVENT_TOUCHEND, (event) => this._handleInputEvent(event, this._onPointerUp.bind(this)));
    touch.on(EVENT_TOUCHCANCEL, (event) => this._handleInputEvent(event, this._onPointerUp.bind(this)));
  }

  private _handleInputEvent(event: any, callback: (event: any) => void) {
    event.event.preventDefault();
    if (this.enabled) {
      callback(event);
    }
  }

  private _onPointerDown(event: any) {
    if (!this._isTouched) {
      let pointerData = this._getPointerPosition(event);
      this._currentTouchID = pointerData.touchID;
      this._isTouched = true;
      this._currentPointerPosition = pointerData.position;
      this.fire(InputHandler.InputEvent.OnPointerDown, pointerData.position);
    }
  }

  private _onPointerUp(event: any) {
    if (this._isTouched) {
      let pointerData = this._getPointerPosition(event);
      if (pointerData.touchID === this._currentTouchID) {
        this._isTouched = false;
        this.fire(InputHandler.InputEvent.OnPointerUp, pointerData.position);
      }
    }
  }

  private _onPointerMove(event: any) {
    if (this._isTouched) {
      let pointerData = this._getPointerPosition(event);
      if (pointerData.touchID === this._currentTouchID) {
        this._currentPointerPosition = pointerData.position;
        this.fire(InputHandler.InputEvent.OnPointerMove, pointerData.position);
      }
    }
  }

  private _getPointerPosition(event: any): PointerData {
    let x = 0;
    let y = 0;
    let pointerID : number;
    if (event instanceof MouseEvent) {
      x = event.x;
      y = event.y;
      pointerID = 0;
    }
    else if (event instanceof TouchEvent && event.changedTouches) {
      let trueChangedTouch = event.changedTouches.find((touch) => touch.id === this._currentTouchID);
      if (trueChangedTouch === undefined) {
        trueChangedTouch = event.changedTouches[0];
      }
      x = trueChangedTouch.x;
      y = trueChangedTouch.y;
      pointerID = trueChangedTouch.id;
    }
    return {
      position : new Vec3(x, y, 0),
      touchID  : pointerID,
    };
  }

  override onDisable() {
    if (this._isTouched) {
      this.fire(InputHandler.InputEvent.OnPointerUp, this._currentPointerPosition);
    }
    this._isTouched = false;
    this._currentTouchID = null;
  }
}
