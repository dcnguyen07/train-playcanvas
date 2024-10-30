import { Color, Entity, Vec3 } from "playcanvas";
import { Configurator } from "../../configurator/configurator";
import { loadOrbitCamera } from "../../debug/orbitCamera";
import { Game } from "../../game";
import { GameConstant } from "../../gameConstant";
import AmmoDebugDrawer from "../../template/helpers/ammoDebugDrawer";
import { Scene } from "../../template/scene/scene";
import { SceneManager } from "../../template/scene/sceneManager";
import { SoundManager } from "../../template/soundManager";
import { Tween } from "../../template/systems/tween/tween";
import { Tweener } from "../../template/systems/tween/tweener";
import { UILayer } from "../../template/ui/uiLayer";
import { UserData } from "../data/userData";
import { LevelManager } from "../level/levelManager";
import { CarManager } from "../objects/car/carManager";
import { CollectCoinEffect } from "../objects/effects/collectCoinEffect";
import { FireworkEffect } from "../objects/effects/fireworkEffect";
import { FragmentEffect } from "../objects/effects/fragments/fragmentEffect";
import GamePlayManager from "../objects/gamePlayManager/gamePlayManager";
import { MainCamera } from "../objects/mainCamera";
import { Player } from "../objects/player/player";
import { AdsScreen } from "../screens/adsScreen";
import { CameraFollower } from "../scripts/components/cameraFollower";
import InputHandler from "../scripts/inputs/inputHandler";
import { CurrencyScreen } from "../scripts/screens/currencyScreen";
import { HomeScreen } from "../scripts/screens/homeScreen";
import { LoseScreen } from "../scripts/screens/loseScreen";
import { PlayScreen } from "../scripts/screens/playScreen";
import { ReviveScreen } from "../scripts/screens/reviveScreen";
import { RewardScreen } from "../scripts/screens/rewardScreen";
import { SettingScreen } from "../scripts/screens/settingScreen";
import { ShopScreen } from "../scripts/screens/shopScreen";
import { TutorialScreen } from "../scripts/screens/tutorialScreen";
import { WinScreen } from "../scripts/screens/winScreen";
import TutorialManager from "../tutorials/tutorialManager";
import { TransitionScene } from "./transitionScene";

export default class PlayScene extends Scene {
  uiMainLayer: UILayer;
  mainCamera: Entity;

  inputHandler: InputHandler;
  achievementData: { levelsCompleted: number, achievementId: string }[];
  levelManager: LevelManager;
  player: Player;
  transitionScene: TransitionScene;
  winScreen: WinScreen;
  loseScreen: LoseScreen;
  rewardScreen: RewardScreen;
  shopScreen: ShopScreen;
  tutorialScreen: TutorialScreen;
  homeScreen: HomeScreen;
  currencyScreen: CurrencyScreen;
  playScreen: PlayScreen;
  settingScreen: SettingScreen;
  _tutorial: TutorialManager;

  _cameraFollower: CameraFollower;
  carManager: CarManager;
  tweenSpawnCar: Tweener;
  tweenSpawnTrain: Tweener;
  isCached: boolean;
  private _isHideLoadingScreen: boolean = false;
  private fireworkEffectLeft: any;
  private fireworkEffectRight: any;
  private positionRevive: Vec3;
  private forwardRevive: Vec3;
  private reviveScreen: ReviveScreen;

  constructor() {
    super(GameConstant.SCENE_PLAY);
    this.achievementData = [
      {
        levelsCompleted : 3,
        achievementId   : "complete3Levels",
      },
      {
        levelsCompleted : 5,
        achievementId   : "complete5Levels",
      },
      {
        levelsCompleted : 10,
        achievementId   : "complete10Levels",
      },
      {
        levelsCompleted : 20,
        achievementId   : "complete20Levels",
      },
      {
        levelsCompleted : 30,
        achievementId   : "complete30Levels",
      },
    ];

    UserData.emitter.on(UserData.Event.CurrencyChanged, this._onCurrencyChanged.bind(this));
  }

  override create() {
    super.create();

    this.transitionScene = SceneManager.getScene(GameConstant.SCENE_TRANSITION) as TransitionScene;
    if (!this.transitionScene) {
      console.warn("Transition scene not found");
    }

    this._initTutorial();
    this._initUI();
    this._initInputHandler();
    this._initGamePlay();
    this.resize();
    this._cacheShader();

  }

  private _initTutorial() {
    this._tutorial = new TutorialManager(this.ui);
  }

  private _initUI() {
    this.ui.addLayer(GameConstant.UI_LAYER_MAIN,
      WinScreen,
      LoseScreen,
      RewardScreen,
      ShopScreen,
      TutorialScreen,
      HomeScreen,
      PlayScreen,
      ReviveScreen,
      SettingScreen,
      CurrencyScreen);
    this.ui.addLayer(GameConstant.UI_LAYER_ADS, AdsScreen);

    this.uiMainLayer = this.ui.getLayer(GameConstant.UI_LAYER_MAIN)!;

    this.winScreen = this.ui.getScreen(WinScreen) as WinScreen;
    this.loseScreen = this.ui.getScreen(LoseScreen) as LoseScreen;
    this.tutorialScreen = this.ui.getScreen(TutorialScreen) as TutorialScreen;
    this.rewardScreen = this.ui.getScreen(RewardScreen) as RewardScreen;
    this.shopScreen = this.ui.getScreen(ShopScreen) as ShopScreen;
    this.homeScreen = this.ui.getScreen(HomeScreen) as HomeScreen;
    this.currencyScreen = this.ui.getScreen(CurrencyScreen) as CurrencyScreen;
    this.playScreen = this.ui.getScreen(PlayScreen) as PlayScreen;
    this.reviveScreen = this.ui.getScreen(ReviveScreen) as ReviveScreen;
    this.settingScreen = this.ui.getScreen(SettingScreen) as SettingScreen;

    this._registerWinScreenEvent();
    this._registerLoseScreenEvent();
    this._registerRewardScreenEvent();
    this._registerShopScreenEvent();
    this._registerHomeScreenEvent();
    this._registerReviveScreenEvent();
    this._registerSettingScreenEvent();

    // Set hint state for home screen when UI created
    this.homeScreen.showHint(this.shopScreen.onCurrencyChanged(UserData.currency));
  }

  private _registerWinScreenEvent() {
    this.winScreen.on(WinScreen.Event.BUTTON_NEXT_CLICKED, () => {
      this.stopFireworkEffect();
      const isALlSkinsUnlocked = UserData.skinUnlocked.length === GameConstant.TOTAL_CAR_SKINS;
      if (isALlSkinsUnlocked) {
        this.transitionScene.playFadeIn(() => {
          this.levelManager.loadNextLevel();
          this.player.hideFragment();
          this.homeScreen.fadeIn();
        });
      }
      else {
        this._showRewardScreen();
      }
    });
  }

  private _registerLoseScreenEvent() {
    this.loseScreen.on(LoseScreen.Event.BUTTON_REPLAY_CLICKED, () => {
      this.transitionScene.playFadeIn(() => {
        this.levelManager.loadNextLevel();
        this.ui.setScreenActive(LoseScreen, false);
        this.player.hideFragment();
        this.homeScreen.fadeIn();
        this.levelManager.currentLevel.startAllTweens();
        this.player.reset();
      });
    });

    this.reviveScreen.on(ReviveScreen.Event.BUTTON_REVIVE_CLICKED, () => {
      this.ui.setScreenActive(LoseScreen, false);
      this.homeScreen.fadeIn();
      this.player.hideFragment();
      this._updatePlayerRevive();
      this.levelManager.currentLevel.resetAllCarObstacle();
      this.levelManager.currentLevel.startAllTweens();
    });
  }

  private _registerRewardScreenEvent() {
    this.rewardScreen.on(RewardScreen.Event.BACK_TO_MAIN, () => {
      this.transitionScene.playFadeIn(() => {
        this.player.changeSkin(UserData.currentSkin).then(() => {
          this.levelManager.loadNextLevel();
          this.player.hideFragment();
          this.ui.setScreenActive(RewardScreen, false);
          this.homeScreen.fadeIn();
        });
      });
    });

    this.rewardScreen.on(RewardScreen.Event.BUTTON_CONTINUE_CLICKED, () => {
      this.transitionScene.playFadeIn(() => {
        this.levelManager.loadNextLevel();
        this.player.hideFragment();
        this.ui.setScreenActive(RewardScreen, false);
        this.homeScreen.fadeIn();
      });
    });
  }

  private _registerShopScreenEvent() {
    this.shopScreen.on(ShopScreen.Event.BackButtonClicked, () => {
      const currentModelID = UserData.currentSkin;
      this.player.changeSkin(currentModelID);
      this._showHomeScreen();
      this._delayCheckTutorial(0.5);
    });
  }

  private _registerHomeScreenEvent() {
    this.homeScreen.on(HomeScreen.Events.OnBackgroundTouched, () => {
      this.homeScreen.enabled = false;
      this.inputHandler.enabled = true;
      // this.homeScreen.fadeOut();
      this.playScreen.fadeIn();
      this.ui.setScreenActive(TutorialScreen, false);
    });

    this.homeScreen.on(HomeScreen.Events.OnShopButtonClicked, () => {
      this._showShopScreen();
    });

    this.homeScreen.on(HomeScreen.Events.OnSettingsButtonClicked, () => {
      this.ui.setScreenActive(SettingScreen);
    });
  }

  private _registerReviveScreenEvent() {
    this.reviveScreen.on(ReviveScreen.Event.SHOW_LOSE_SCREEN, () => {
      this._showLoseScreen();
    });
  }

  private _registerSettingScreenEvent() {

  }

  private _initInputHandler() {
    let inputHandlerEntity = new Entity();
    this.addChild(inputHandlerEntity);
    this.inputHandler = inputHandlerEntity.addScript(InputHandler);
    this.inputHandler.enabled = false;
  }

  private _initGamePlay() {
    this._initLight();
    this._initCamera();
    this._initLevelManager();
    this._initGameplayManager();
    this._initPlayer();
    if (!this._isHideLoadingScreen) {
      Game.loadingScreen.setFullProgress(() => {
        Game.loadingScreen.hide();
        this._isHideLoadingScreen = true;
        this._delayCheckTutorial(1);
      });
    }
  }

  private _cacheShader() {
    let cacheEntity = new Entity();
    this.addChild(cacheEntity);
    cacheEntity.setLocalPosition(this.player.getPosition());
    let collectCoinEffect = new CollectCoinEffect();
    cacheEntity.addChild(collectCoinEffect);
    let fragmentEffect = new FragmentEffect();
    cacheEntity.addChild(fragmentEffect);
    fragmentEffect.showFragment();
    fragmentEffect.setLocalPosition(0, 1, 31);

    setTimeout(() => {
      cacheEntity.destroy();
      this.isCached = true;
    }, 500);
  }


  private _initLight() {
    const light = new Entity();
    light.addComponent("light", {
      type        : "directional",
      color       : new Color(1, 1, 1),
      castShadows : false,
    });
    light.light.isStatic = true;
    light.light.affectLightmapped = false;
    light.light.affectSpecularity = false;
    light.setLocalEulerAngles(38.67, 29.1, -3.44);
    this.addChild(light);
  }

  private _initCamera() {
    this.addChild(MainCamera.instance);
    this.mainCamera = MainCamera.instance;
    this.mainCamera.setLocalPosition(GameConstant.CAMERA_X, GameConstant.CAMERA_Y, GameConstant.CAMERA_Z);
    this.mainCamera.setLocalEulerAngles(GameConstant.CAMERA_ROTATE_X, GameConstant.CAMERA_ROTATE_Y, GameConstant.CAMERA_ROTATE_Z);

    if (GameConstant.DEBUG_AMMO) {
      const renderer = new AmmoDebugDrawer({
        app   : Game.app,
        limit : {
          entity   : this.mainCamera,
          distance : 5000,
        },
      });

      // @ts-ignore
      renderer.enabled = true;
    }

    if (GameConstant.DEBUG_ORBIT_CAMERA) {
      loadOrbitCamera();
      this.mainCamera.addComponent("script");
      this.mainCamera.script.create("orbitCamera", {
        attributes: {
          distanceMax   : 2000,
          distanceMin   : 5,
          pitchAngleMax : 90,
          pitchAngleMin : 0,
          inertiaFactor : 0.1,
          focusEntity   : this.player,
          frameOnStart  : true,
        },
      });

      this.mainCamera.script.create("orbitCameraInputMouse");
      this.mainCamera.script.create("orbitCameraInputTouch");
    }
  }

  private _initGameplayManager() {
    this.addChild(GamePlayManager.instance);
    GamePlayManager.instance.inputHandler = this.inputHandler;
  }

  private _initLevelManager() {
    this.levelManager = new LevelManager();
    this.addChild(this.levelManager);
    this.levelManager.on(LevelManager.Event.PreLoadLevel, () => {
      if (this.player) {
        this.player.enabled = false;
      }
    });
    this.levelManager.on(LevelManager.Event.LevelLoaded, this._onLevelLoaded.bind(this));
    this.levelManager.on(LevelManager.Event.ProgressUpdated, this._onProgressUpdated.bind(this));
    this.levelManager.loadNextLevel();
  }

  private _onLevelLoaded() {
    this.transitionScene.playFadeOut();
    if (this.player.isInitialized) {
      this._updatePlayer();
    }
    else {
      this.player.on(Player.Events.Initialized, this._updatePlayer.bind(this));
    }
  }

  private _updatePlayer() { // update player on level loaded
    this._reset();
    let startPoint = this.levelManager.currentLevel.startPoint.getLocalPosition();
    this.player.setStartPosition(startPoint);
    this.player.changePath(this.levelManager.currentLevel.getPath());
    this.player.enabled = true;
    this.player.controller.trainSoundObjets = this.levelManager.currentLevel.trainSoundObjs;
    this.player.changeCheckpoint(this.levelManager.currentLevel.getCheckPoints());
    this.player.enableTrail();
  }

  private _updatePlayerRevive() {
    this._showHomeScreen();
    this._cameraFollower.enabled = true;
    this.inputHandler.enabled = false;
    this.player.resetRevive();
    if (this.player.controller.currentCheckPoint) {
      this.player.setRevivePosition(
        this.player.controller.currentCheckPoint.getLocalPosition(),
        this.player.controller.currentCheckPoint.getLocalEulerAngles(),
      );
    }
    this.levelManager.currentLevel.resumeSpawnObstacle();
  }

  private _initPlayer() {
    this.player = new Player();
    this.player.enabled = false;
    this.addChild(this.player);

    this.inputHandler.on(InputHandler.InputEvent.OnPointerDown, this._onPointerDown, this);
    this.inputHandler.on(InputHandler.InputEvent.OnPointerUp, this._onPointerUp, this);
    this._initCameraFollower();
    this.levelManager.setPlayer(this.player);
    this.player.on(Player.Events.Finished, this._onWin.bind(this));
    this.player.on(Player.Events.OnDied, this._onLose.bind(this));
    this.player.on(Player.Events.DistancePassed, this._onDistancePassed.bind(this));
  }

  private _initCameraFollower() {
    this._cameraFollower = MainCamera.instance.addScript(CameraFollower, {
      attributes: {
        target    : this.player,
        offset    : new Vec3(GameConstant.CAMERA_X, GameConstant.CAMERA_Y, GameConstant.CAMERA_Z),
        lerpSpeed : 10,
      },
    });
  }

  private _onPointerDown() {
    if (!this.player.controller.isRunning && this.player.controller.grounded) {
      this.player.controller.isRunning = true;
      this._onStart();
    }
    this.player.onPointerDown();
  }

  private _onPointerUp() {
    this.player.onPointerUp();
  }

  private _onStart() {
    this.ui.setScreenActive(PlayScreen);
    this.playScreen.setLevel(UserData.currentLevel);
  }

  private _onWin() {
    this._cameraFollower.enabled = false;
    this.inputHandler.enabled = false;
    this.playFireworkEffect();
    this.playScreen.setPercent(1);
    this.playScreen.fadeOut();
    const totalCoinClaimed = this.playScreen.getTotalCoinClaimed();
    const currentLevel = UserData.currentLevel;
    this.winScreen.setWin(totalCoinClaimed, currentLevel);
    UserData.currentLevel++;
    Tween.createCountTween({
      duration   : 1,
      onComplete : () => {
        this._showWinScreen();
      },
    }).start();
    this.player.disableTrail();
  }

  private _onLose() {
    this._cameraFollower.enabled = false;
    this.inputHandler.enabled = false;
    this.player.showFragment(this.player.getPosition());
    this.playScreen.fadeOut();

    Tween.createCountTween({
      duration   : 1,
      onComplete : () => {
        if (this.player.controller.currentCheckPoint === undefined) {
          this._hideReviveScreen();
          this._showLoseScreen();
        }
        else {
          this._showReviveScreen();
        }
      },
    }).start();
    this.positionRevive = new Vec3(this.player.getPosition().x, this.player.getPosition().y, this.player.getPosition().z);
    this.forwardRevive = this.player.forward;
    this.levelManager.currentLevel.carManager.stopAllCarObstacle();
    this.levelManager.currentLevel.stopAllTweens();
  }

  private _reset() {
    this._cameraFollower.enabled = true;
    this.inputHandler.enabled = false;
    this.player.reset();
    this.playScreen.onReset();
    this._showHomeScreen();
    if (this._isHideLoadingScreen) {
      this._delayCheckTutorial(0.5);
    }
  }

  private _onProgressUpdated(progress: number) {
    let percent = progress / 100;
    this.playScreen.setPercent(percent);
  }

  private _onDistancePassed(distance: number) {
    this.playScreen.setDistance(distance);
  }

  private _showWinScreen() {
    SoundManager.play("sfx_win");
    this.ui.disableAllScreenOfLayer(GameConstant.UI_LAYER_MAIN);
    this.ui.setScreenActive(WinScreen);
    this.ui.setScreenActive(CurrencyScreen);
  }

  private _showLoseScreen() {
    SoundManager.play("sfx_lose");
    this.ui.disableAllScreenOfLayer(GameConstant.UI_LAYER_MAIN);
    this.ui.setScreenActive(LoseScreen);
    this.ui.setScreenActive(CurrencyScreen);
  }

  private _showRewardScreen() {
    this.ui.disableAllScreenOfLayer(GameConstant.UI_LAYER_MAIN);
    this.ui.setScreenActive(RewardScreen);
    this.ui.setScreenActive(CurrencyScreen);
  }

  private _showShopScreen() {
    this.ui.disableAllScreenOfLayer(GameConstant.UI_LAYER_MAIN);
    this.ui.setScreenActive(ShopScreen);
    this.ui.setScreenActive(CurrencyScreen);
  }

  private _showHomeScreen() {
    this.ui.disableAllScreenOfLayer(GameConstant.UI_LAYER_MAIN);
    this.ui.setScreenActive(HomeScreen);
    this.ui.setScreenActive(TutorialScreen);
    this.ui.setScreenActive(CurrencyScreen);
  }

  private _onCurrencyChanged(currency: number) {
    const isAvailableItemEnough = this.shopScreen.onCurrencyChanged(currency);
    this.currencyScreen.onUpdateCurrency(currency);
    this.homeScreen.showHint(isAvailableItemEnough);
  }

  private _delayCheckTutorial(delay: number = 0) {
    Tween.createCountTween({
      duration   : delay,
      onComplete : () => {
        if (this.homeScreen.enabled && !this.settingScreen.enabled && !this.shopScreen.enabled) {
          this._tutorial.checkTutorial();
        }
      },
    }).start();
  }

  override resize() {
    super.resize();
    this._cameraFollower.resize();
    let fogStart = Game.isLandscape ? GameConstant.FOG_DISTANCE_START_LANDSCAPE : GameConstant.FOG_DISTANCE_START_PORTRAIT;
    let fogEnd = Game.isLandscape ? GameConstant.FOG_DISTANCE_END_LANDSCAPE : GameConstant.FOG_DISTANCE_END_PORTRAIT;
    Configurator.configFogDistance(fogStart, fogEnd);
  }

  override update() {
    super.update();
  }

  playFireworkEffect() {
    this.fireworkEffectLeft = FireworkEffect.playAt(new Vec3(this.player.getPosition().x - 1, this.player.getPosition().y, this.player.getPosition().z));
    this.fireworkEffectRight = FireworkEffect.playAt(new Vec3(this.player.getPosition().x + 1, this.player.getPosition().y, this.player.getPosition().z));
    this.fireworkEffectLeft.setLocalScale(1, 1, 1);
    this.fireworkEffectRight.setLocalScale(-1, 1, -1);
  }

  stopFireworkEffect() {
    this.fireworkEffectRight.stopEffect();
    this.fireworkEffectLeft.stopEffect();
  }

  private _showReviveScreen() {
    this.ui.setScreenActive(ReviveScreen);
    this.reviveScreen.playTween();
    this.levelManager.currentLevel.pauseSpawnObstacle();
    this.levelManager.currentLevel.stopAllTweens();
  }

  private _hideReviveScreen() {
    this.ui.setScreenActive(ReviveScreen, false);
  }
}
