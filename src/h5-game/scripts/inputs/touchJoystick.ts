import * as pc from "playcanvas";

export const enum JoyStickType {
    Drag = "drag",
    Fixed = "fixed",
    Relative = "relative",
}

export const enum JoyStickPositionOnRelease {
  Stay = "stay",
    Original = "original",
    LastStart = "lastStart",
}

export class TouchJoystick extends pc.ScriptType {
  static readonly Event = {
    Start : "joystick:start",
    Move  : "joystick:move",
    End   : "joystick:end",
  };
  static override get scriptName() {
    return "TouchJoystick";
  }

  identifier = "joystick0";
  type: JoyStickType = JoyStickType.Fixed;
  baseEntity: pc.Entity = null;
  nubEntity: pc.Entity = null;
  axisDeadZone: number = 10;
  axisRange: number = 50;
  hideOnRelease: boolean = false;
  positionOnRelease: JoyStickPositionOnRelease = JoyStickPositionOnRelease.Stay;
  vibrationPress: number = 0;


  axisX!: number;
  axisY!: number;
  private _originalLocalPosition: pc.Vec3;
  private _lastPointerDownPosition: pc.Vec3;
  private _inputDown: boolean = false;
  private _pointerId: number;
  private _canVibrate: boolean;
  private _pointerDown: boolean;

  constructor(args: any) {
    super(args);
    this._originalLocalPosition = new pc.Vec3();
    this._lastPointerDownPosition = new pc.Vec3();
    this._inputDown = false;
    this._pointerId = -1;
    this._canVibrate = !!navigator.vibrate;
    this._pointerDown = false;
  }

  override initialize() {
    if (
      // @ts-ignore
      window.touchJoypad && window.touchJoypad.sticks[this.identifier] !== undefined
    ) {
      console.warn(
        `Touch joystick identifier already used, please use another for Entity: ${
          this.entity.name
        }`
      );
      return;
    }

    this._originalLocalPosition.copy(this.baseEntity.getLocalPosition());
    this._lastPointerDownPosition = new pc.Vec3();

    this._setAxisValues(0, 0);
    this._inputDown = false;
    this._pointerId = -1;

    this._canVibrate = !!navigator.vibrate;

    this._setButtonState(false);

    this.on("state", (state) => {
      this._setEvents(state ? "on" : "off");
    });

    this.on("destroy", () => {
      // @ts-ignore
      if (window.touchJoypad) {
        // @ts-ignore
        window.touchJoypad.sticks[this.identifier] = undefined;
      }
    });

    this._setEvents("on");
  }

  private _setEvents(offOn: string) {
    this._setAxisValues(0, 0);
    this._pointerDown = false;
    this._pointerId = -1;

    this.baseEntity.enabled = !this.hideOnRelease;

    // @ts-ignore
    this.entity.element[offOn]("mousedown", this._onMouseDown, this);
    // @ts-ignore
    this.entity.element[offOn]("mousemove", this._onMouseMove, this);
    // @ts-ignore
    this.entity.element[offOn]("mouseup", this._onMouseUp, this);

    if (this.app.touch) {
      // @ts-ignore
      this.entity.element[offOn]("touchstart", this._onTouchDown, this);
      // @ts-ignore
      this.entity.element[offOn]("touchmove", this._onTouchMove, this);
      // @ts-ignore
      this.entity.element[offOn]("touchend", this._onTouchUp, this);
      // @ts-ignore
      this.entity.element[offOn]("touchcancel", this._onTouchUp, this);
    }
  }

  static __uiPos = new pc.Vec2();
  screenToUi(screenPosition: pc.Vec3) {
    const uiPos = TouchJoystick.__uiPos;

    const canvasWidth = this.app.graphicsDevice.canvas.clientWidth;
    const canvasHeight = this.app.graphicsDevice.canvas.clientHeight;

    uiPos.x = screenPosition.x / canvasWidth;
    uiPos.y = screenPosition.y / canvasHeight;

    uiPos.mulScalar(2).subScalar(1);
    uiPos.y *= -1;

    return uiPos;
  }

  private _onMouseDown(e: pc.ElementMouseEvent) {
    // @ts-ignore
    e.id = 0;
    this._onPointerDown(e);
    if (this._pointerDown) {
      e.stopPropagation();
    }
  }

  private _onMouseMove(e: pc.ElementMouseEvent) {
    // @ts-ignore
    e.id = 0;
    this._onPointerMove(e);
    if (this._pointerDown) {
      e.stopPropagation();
    }
  }

  private _onMouseUp(e: pc.ElementMouseEvent) {
    // @ts-ignore
    e.id = 0;
    if (this._pointerDown) {
      e.stopPropagation();
    }

    this._onPointerUp(e);
  }

  private _onTouchDown(e: pc.ElementTouchEvent) {
    if (this._pointerDown) {
      return;
    }

    const wasPointerDown = this._pointerDown;
    // @ts-ignore
    e.id = e.touch.identifier;
    this._onPointerDown(e);

    if (!wasPointerDown && this._pointerDown) {
      e.stopPropagation();
    }
  }

  private _onTouchMove(e: pc.ElementTouchEvent) {
    // @ts-ignore
    e.id = e.touch.identifier;
    this._onPointerMove(e);

    if (this._pointerDown) {
      e.stopPropagation();
    }

    e.event.preventDefault();
  }

  private _onTouchUp(e: pc.ElementTouchEvent) {
    if (this._pointerDown) {
      // @ts-ignore
      e.id = e.touch.identifier;
      this._onPointerUp(e);
      e.stopPropagation();
    }

    e.event.preventDefault();
  }

  private _onPointerDown(pointer: any) {
    const uiPos = this.screenToUi(pointer);
    // eslint-disable-next-line default-case
    switch (this.type) {
    case JoyStickType.Drag:
    case JoyStickType.Relative:
      this.baseEntity.setPosition(uiPos.x, uiPos.y, 0);
      this.nubEntity.setLocalPosition(0, 0, 0);
      this._pointerDown = true;
      break;
    case JoyStickType.Fixed:
      this.nubEntity.setPosition(uiPos.x, uiPos.y, 0);
      this._updateAxisValuesFromNub();
      this._pointerDown = true;
      break;
    }

    if (this._pointerDown) {
      if (this._canVibrate && this.vibrationPress !== 0) {
        navigator.vibrate(this.vibrationPress);
      }

      this._pointerId = pointer.id ? pointer.id : 0;
      this._setButtonState(true);
      this._lastPointerDownPosition.copy(
        this.baseEntity.getLocalPosition()
      );
      this.baseEntity.enabled = true;

      this._onPointerMove(pointer);
      this.fire(TouchJoystick.Event.Start, pointer);
    }
  }

  static __tempNubPos = new pc.Vec3();
  static __tempBasePos = new pc.Vec3();
  private _onPointerMove(pointer: any) {
    if (this._pointerDown && this._pointerId === pointer.id) {
      const uiPos = this.screenToUi(pointer);
      const axisRangeSq = this.axisRange * this.axisRange;
      this.nubEntity.setPosition(uiPos.x, uiPos.y, 0);

      const nubPos = TouchJoystick.__tempNubPos;
      nubPos.copy(this.nubEntity.getLocalPosition());

      const nubLengthSq = nubPos.lengthSq();

      if (nubLengthSq >= axisRangeSq) {
        if (this.type === "drag") {
          const distanceDiff = nubPos.length() - this.axisRange;
          const basePos = TouchJoystick.__tempBasePos;
          basePos.copy(nubPos);
          basePos.normalize().mulScalar(distanceDiff);
          basePos.add(this.baseEntity.getLocalPosition());
          this.baseEntity.setLocalPosition(basePos);
        }

        nubPos.normalize().mulScalar(this.axisRange);
        this.nubEntity.setLocalPosition(nubPos);
      }

      this._updateAxisValuesFromNub();
    }
  }

  private _onPointerUp(pointer: any) {

    if (this._pointerDown && this._pointerId === pointer.id) {
      this.nubEntity.setLocalPosition(0, 0, 0);
      if (this.hideOnRelease) {
        this.baseEntity.enabled = false;
      }

      // eslint-disable-next-line default-case
      switch (this.positionOnRelease) {
      case JoyStickPositionOnRelease.Original:
        this.baseEntity.setLocalPosition(this._originalLocalPosition);
        break;
      case JoyStickPositionOnRelease.LastStart:
        this.baseEntity.setLocalPosition(
          this._lastPointerDownPosition
        );
        break;
      }

      this._pointerId = -1;
      this._updateAxisValuesFromNub();
      this._setButtonState(false);
      this._pointerDown = false;
      this.fire(TouchJoystick.Event.End, pointer);
    }
  }

  private _updateAxisValuesFromNub() {
    const axisRange = this.axisRange - this.axisDeadZone;

    const nubPos = this.nubEntity.getLocalPosition();
    const signX = Math.sign(nubPos.x);
    const signY = Math.sign(nubPos.y);

    const axisX = pc.math.clamp(
      Math.abs(nubPos.x) - this.axisDeadZone,
      0,
      axisRange
    ) * signX;
    const axisY = pc.math.clamp(
      Math.abs(nubPos.y) - this.axisDeadZone,
      0,
      axisRange
    ) * signY;

    this._setAxisValues(axisX / axisRange, axisY / axisRange);
  }

  private _setAxisValues(x: number, y: number) {
    // @ts-ignore
    if (window.touchJoypad) {
      // @ts-ignore
      window.touchJoypad.sticks[this.identifier] = {
        x : x,
        y : y,
      };
    }

    this.axisX = x;
    this.axisY = y;
  }

  private _setButtonState(state: boolean) {
    // @ts-ignore
    if (window.touchJoypad) {
      // @ts-ignore
      window.touchJoypad.buttonStates[this.identifier] = state
        ? Date.now()
        : null;
    }
  }

  reset() {
    this._setAxisValues(0, 0);
    if (this._pointerDown) {
      this._onPointerUp({ id: this._pointerId });
    }
  }
}
