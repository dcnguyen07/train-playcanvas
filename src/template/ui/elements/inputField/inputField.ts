import { Application, Color, ELEMENTTYPE_GROUP, ELEMENTTYPE_IMAGE, ELEMENTTYPE_TEXT, Entity, Font, Vec2, Vec4, guid } from "playcanvas";
import { AssetManager } from "../../../assetManager";
import { Tween } from "../../../systems/tween/tween";
import { Tweener } from "../../../systems/tween/tweener";
import { InputFieldCursorController } from "./inputFieldCursorController";
import { HandleClickOutsideOfElement } from "../../scripts/handleClickOutsideOfElement";

export class InputField extends Entity {

  inputElement!: HTMLInputElement;
  inputElementId: string = "";

  imgBackground!: Entity;
  txtContent!: Entity;
  txtPlaceHolder!: Entity;
  txtCursor!: Entity;
  contentMask!: Entity;

  /**
   * Used for calculating cursor position
   */
  txtTextToCursor!: Entity;
  cursorController!: InputFieldCursorController;

  private _cursorAnimationTween!: Tweener;
  private _clickOutsideHandler!: HandleClickOutsideOfElement;

  private _focused: boolean = false;
  get focused() {
    return this._focused;
  }
  set focused(val) {
    this._focused = val;
    this.setCursorVisibility(this._focused);

    if (this._focused) {
      this.inputElement.focus();
    }
    else {
      this.focusGameCanvas();
    }
  }

  private _shouldPreventElementBlurEvent: boolean = false;
  private _isContentAlignLeft: boolean = true;

  constructor(data: any = {}) {
    super("InputField");

    this.inputElementId = `${this.name}_${guid.create()}`;
    data.type = ELEMENTTYPE_GROUP;
    data.useInput = true;
    data.margin = data.margin || new Vec4();
    this.addComponent("element", data);

    this._initBackground();
    this._initContentMask();
    this._initContentText();
    this._initPlaceHolderText();
    this._initCursor();
    this._initInputElement();

    this.cursorController = this.addScript(InputFieldCursorController, {
      attributes: {
        maxCursorPositionOffset: 1,
      },
    }) as InputFieldCursorController;

    this.setCursorVisibility(false);
    this.element!.on("click", this.onClicked, this);
    this.element!.on("touchstart", this.onPointerDown, this);
    this.element!.on("mousedown", this.onPointerDown, this);

    this._clickOutsideHandler = this.addScript(HandleClickOutsideOfElement, {
      attributes: {
        element: this.element,
      },
    }) as HandleClickOutsideOfElement;
    this._clickOutsideHandler.on(HandleClickOutsideOfElement.EVENT_INVOKED, this.onClickedOutside, this);

    this.inputElement.addEventListener("input", this.onInput.bind(this));
    this.inputElement.addEventListener("blur", this.onInputElementBlurred.bind(this), { passive: false });
    this.inputElement.addEventListener("focus", this.onInputElementFocused.bind(this));
  }

  setFontSize(fontSize: number) {
    this.txtContent.element!.fontSize = fontSize;
    this.txtPlaceHolder.element!.fontSize = fontSize;
    this.txtTextToCursor.element!.fontSize = fontSize;
  }

  setFont(font: Font) {
    this.txtContent.element!.font = font;
    this.txtPlaceHolder.element!.font = font;
    this.txtTextToCursor.element!.font = font;
  }

  private _initBackground() {
    this.imgBackground = new Entity("InputContainer");
    this.addChild(this.imgBackground);
    this.imgBackground.addComponent("element", {
      type   : ELEMENTTYPE_IMAGE,
      anchor : new Vec4(0, 0, 1, 1),
      margin : new Vec4(),
    });
  }

  private _initContentMask() {
    this.contentMask = new Entity("InputFieldContentTextMask");
    this.contentMask.addComponent("element", {
      type   : ELEMENTTYPE_IMAGE,
      anchor : new Vec4(0, 0, 1, 1),
      margin : new Vec4(10, 0, 10, 0),
      mask   : true,
    });
    this.addChild(this.contentMask);
  }

  private _initContentText() {
    this.txtContent = new Entity("InputFieldContentText");
    this.contentMask.addChild(this.txtContent);
    this.txtContent.addComponent("element", {
      type      : ELEMENTTYPE_TEXT,
      fontAsset : AssetManager.find("FiraSans-Regular"),
      text      : "",
      fontSize  : 30,
      alignment : new Vec2(0, 0.5),
      anchor    : new Vec4(0, 0, 0, 1),
      margin    : new Vec4(0),
      color     : new Color(),
    });
  }

  private _initCursor() {
    this.txtCursor = new Entity("InputCursor");
    this.contentMask.addChild(this.txtCursor);
    this.txtCursor.addComponent("element", {
      type      : ELEMENTTYPE_TEXT,
      text      : "|",
      fontAsset : this.txtContent.element!.fontAsset,
      fontSize  : this.txtContent.element!.fontSize * 1.2,
      alignment : new Vec2(1, 0.5),
      anchor    : new Vec4(0, 0.5, 0, 0.5),
      pivot     : new Vec2(0, 0.5),
      margin    : new Vec4(),
      color     : new Color(),
      autoWidth : false,
    });

    this._cursorAnimationTween = Tween.createCountTween({
      duration : 0.5,
      delay    : 0.25,
      loop     : true,
      yoyo     : true,
      onUpdate : (object: any) => {
        this.txtCursor.element!.opacity = object.percent <= 0.5 ? 1 : 0;
      },
    });

    this.txtTextToCursor = new Entity("TextToCursor");
    this.addChild(this.txtTextToCursor);
    this.txtTextToCursor.addComponent("element", {
      type      : ELEMENTTYPE_TEXT,
      fontAsset : this.txtContent.element?.fontAsset,
      fontSize  : this.txtContent.element?.fontSize,
      alignment : this.txtContent.element?.alignment,
      color     : new Color(),
      opacity   : 0,
    });
    this.txtTextToCursor.setLocalPosition(0, -50, 0);
  }

  private _initPlaceHolderText() {
    this.txtPlaceHolder = new Entity("InputPlaceHolderText");
    this.contentMask.addChild(this.txtPlaceHolder);
    this.txtPlaceHolder.addComponent("element", {
      type        : ELEMENTTYPE_TEXT,
      fontAsset   : AssetManager.find("FiraSans-Regular"),
      text        : "Enter...",
      fontSize    : 30,
      maxFontSize : 30,
      alignment   : this.txtContent.element?.alignment,
      anchor      : this.txtContent.element?.anchor,
      margin      : this.txtContent.element?.margin,
      color       : new Color(0.4, 0.4, 0.4),
    });
  }

  private _initInputElement() {
    this.inputElement = document.createElement("input");
    this.inputElement.id = this.inputElementId;
    this.inputElement.setAttribute("type", "text");
    this.inputElement.style.position = "absolute";
    this.inputElement.style.zIndex = "-1";
    this.inputElement.style.opacity = "0.0001";
    document.body.insertBefore(this.inputElement, document.body.firstChild);
  }

  protected onPointerDown() {
    if (this.focused) {
      this._shouldPreventElementBlurEvent = true;
    }
  }

  protected onClicked() {
    if (!this.focused) {
      this.focused = true;
    }
  }

  protected onClickedOutside() {
    if (this.focused) {
      this.focused = false;
    }
  }

  protected onInputElementFocused() {
    if (!this.focused) {
      this.focused = true;
    }

    this.inputElement.value = this.txtContent.element!.text;
  }

  protected onInputElementBlurred() {
    if (this._shouldPreventElementBlurEvent) {
      this.inputElement.focus();
      this._shouldPreventElementBlurEvent = false;
      return;
    }

    if (this.focused) {
      this.focused = false;
    }
  }

  protected onInput() {
    this.txtContent.element!.text = this.inputElement.value;
    this.txtPlaceHolder.enabled = !this.txtContent.element!.text;
  }

  protected setCursorVisibility(visible: boolean) {
    this.txtCursor.enabled = visible;
    if (visible) {
      this._cursorAnimationTween.start();
    }
    else {
      this._cursorAnimationTween.stop();
    }
  }

  protected focusGameCanvas() {
    Application.getApplication()?.graphicsDevice.canvas.focus();
    this.inputElement.blur();
  }

  get value() {
    return this.txtContent.element!.text;
  }

  set value(val) {
    this.txtContent.element!.text = val;
    this.txtPlaceHolder.enabled = true;
  }
}
