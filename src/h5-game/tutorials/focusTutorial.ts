/* eslint-disable no-param-reassign */
/* eslint-disable max-depth */
/* eslint-disable max-len */
/* eslint-disable max-params */
import * as pc from "playcanvas";
import { Game } from "../../game";
import { AssetManager } from "../../template/assetManager";
import { Tween } from "../../template/systems/tween/tween";
import { Tweener } from "../../template/systems/tween/tweener";
import { LanguageData } from "../data/languageData";

export interface IMaskTutorialData {
  hand: {
    scale: number;
    angle: number;
    moveSpeed: number;
    moveDistance: number;
    offsetX: number;
    offsetY: number;
  };
  focus: {
    shape: string;
    radius: number;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  message: {
    text: string;
    distance: number;
    anchor: pc.Vec2;
    angle: number;
    offsetX: number;
    offsetY: number;
  };
  backgroundColor: string;
  backgroundOpacity: number;
  blockInput: boolean;
}

export const MaskTutorialData: IMaskTutorialData = {
  hand: {
    scale        : 1,
    angle        : 0,
    moveSpeed    : 1,
    moveDistance : 50,
    offsetX      : 0,
    offsetY      : 0,
  },
  focus: {
    shape  : "circle",
    radius : 100,
    x      : 0,
    y      : 0,
    width  : 0,
    height : 0,
  },
  message: {
    text     : "",
    distance : 200,
    anchor   : new pc.Vec2(0.8, 0.5),
    angle    : 0,
    offsetX  : 0,
    offsetY  : 0,
  },
  backgroundColor   : "#000000",
  backgroundOpacity : 0.85,
  blockInput        : true,
};

export enum FocusTutorialEvent{
  TutorialCompleted = "FocusTutorial:TutorialCompleted",
  ClickOnFocusArea = "FocusTutorial:ClickOnFocusArea",
}

export type handData = {
  image: HTMLImageElement;
  x: number;
  y: number;
  angle: number;
  width: number;
  height: number;
  anchor: pc.Vec2;
  scale: number;
  offsetX : number;
  offsetY: number;
};

export type messageFrameData = {
  image: HTMLImageElement;
  x: number;
  y: number;
  angle: number;
  distance: number;
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
};

// Define a custom interface that extends MouseEvent
interface CustomMouseEvent extends MouseEvent {
  sender: any;
}

// Define a custom interface that extends TouchEvent
  interface CustomTouchEvent extends TouchEvent {
  sender: any;
}

export default class FocusTutorial extends pc.EventHandler {

  private static _instance: FocusTutorial | null = null;

  static get instance(): FocusTutorial {
    if (!FocusTutorial._instance) {
      FocusTutorial._instance = new FocusTutorial();
    }
    return FocusTutorial._instance;
  }

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private tutorialData: IMaskTutorialData;
  private handTween: Tweener | null;
  private focusTween: Tweener | null;
  private ratio: number;
  private sizeRatio: number;
  private hand : handData;
  private messageFrame : messageFrameData;
  private referenceResolution : any;
  private actualResolution : any;
  private scaleFactor : number;

  constructor() {
    super();
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d")!;
    this.tutorialData = MaskTutorialData;
    this.handTween = null;
    this.focusTween = null;
    this.ratio = 1;
    this.sizeRatio = 1;
    this.referenceResolution = { x: 1080, y: 1920 };
    this.actualResolution = { x: window.innerWidth * window.devicePixelRatio, y: window.innerHeight * window.devicePixelRatio };
    this._calculateScaleFactor();
    this.init();
  }

  init() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = Game.app.graphicsDevice.width;
    this.canvas.height = Game.app.graphicsDevice.height;
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0px";
    this.canvas.style.left = "0px";
    this.canvas.style.zIndex = "1";
    this.canvas.style.background = "transparent";
    document.body.appendChild(this.canvas);
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    this.context = this.canvas.getContext("2d");

    let handAsset = AssetManager.find("spr_hand_focus").resource;
    this.hand = {
      image   : handAsset.getSource(),
      x       : 0,
      y       : 0,
      angle   : 0,
      width   : handAsset.width,
      height  : handAsset.height,
      anchor  : new pc.Vec2(0.3, 0),
      scale   : 1,
      offsetX : 0,
      offsetY : 0,
    };

    let messageFrameAsset = AssetManager.find("tex_white").resource;
    this.messageFrame = {
      image    : messageFrameAsset.getSource(),
      x        : 0,
      y        : 0,
      angle    : 0,
      distance : 150,
      width    : 604,
      height   : 256,
      scale    : 1,
      offsetX  : 0,
      offsetY  : 0,
    };

    this.onResize();

    this.on(FocusTutorialEvent.TutorialCompleted, this.hide, this);
  }

  /**
   *
   * @param {Object} data
   * @returns {IMaskTutorialData}
   */
  _copyData(data : IMaskTutorialData) : IMaskTutorialData {
    let newData = { ...MaskTutorialData };
    let hand = { ...newData.hand };
    let focus = { ...newData.focus };
    let message = { ...newData.message };

    if (data.hand) {
      hand = { ...data.hand };
    }

    if (data.focus) {
      focus = { ...data.focus };
    }

    if (data.message) {
      message = { ...data.message };
    }

    newData.hand = hand;
    newData.focus = focus;
    newData.message = message;
    return newData;
  }

  /**
   * @param {MaskTutorialData} data
   */
  pointingTutorial(data : any) {
    if (!data) {
      return;
    }
    Game.app.on("resize", this.onResize, this);
    Game.app.on("postrender", this.draw, this);
    this.canvas.style.display = "block";

    this.tutorialData = this._copyData(data);
    this.hand.x = this.tutorialData.focus.x + this.tutorialData.hand.offsetX;
    this.hand.y = this.tutorialData.focus.y + this.tutorialData.hand.offsetY;
    this.hand.angle = this.tutorialData.hand.angle;
    this.hand.scale = this.tutorialData.hand.scale;

    if (this.handTween) {
      this.handTween.stop();
    }

    let endPos = { x: this.hand.x, y: this.hand.y };
    endPos.x -= this.tutorialData.hand.moveDistance * Math.cos(this.hand.angle * pc.math.DEG_TO_RAD - Math.PI / 2);
    endPos.y -= this.tutorialData.hand.moveDistance * Math.sin(this.hand.angle * pc.math.DEG_TO_RAD - Math.PI / 2);

    this.handTween = Tween.createTween(this.hand, endPos, {
      duration : 1 / this.tutorialData.hand.moveSpeed,
      loop     : true,
      yoyo     : true,
      easing   : Tween.Easing.Sinusoidal.InOut,
    }).start();

    if (this.focusTween) {
      this.focusTween.stop();
    }

    if (this.tutorialData.focus.shape === "circle") {
      let endRadius = Math.abs(this.tutorialData.focus.radius * this.scaleFactor);
      let startRadius = 5000;
      this.focusTween = Tween.createTween({ radius: startRadius }, { radius: endRadius }, {
        duration : 0.35,
        onUpdate : (d : any) => {
          this.tutorialData.focus.radius = d.radius;
        },
      }).start();
    }
    else {
      let endWidth = Math.abs(this.tutorialData.focus.width);
      let endHeight = Math.abs(this.tutorialData.focus.height);
      let startWidth = 5000;
      let startHeight = 5000;
      this.focusTween = Tween.createTween({ width: startWidth, height: startHeight }, { width: endWidth, height: endHeight }, {
        duration : 0.6,
        onUpdate : (d: any) => {
          this.tutorialData.focus.width = d.width;
          this.tutorialData.focus.height = d.height;
        },
      }).start();
    }

    this.canvas.style.pointerEvents = "auto";
    document.addEventListener("mousedown", this._handleInputEvent.bind(this));
    document.addEventListener("touchstart", this._handleInputEvent.bind(this));
  }

  private _handleInputEvent(event: MouseEvent | TouchEvent): boolean {
    if (this.canvas.style.display === "none") {
      return false;
    }

    if (!this.tutorialData.blockInput) {
      this.fire(FocusTutorialEvent.ClickOnFocusArea, event);
      return true;
    }
    let x = 0;
    let y = 0;
    if (event instanceof MouseEvent) {
      x = event.clientX;
      y = event.clientY;
    }
    let isClickOnFocusArea = false;
    let ratio = 1 / window.devicePixelRatio;
    if (this.tutorialData.focus.shape === "circle") {
      let distance = Math.sqrt((x - this.tutorialData.focus.x * ratio) ** 2 + (y - this.tutorialData.focus.y * ratio) ** 2);
      if (distance < this.tutorialData.focus.radius * ratio) {
        isClickOnFocusArea = true;
      }
    }
    else {
      let width = this.tutorialData.focus.width * ratio;
      let height = this.tutorialData.focus.height * ratio;
      let fx = this.tutorialData.focus.x * ratio;
      let fy = this.tutorialData.focus.y * ratio;
      if (x > fx - width * 0.5
        && x < fx + width * 0.5
        && y > fy - height * 0.5
        && y < fy + height * 0.5) {
        isClickOnFocusArea = true;
      }
    }

    if ("sender" in event && event.sender === this) {
      return false;
    }

    if (isClickOnFocusArea && this.tutorialData.blockInput && !this.focusTween.isPlaying()) {
      this.fire(FocusTutorialEvent.ClickOnFocusArea, event);
      let newEvent = this.cloneEvent(event, this);
      Game.app.graphicsDevice.canvas.dispatchEvent(newEvent);
      return true;
    }
    else {
      if (!(event instanceof TouchEvent)) {
        event.preventDefault();
      }
      event.stopImmediatePropagation();
      event.stopPropagation();
      return false;
    }
  }

  cloneMouseEvent(originalEvent: MouseEvent): MouseEvent {
    return new MouseEvent(originalEvent.type, originalEvent);
  }

  cloneTouchEvent(originalEvent: TouchEvent): TouchEvent {
    let clonedTouches: Touch[] = [];
    let clonedTargetTouches: Touch[] = [];
    let clonedChangedTouches: Touch[] = [];

    // Clone touches
    for (let i = 0; i < originalEvent.touches.length; i++) {
      let originalTouch = originalEvent.touches.item(i)!;
      let clonedTouch = new Touch(originalTouch);
      clonedTouches.push(clonedTouch);
    }

    // Clone targetTouches
    for (let i = 0; i < originalEvent.targetTouches.length; i++) {
      let originalTouch = originalEvent.targetTouches.item(i)!;
      let clonedTouch = new Touch(originalTouch);
      clonedTargetTouches.push(clonedTouch);
    }

    // Clone changedTouches
    for (let i = 0; i < originalEvent.changedTouches.length; i++) {
      let originalTouch = originalEvent.changedTouches.item(i)!;
      let clonedTouch = new Touch(originalTouch);
      clonedChangedTouches.push(clonedTouch);
    }
    let newEvent = new TouchEvent(originalEvent.type, {
      ...originalEvent,
      touches        : clonedTouches,
      targetTouches  : clonedTargetTouches,
      changedTouches : clonedChangedTouches,
    });
    return newEvent;
  }

  cloneEvent(originalEvent: MouseEvent | TouchEvent, sender : any): MouseEvent | TouchEvent {
    if (originalEvent instanceof MouseEvent) {
      let newMouseEvent = this.cloneMouseEvent(originalEvent);
      (newMouseEvent as CustomMouseEvent).sender = sender;
      return newMouseEvent;
    }
    else if (originalEvent instanceof TouchEvent) {
      let newTouchEvent = this.cloneTouchEvent(originalEvent);
      (newTouchEvent as CustomTouchEvent).sender = sender;
      return newTouchEvent;
    }
    else {
      throw new Error("Unsupported event type");
    }
  }

  drawHand() : void {
    let width = this.hand.width * this.hand.scale;
    let height = this.hand.height * this.hand.scale;
    let x = this.hand.x;
    let y = this.hand.y;

    x *= this.ratio;
    y *= this.ratio;
    width *= this.ratio * this.scaleFactor;
    height *= this.ratio * this.scaleFactor;

    this.context.save();
    this.context.translate(x, y);
    this.context.rotate(this.hand.angle * pc.math.DEG_TO_RAD);
    this.context.translate(-width * this.hand.anchor.x, -height * this.hand.anchor.y);
    this.context.drawImage(this.hand.image, 0, 0, width, height);
    this.context.translate(-width * this.hand.anchor.x, -height * this.hand.anchor.y);
    this.context.rotate(-this.hand.angle * pc.math.DEG_TO_RAD);
    this.context.translate(-x, -y);
    this.context.restore();
  }

  hide() {
    this.canvas.style.display = "none";
    this.handTween?.stop();
    this.focusTween?.stop();
    Game.app.off("resize", this.onResize, this);
    Game.app.off("postrender", this.draw, this);
    document.removeEventListener("mousedown", this._handleInputEvent);
    document.removeEventListener("touchstart", this._handleInputEvent);
    this.canvas.style.pointerEvents = "none";
  }

  maskRect(x: number, y: number, width: number, height: number, color = "#000000", opacity = 0.75): void {
    this.context.fillStyle = color;
    this.context.globalAlpha = opacity;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.clearRect(x, y, width, height);
    this.context.globalAlpha = 1;
  }

  maskCircle(x: number, y: number, radius: number, color = "#000000", opacity = 0.75): void {
    this.context.fillStyle = color;
    this.context.globalAlpha = opacity;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.globalCompositeOperation = "destination-out";
    this.context.beginPath();
    this.context.arc(x, y, radius, 0, 2 * Math.PI, false);
    this.context.fill();
    this.context.globalCompositeOperation = "source-over";

    this.context.globalAlpha = 1;
  }

  drawMask() : void {
    let x = this.tutorialData.focus.x * this.ratio;
    let y = this.tutorialData.focus.y * this.ratio;

    let width = this.tutorialData.focus.width * this.ratio * this.scaleFactor;
    let height = this.tutorialData.focus.height * this.ratio * this.scaleFactor;
    let radius = this.tutorialData.focus.radius * this.ratio;

    if (this.tutorialData.focus.shape === "circle") {
      this.maskCircle(x, y, radius, this.tutorialData.backgroundColor, this.tutorialData.backgroundOpacity);
    }
    else {
      x -= width * 0.5;
      y -= height * 0.5;
      this.maskRect(x, y, width, height, this.tutorialData.backgroundColor, this.tutorialData.backgroundOpacity);
    }
  }

  drawMessage() : void {
    if (!this.messageFrame.image || !this.tutorialData.message || this.tutorialData.message.text === "") {
      return;
    }

    let width = this.messageFrame.width * this.sizeRatio * this.messageFrame.scale * this.scaleFactor;
    let height = this.messageFrame.height * this.sizeRatio * this.messageFrame.scale * this.scaleFactor;
    let x = this.tutorialData.focus.x * this.ratio;
    let y = this.tutorialData.focus.y * this.ratio;
    x += this.tutorialData.message.distance * this.scaleFactor * Math.cos(this.tutorialData.message.angle * pc.math.DEG_TO_RAD - Math.PI / 2) + (this.tutorialData.message.offsetX * this.scaleFactor);
    y += this.tutorialData.message.distance * this.scaleFactor * Math.sin(this.tutorialData.message.angle * pc.math.DEG_TO_RAD - Math.PI / 2) + this.tutorialData.message.offsetY;
    x -= this.tutorialData.message.anchor.x * width;
    y -= this.tutorialData.message.anchor.y * height;
    let lineHeight = 40 * this.sizeRatio * this.scaleFactor;

    this.context.save();
    this.context.translate(x, y);
    // this.context.drawImage(this.messageFrame.image, 0, 0, 0, 0);
    let text = LanguageData.getTextByKey(this.tutorialData.message.text);
    this._wrapText(text, width * 0.35, height * 0.7, width * 0.6, lineHeight);
    this.context.translate(-x, -y);
    this.context.restore();

  }

  _configText(fontSize = 24) : void {
    this.context.textAlign = "center";
    this.context.textBaseline = "top";
    fontSize *= this.sizeRatio * this.scaleFactor;
    let font = this._getCurrentFont();
    this.context.font = `bold ${fontSize}px ${font}`;
    this.context.fillStyle = "#ffffff";
    this.context.globalAlpha = 1;
    this.context.globalCompositeOperation = "source-over";
  }

  _wrapText(text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    maxWidth /= this.sizeRatio;
    this._configText(40);
    let lines = this._getLines(text, maxWidth);
    let height = lines.length * lineHeight;
    y -= height * 0.5;
    for (let i = 0; i < lines.length; i++) {
      this.context.fillText(lines[i], x, y + (i * lineHeight), maxWidth);
    }
  }

  _getLines(text: string, maxWidth: number, maxLines = 3, fontSize = 24): string[] {
    this._configText(40);
    let lines = [];
    for (let line of text.split("\n")) {
      let words = line.split(" ");
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        let word = words[i];
        let width = this.context.measureText(`${currentLine} ${word}`).width / this.sizeRatio;
        if (width < maxWidth) {
          currentLine += ` ${word}`;
        }
        else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
    }

    if (lines.length > maxLines) {
      return this._getLines(text, maxWidth, maxLines, fontSize - 2);
    }
    return lines;
  }

  onResize() : void {
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.ratio = 1;
    this.sizeRatio = 1;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.actualResolution = { x: this.canvas.width, y: this.canvas.height };
    this._calculateScaleFactor();
  }

  private _calculateScaleFactor() : void {
    let x = this.canvas.width < this.canvas.height ? this.actualResolution.x / this.referenceResolution.x : this.actualResolution.y / this.referenceResolution.x;
    let y = this.canvas.width < this.canvas.height ? this.actualResolution.y / this.referenceResolution.y : this.actualResolution.x / this.referenceResolution.y;
    this.scaleFactor = Math.min(x, y);
  }

  private _getCurrentFont() : string {
    let font = "NotoSans-Black";
    let currentLanguage = LanguageData.getLanguageByCode(LanguageData.currentLanguageCode);
    if (currentLanguage.font) {
      font = `${currentLanguage.font}`;
    }

    return font;
  }

  draw() : void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.tutorialData) {
      return;
    }
    this.drawMask();
    this.drawHand();
    this.drawMessage();
  }
}
