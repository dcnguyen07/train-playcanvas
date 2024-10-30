/* eslint-disable max-depth */
/* eslint-disable no-negated-condition */
/* eslint-disable no-unused-vars */
import * as pc from "playcanvas";
import FocusTutorial, { FocusTutorialEvent } from "./focusTutorial";
import { Game } from "../../game";

export enum TutorialActionEvent{
  ActionCompleted = "TutorialAction:ActionCompleted",
}

export class FocusTutorialActor extends pc.EventHandler {
  type : string;
  constructor(type : string) {
    super();
    this.type = type;

  }

  doAction(data : any) : void {
    this._onActionCompleted();
  }

  _onActionCompleted() : void {
    this.fire(TutorialActionEvent.ActionCompleted);
  }
}

export class TrackScreenElementTutorialActor extends FocusTutorialActor {
  uiManager : import("../../template/ui/uiManager").UIManager;
  data: import("./tutorialManager").TutorialActionData | null;
  entityWithInput: pc.Entity | null;

  /**
   * @param {import {"./tutorialManager"}.TutorialActionData} data
   * @param {import("../../template/ui/uiManager").UIManager} uiManager
   */
  constructor(uiManager : import("../../template/ui/uiManager").UIManager) {
    super("FocusTutorialActor");
    this.uiManager = uiManager;
    this.data = null;
    this.entityWithInput = null;
  }

  /**
   * @param {import("./tutorialManager").TutorialActionData} data
  */
  override doAction(data: import("./tutorialManager").TutorialActionData): void {
    this.data = data;
    let screen = this.uiManager.getScreenByName(data.layerName, data.screen);
    if (!screen || !screen.enabled) {
      console.warn(`Can't find screen ${data.screen}`);
      return;
    }
    let elementEntity = screen.findByName(data.element) as pc.Entity;
    if (!elementEntity) {
      console.warn(`Can't find element ${data.element} in screen ${data.screen}`);
      return;
    }
    let element = elementEntity.element;
    if (data.blockInput !== false) {
      let entityWithInput = this._getInputElementEntity(elementEntity);
      if (!entityWithInput) {
        console.warn(`Can't find element with input in element ${data.element} in screen ${data.screen}`);
        FocusTutorial.instance.once(FocusTutorialEvent.ClickOnFocusArea, this._onActionCompleted, this);
        return;
      }
      else {
        this.entityWithInput = entityWithInput;
        if (entityWithInput.button) {
          entityWithInput.button.on("click", this._onActionCompleted, this);
        }
        else {
          entityWithInput.element.on("mousedown", this._onActionCompleted, this);
          entityWithInput.element.on("touchstart", this._onActionCompleted, this);
        }
      }
    }
    else {
      FocusTutorial.instance.once(FocusTutorialEvent.ClickOnFocusArea, this._onActionCompleted, this);
    }


    if (!element) {
      return;
    }
    let scale = element.entity.getLocalScale();
    let width = element.width * scale.x * 0.75;
    let height = element.height * scale.y * 0.75;
    let position = this._elementToDeviceScreenPosition(element);

    let shape = data.focus?.shape || "circle";

    let focusRadius = Math.sqrt(width * width + height * height) * (data.focus?.radius || 0.75);

    let messageAnchor = new pc.Vec2(0.5, 0.5);
    if (data.message?.anchor) {
      messageAnchor.x = data.message.anchor.x || messageAnchor.x;
      messageAnchor.y = data.message.anchor.y || messageAnchor.y;
    }

    let config = {
      focus: {
        shape  : shape,
        x      : position.x + (data.focus?.x || 0),
        y      : position.y + (data.focus?.y || 0),
        width  : width * (data.focus?.width || 1.5),
        height : height * (data.focus?.height || 1.5),
        radius : focusRadius,
      },
      hand: {
        scale        : 0.5,
        angle        : data.hand?.angle || 0,
        moveDistance : data.hand?.moveDistance || 50,
        moveSpeed    : data.hand?.moveSpeed || 1,
        offsetX      : data.hand?.offsetX || 0,
        offsetY      : data.hand?.offsetY || 0,
      },
      message: {
        text     : data.message.text || "",
        angle    : data.message.angle || 0,
        anchor   : messageAnchor,
        distance : data.message.distance || 150,
        offsetX  : data.message.offsetX || 0,
        offsetY  : data.message.offsetY || 0,
      },
    };

    Game.app.once("resize", this._onResize, this);
    FocusTutorial.instance.pointingTutorial(config);
  }

  /**
   *
   * @param {pc.Entity} elementEntity
   */
  _getInputElementEntity(elementEntity : pc.Entity) : pc.Entity | null {
    if (elementEntity.element) {
      if (elementEntity.element.useInput || elementEntity.button) {
        return elementEntity;
      }
      else if (elementEntity.children.length === 0) {
        return null;
      }
    }
    for (let i = 0; i < elementEntity.children.length; i++) {
      let child = elementEntity.children[i];
      let childElementHasInput = this._getInputElementEntity(child as pc.Entity);
      if (childElementHasInput) {
        return childElementHasInput;
      }
    }
    return null;
  }

  _onResize() : void {
    if (!this.data) {
      return;
    }
    if (this.entityWithInput) {
      let entityWithInput = this.entityWithInput;
      if (entityWithInput.button) {
        entityWithInput.button.off("click", this._onActionCompleted, this);
      }
      else {
        entityWithInput.element.off("mousedown", this._onActionCompleted, this);
        entityWithInput.element.off("touchstart", this._onActionCompleted, this);
      }
    }
    FocusTutorial.instance.off(FocusTutorialEvent.ClickOnFocusArea, this._onActionCompleted, this);
    setTimeout(() => {
      this.doAction(this.data);
    }, 10);
  }

  override _onActionCompleted() : void {
    FocusTutorial.instance.hide();
    if (this.entityWithInput) {
      let entityWithInput = this.entityWithInput;
      if (entityWithInput.button) {
        entityWithInput.button.off("click", this._onActionCompleted, this);
      }
      else {
        entityWithInput.element.off("mousedown", this._onActionCompleted, this);
        entityWithInput.element.off("touchstart", this._onActionCompleted, this);
      }
    }
    this.data = null;
    this.entityWithInput = null;
    Game.app.off("resize", this._onResize, this);
    this.fire(TutorialActionEvent.ActionCompleted);
  }

  /**
   * @param {pc.ElementComponent} element
   * @param {UIScreen} screen
   * @returns
   */
  _elementToDeviceScreenPosition(element : pc.ElementComponent) {
    let screenCorners = element.screenCorners;
    let centerCorner = screenCorners[0].clone().add(screenCorners[2]).scale(0.5);
    centerCorner.y = Game.app.graphicsDevice.height - centerCorner.y;
    return centerCorner;
  }
}


