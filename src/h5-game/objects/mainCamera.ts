import { Color, Entity } from "playcanvas";
import { Game } from "../../game";

export class MainCamera extends Entity {
  static _instance: MainCamera;
  clearDepthLayer: any;
  textLayer: any;
  public static get instance(): MainCamera {
    if (!this._instance) {
      this._instance = new MainCamera();
    }
    return this._instance;
  }
  mainCamera : Entity;

  constructor() {
    super("mainCamera");
    this.clearDepthLayer = Game.app.scene.layers.getLayerByName("ClearDepth");
    this.textLayer = Game.app.scene.layers.getLayerByName("Text");
    this.addComponent("camera", {
      clearColor : new Color(0.1, 0.1, 0.1),
      farClip    : 10000,
      nearClip   : 0.1,
      fov        : 19,
    });
    this.translate(0, 5, 10);
    this.lookAt(0, 0, 0);
  }
}
