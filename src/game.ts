import { Configurator } from "./configurator/configurator";
import { ShopData } from "./h5-game/data/shopData";
import { TransitionScene } from "./h5-game/scenes/transitionScene";
import { Ads } from "./sdk/ads";
import { Tween } from "./template/systems/tween/tween";
import {
  Application,
  ElementInput,
  FILLMODE_NONE,
  Keyboard,
  Mouse,
  RESOLUTION_AUTO,
  TouchDevice,
  platform, createGraphicsDevice,
} from "playcanvas";
import { SceneManager } from "./template/scene/sceneManager";
import PlayScene from "./h5-game/scenes/playScene";
import { GameConstant } from "./gameConstant";
import GameSetting from "./gameSetting";
import { GameState, GameStateManager } from "./template/gameStateManager";
import { Time } from "./template/systems/time/time";
import { AssetManager } from "./template/assetManager";
import { SoundManager } from "./template/soundManager";
import { UserData } from "./h5-game/data/userData";
import LoadingScreen from "./h5-game/screens/loadingScreen";
import { LanguageData } from "./h5-game/data/languageData";

export class Game {
  static canvas: HTMLCanvasElement;
  static app: Application;
  static width: number;
  static height: number;
  static gameCreated: boolean;
  static isLoading: boolean;
  static loadingScreen: LoadingScreen;
  static isPaused: boolean = false;

  static async load() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "application-canvas";
    this.canvas.style.zIndex = "0";
    this.canvas.style.margin = "0";
    this.canvas.style.padding = "0";
    this.canvas.style.backgroundColor = "black";
    document.body.appendChild(this.canvas);

    let isMobile = platform.mobile;
    const rootPath = window.location.href;
    const gfxOptions = {
      deviceTypes : ["webgl2", "webgl"],
      glslangUrl  : `${rootPath}assets/scripts/glslang.js`,
      antialias   : !isMobile,
    };

    const device = await createGraphicsDevice(this.canvas, gfxOptions);
    this.app = new Application(this.canvas, {
      elementInput   : new ElementInput(this.canvas),
      keyboard       : new Keyboard(window),
      graphicsDevice : device,
    });


    if (platform.touch) {
      this.app.touch = new TouchDevice(this.canvas);
    }
    else {
      this.app.mouse = new Mouse(this.canvas);
    }
    if (GameConstant.DEBUG_ORBIT_CAMERA) {
      this.app.mouse = new Mouse(this.canvas);
    }

    this.app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
    this.app.setCanvasFillMode(FILLMODE_NONE);
    this.app.setCanvasResolution(RESOLUTION_AUTO);

    Tween.init(this.app);
    GameSetting.loadSetting();
    GameStateManager.init(GameState.Tutorial);
    Time.init();
    await AssetManager.init(this.app);
    AssetManager.loadScript("Ammo", AssetManager.assetData.scripts.Ammo).then(
      () => {
        this.app.start();
      },
    );
    this._initLoadingScreen();
  }

  static _initLoadingScreen() {
    this.loadingScreen = new LoadingScreen(this.app);
    this.app.root.addChild(this.loadingScreen);
    this.loadingScreen.on(LoadingScreen.EVENT_RESOURCE_LOADED, () => {
      LanguageData.init(this.app);
      ShopData.init(this.app);
      Configurator.configLocalize();
    });
    this.loadingScreen.on(LoadingScreen.EVENT_LOADED, () => {
      Promise.all([
        AssetManager.load(),
      ]).then(() => {
        UserData.init();
        this.onAssetLoaded();
      });
    });
  }


  static onAssetLoaded(): void {
    this.create();
  }

  static create(): void {
    Configurator.config();

    this.app.systems.rigidbody.gravity.set(GameConstant.GRAVITY_X, GameConstant.GRAVITY_Y, GameConstant.GRAVITY_Z);
    this.app.systems.rigidbody.fixedTimeStep = GameConstant.FIXED_TIME_STEP;
    this.app.systems.rigidbody.maxSubSteps = 10;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.app.resizeCanvas(this.width, this.height);

    SceneManager.init([
      new PlayScene(),
      new TransitionScene(),
    ]);

    const playScene = SceneManager.getScene(GameConstant.SCENE_PLAY);
    if (playScene) {
      SceneManager.loadScene(playScene);
    }

    const transitionScene = SceneManager.getScene(GameConstant.SCENE_TRANSITION);
    if (transitionScene) {
      SceneManager.loadSceneAddtive(transitionScene);
    }

    this.app.on("update", this.update, this);

    this.gameCreated = true;
    this.app.fire("gameReady");
  }

  static setPause(isPause: boolean): void {
    if (!this.gameCreated) {
      return;
    }

    if (isPause) {
      this.pause();
    }
    else {
      this.resume();
    }
  }

  static update(dt: number): void {
    if (!this.gameCreated) {
      return;
    }

    Time.update(dt);
    SceneManager.update();
  }

  static pause(): void {
    if (this.isPaused) {
      return;
    }
    this.isPaused = true;
    GameStateManager.state = GameState.Paused;
    Time.scale = 0;
    SoundManager.muteAll(true);
    SceneManager.pause();
    this.app.timeScale = 0;
    this.app.fire("pause");
    window.blur();
  }

  static resume(): void {
    if (!this.isPaused) {
      return;
    }
    this.isPaused = false;
    if (GameStateManager.prevState !== GameState.Paused) { // sometime, the game state changed before resume
      GameStateManager.state = GameStateManager.prevState;
    }
    Time.scale = 1;
    SoundManager.muteAll(false);
    SoundManager.resumeAudioContext();
    SceneManager.resume();
    this.app.timeScale = 1;
    this.app.fire("resume");
    window.focus();
  }

  static resize(screenSize: { width: number; height: number }): void {
    if (this.gameCreated) {
      console.assert(screenSize.width && screenSize.height, "Screen size must have width and height greater than 0");
      this.width = screenSize.width;
      this.height = screenSize.height;
      this.app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
      this.app.resizeCanvas(this.width, this.height);
      SceneManager.resize();
      this.app.fire("resize");
    }
    else {
      console.warn("Resize function called before game creation", screenSize);
    }
  }

  static onWin(): void {
  }

  static onLose(): void {
  }

  static get isPortrait() {
    return this.width < this.height;
  }

  static get isLandscape() {
    return this.width > this.height;
  }

  static get isMobile() {
    return platform.mobile;
  }
}

// fix for webview
// https://github.com/react-native-webview/react-native-webview/issues/306
document.addEventListener("visibilitychange", () => {
  Game.setPause(document.hidden);
});
window.addEventListener("touchstart", () => Game.setPause(false));
window.addEventListener("mousedown", () => Game.setPause(false));
window.addEventListener("focus", () => Game.setPause(false));
window.addEventListener("blur", () => Game.setPause(true));
window.addEventListener("resize", () => {
  Game.resize({
    width  : window.innerWidth,
    height : window.innerHeight,
  });
  Game.loadingScreen?.resize();
});
window.focus();
