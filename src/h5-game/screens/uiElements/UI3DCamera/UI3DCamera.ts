import { Color, ElementComponent, Entity, Vec2 } from "playcanvas";
import RenderCameraToElement from "../../../scripts/components/renderCameraToElement";
import { GameConstant } from "../../../../gameConstant";

export default class UI3DCamera extends Entity {
  renderCameraToElement: RenderCameraToElement;
  elementComp: ElementComponent;

  constructor(elementComp: ElementComponent) {
    super("ui3DCamera");
    this.elementComp = elementComp;
    this._initCamera();
  }

  private _initCamera() {
    this.addComponent("camera", {
      clearColor       : new Color(0, 0, 0, 0),
      nearClip         : 0.1,
      farClip          : 1000,
      fov              : 45,
      clearColorBuffer : true,
      clearDepthBuffer : true,
      layers           : [GameConstant.UI_3D_LAYER_ID],
    });
    this.setLocalPosition(0, 0, 0);

    let light = new Entity();
    light.addComponent("light", {
      type        : "directional",
      color       : new Color(1, 1, 1),
      intensity   : 1,
      castShadows : false,
      layers      : [GameConstant.UI_3D_LAYER_ID],
    });
    this.addChild(light);

    this.renderCameraToElement = this.addScript(RenderCameraToElement, {
      attributes: {
        renderResolution : new Vec2(1024, 512),
        element          : this.elementComp,
      },
    });
  }

  setElement(element: ElementComponent) {
    this.renderCameraToElement.assignTextureToElements(element);
  }
}
