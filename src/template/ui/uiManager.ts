/* eslint-disable max-depth */
import { Entity } from "playcanvas";
import { UIScreen } from "./uiScreen";
import { UILayer } from "./uiLayer";

export class UIManager extends Entity {

  public static readonly EVENT_LAYER_ACTIVATED = "UIManager:LAYER_ACTIVATED";
  public static readonly EVENT_LAYER_DEACTIVATED = "UIManager:LAYER_DEACTIVATED";
  public static readonly EVENT_SCREEN_ACTIVATED = "UIManager:SCREEN_ACTIVATED";
  public static readonly EVENT_SCREEN_DEACTIVATED = "UIManager:SCREEN_DEACTIVATED";


  private _layers: { [id: string]: UILayer; } = {};
  private _currentScreenPriority: number = 0;

  constructor() {
    super("ui_manager");
  }

  update(): void {
    Object.keys(this._layers).forEach((key) => this._layers[key].enabled && this._layers[key].update());
  }

  pause(): void {
    Object.keys(this._layers).forEach((key) => this._layers[key].enabled && this._layers[key].pause());
  }

  resume(): void {
    Object.keys(this._layers).forEach((key) => this._layers[key].enabled && this._layers[key].resume());
  }

  resize(): void {
    Object.keys(this._layers).forEach((key) => this._layers[key].resize());
  }

  addLayer(key: string, ...screenTypes: typeof UIScreen[]) {
    if (this._layers[key]) {
      console.error(`UILayer with key ${key} already exists!`);
      return;
    }

    const layer = new UILayer(key);
    this._layers[key] = layer;
    this.addChild(layer);
    screenTypes.forEach((screenType) => {
      const screen = layer.addScreen(screenType);
      screen.resize();
      if (screen.screen) {
        screen.screen.priority = this._currentScreenPriority++;
      }
    });
    layer.on(UILayer.EVENT_SCREEN_ACTIVATED, (screen) => this.fire(UIManager.EVENT_SCREEN_ACTIVATED, screen));
    layer.on(UILayer.EVENT_SCREEN_DEACTIVATED, (screen) => this.fire(UIManager.EVENT_SCREEN_DEACTIVATED, screen));
    layer.on(UILayer.EVENT_ACTIVATED, (l) => this.fire(UIManager.EVENT_LAYER_ACTIVATED, l));
    layer.on(UILayer.EVENT_DEACTIVATED, (l) => this.fire(UIManager.EVENT_LAYER_DEACTIVATED, l));

    // disable all screens as default
    layer.screens.forEach((screen) => screen.enabled = false);
  }

  removeLayer(key: string) {
    if (!this._layers[key]) {
      console.error(`UILayer with key ${key} does not exist!`);
      return;
    }

    this._layers[key].destroy();
    delete this._layers[key];
  }

  setLayerActive(key: string, isActive: boolean = true) {
    const layer = this._layers[key];
    if (!layer) {
      console.error(`UILayer with key ${key} does not exist!`);
      return;
    }

    layer.enabled = isActive;
    if (isActive) {
      layer.onActivated();
    }
    else {
      layer.onDeactivated();
    }
  }

  disableAllLayers() {
    Object.keys(this._layers).forEach((key) => {
      const layer = this._layers[key];
      if (layer.enabled) {
        layer.enabled = false;
        layer.onDeactivated();
      }
    });
  }

  // Get first screen in all layers
  getScreen(screenType: typeof UIScreen): UIScreen | undefined {
    for (const key in this._layers) {
      const screen = this._layers[key].getScreen(screenType);
      if (screen) {
        return screen;
      }
    }
    return undefined;
  }

  getScreenByName(layerName: string, screenName: string): UIScreen | null {
    let screen = this._layers[layerName].getScreenByName(screenName);
    if (screen !== null) {
      return screen;
    }
    return null;
  }

  getScreenOfLayer(key: string, screenType: typeof UIScreen): UIScreen | undefined {
    const layer = this._layers[key];
    if (!layer) {
      console.error(`UILayer with key ${key} does not exist!`);
      return undefined;
    }

    return layer.getScreen(screenType);
  }

  // Set activation of all found screen with screenType in all layers
  setScreenActive(screenType: typeof UIScreen, isActive: boolean = true): void {
    for (const key in this._layers) {
      const layer = this._layers[key];
      if (layer.isExist(screenType)) {
        layer.setScreenActive(screenType, isActive);
      }
    }
  }

  setScreenActiveOfLayer(layerKey: string, screenType: typeof UIScreen, isActive: boolean = true): void {
    const layer = this._layers[layerKey];
    if (!layer) {
      console.error(`UILayer with key ${layerKey} does not exist!`);
      return;
    }

    layer.setScreenActive(screenType, isActive);
  }

  // Disable all screen in all layers
  disableAllScreens() {
    Object.keys(this._layers).forEach((key) => this.disableAllScreenOfLayer(key));
  }

  disableAllScreenOfLayer(key: string) {
    const layer = this._layers[key];
    if (!layer) {
      console.error(`UILayer with key ${key} does not exist!`);
      return;
    }

    layer.disableAllScreens();
  }

  getLayer(key: string): UILayer | undefined {
    return this._layers[key];
  }
}
