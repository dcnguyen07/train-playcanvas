import { Color, ELEMENTTYPE_GROUP, ELEMENTTYPE_IMAGE, Entity, ORIENTATION_HORIZONTAL, Vec2, Vec4, math } from "playcanvas";
import { ProgressBar } from "../progressBar";
import { SliderDragger } from "./sliderDragger";

export class SliderBar extends Entity {
  private static EVENT_VALUE_CHANGED = "SliderBar:ValueChanged";

  orientation: number;
  progressBar!: ProgressBar;
  handler!: Entity;
  handlerDragger!: SliderDragger;

  private _value: number = 0;
  get value() {
    return this._value;
  }
  set value(val) {
    val = math.clamp(val, 0, 1);
    const oldValue = this._value;
    this._value = val;
    this.onValueChanged(this._value, oldValue);
  }

  constructor(orientation: number = ORIENTATION_HORIZONTAL, data: any = {}) {
    super("SliderBar");

    this.orientation = orientation;

    data.type = ELEMENTTYPE_GROUP;
    data.margin = data.margin || new Vec4();
    this.addComponent("element", data);

    this._initProgressBar();
    this._initHandler();

    this.value = 0.3;
  }

  private _initProgressBar() {
    this.progressBar = new ProgressBar(this.orientation, {
      anchor: new Vec4(0, 0, 1, 1),
    });
    this.addChild(this.progressBar);
  }

  private _initHandler() {
    this.handler = new Entity("handler");
    this.addChild(this.handler);
    this.handler.addComponent("element", {
      type     : ELEMENTTYPE_IMAGE,
      anchor   : new Vec4(0, 0.5, 0, 0.5),
      pivot    : new Vec2(0.5, 0.5),
      margin   : new Vec4(),
      color    : new Color(0.5, 0.5, 0.5),
      width    : 100,
      height   : 100,
      useInput : true,
    });
    this.addChild(this.handler);

    this.handlerDragger = this.handler.addScript(SliderDragger, {
      attributes: {
        container : this.progressBar,
        handler   : this.handler,
      },
    }) as SliderDragger;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onValueChanged(newValue: number, oldValue: number) {
    this.progressBar.progress = newValue;

    this.handler.element!.anchor[this.anchorAxis[0]] = newValue;
    this.handler.element!.anchor[this.anchorAxis[1]] = newValue;
    this.handler.element!.anchor = this.handler.element!.anchor;

    this.fire(SliderBar.EVENT_VALUE_CHANGED, newValue, oldValue);
  }

  get size() {
    return this.orientation === ORIENTATION_HORIZONTAL ? this.element!.calculatedWidth : this.element!.calculatedHeight;
  }

  get axis() {
    return this.orientation === ORIENTATION_HORIZONTAL ? "x" : "y";
  }

  get anchorAxis(): ["x", "z"] | ["y", "w"] {
    return this.orientation === ORIENTATION_HORIZONTAL ? ["x", "z"] : ["y", "w"];
  }
}
