import { Entity } from "playcanvas";
import { UIScreen } from "./uiScreen";

export class UILayer extends Entity {

  public static readonly EVENT_ACTIVATED = "UILayer:ACTIVATED";
  public static readonly EVENT_DEACTIVATED = "UILayer:DEACTIVATED";
  public static readonly EVENT_SCREEN_ACTIVATED = "UILayer:SCREEN_ACTIVATED";
  public static readonly EVENT_SCREEN_DEACTIVATED = "UILayer:SCREEN_DEACTIVATED";

  key: string;
  screens: UIScreen[] = [];

  constructor(key: string) {
    super(key);
    this.key = key;
  }

  onActivated() {
    this.fire(UILayer.EVENT_ACTIVATED, this);
  }

  onDeactivated() {
    this.fire(UILayer.EVENT_DEACTIVATED, this);
  }

  update() {
    this.screens.forEach((screen) => screen.enabled && screen.update());
  }

  pause() {
    this.screens.forEach((screen) => screen.enabled && screen.pause());
  }

  resume() {
    this.screens.forEach((screen) => screen.enabled && screen.resume());
  }

  resize() {
    this.screens.forEach((screen) => screen.enabled && screen.resize());
  }

  addScreen(screenType: typeof UIScreen) {
    const screen = new screenType();
    this.addChild(screen);
    this.screens.push(screen);
    screen.create();
    screen.on(UIScreen.EVENT_ACTIVATED, () => this.fire(UILayer.EVENT_SCREEN_ACTIVATED, screen));
    screen.on(UIScreen.EVENT_DEACTIVATED, () => this.fire(UILayer.EVENT_SCREEN_DEACTIVATED, screen));

    return screen;
  }

  setScreenActive(screenType: typeof UIScreen, isActive: boolean = true) {
    const screen = this.getScreen(screenType);
    if (!screen) {
      console.error(`Screen ${screenType.name} not found!`);
      return;
    }

    if (isActive) {
      screen.onActivated();
    }
    else {
      screen.onDeactivated();
    }
  }

  disableAllScreens() {
    this.screens.forEach((screen) => {
      if (screen.enabled) {
        screen.onDeactivated();
      }
    });
  }

  getScreen(screenType: typeof UIScreen): UIScreen | undefined {
    return this.screens.find((screen) => screen instanceof screenType);
  }

  getScreenByName(name: string): UIScreen | null {
    return this.screens.find((screen) => screen.name === name);
  }

  isExist(screenType: typeof UIScreen): boolean {
    return !!this.getScreen(screenType);
  }
}
