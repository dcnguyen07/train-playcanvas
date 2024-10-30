import { SCALEMODE_BLEND, Vec2 } from "playcanvas";
import { GameConstant } from "../../gameConstant.js";
import { AssetManager } from "../../template/assetManager.js";
import * as pc from "playcanvas";
import { Game } from "../../game";
import { Tween } from "../../template/systems/tween/tween.js";

export default class LoadingScreen extends pc.Entity {
  static EVENT_LOADED = "loaded";
  static EVENT_RESOURCE_LOADED = "resourceLoaded";
  layer: pc.Layer;
  background: pc.Entity;
  logo: pc.Entity;
  loadingIcon: pc.Entity;
  textLoading: pc.Entity;
  sline: pc.Entity;
  fill: pc.Entity;
  mask: pc.Entity;
  logoLagged: pc.Entity;

  constructor(app: pc.Application) {
    super();

    this.layer = new pc.Layer({ name: "LoadingLayer" });
    app.scene.layers.insert(this.layer, 0);

    this.addComponent("camera", {
      clearColor : new pc.Color(0.1, 0.1, 0.1),
      layers     : [this.layer.id],
      priority   : 100,
    });
    this.addComponent("screen", {
      screenSpace         : true,
      scaleMode           : SCALEMODE_BLEND,
      resolution          : new Vec2(GameConstant.GAME_WIDTH, GameConstant.GAME_HEIGHT),
      referenceResolution : new Vec2(GameConstant.GAME_WIDTH, GameConstant.GAME_HEIGHT),
    });
    Promise.all([
      AssetManager.loadResource("spr_bg_loading", "texture"),
      AssetManager.loadResource("spr_game_logo", "texture"),
      AssetManager.loadResource("spr_text_loading", "texture"),
      AssetManager.loadResource("spr_progress_loading", "texture"),
      AssetManager.loadResource("spr_main_progress_loading", "texture"),
      AssetManager.loadResource("spr_icon_loading_progress", "texture"),
      AssetManager.loadResource(GameConstant.GAME_FONT_NOTOSANS_BLACK, "font"),
    ]).then(() => {
      this.fire(LoadingScreen.EVENT_RESOURCE_LOADED);
      this._createBackground();
      this._createLogoGame();
      this._createLoadingIcon();
      this._createTextLoading();
      this.resize();
      this.updateProgress(0.9);
      this.fire(LoadingScreen.EVENT_LOADED);
    });
  }

  private _createBackground() {
    this.background = new pc.Entity("background");
    this.background.addComponent("element", {
      type         : pc.ELEMENTTYPE_IMAGE,
      anchor       : new pc.Vec4(0.5, 0.5, 0.5, 0.5),
      pivot        : new pc.Vec2(0.5, 0.5),
      width        : GameConstant.GAME_WIDTH,
      height       : GameConstant.GAME_HEIGHT,
      layers       : [this.layer.id],
      useInput     : true,
      textureAsset : AssetManager.find("spr_bg_loading"),
    });
    this.addChild(this.background);
  }

  public resize() {
    Game.app.resizeCanvas(window.innerWidth, window.innerHeight);
    let res = this.screen.resolution;
    let width = res.x / this.screen.scale;
    let height = res.y / this.screen.scale;
    let scale = 1 / Math.min(width / GameConstant.GAME_WIDTH, height / GameConstant.GAME_HEIGHT);
    this.background?.setLocalScale(scale, scale, 1);

  }

  private _createLogoLagged() {
    this.logoLagged = new pc.Entity();
    let textureAsset = AssetManager.find("spr_logo_lagged");
    this.logoLagged.addComponent("element", {
      type         : pc.ELEMENTTYPE_IMAGE,
      anchor       : new pc.Vec4(0.5, 0.9, 0.5, 0.9),
      pivot        : new pc.Vec2(0.5, 0.5),
      width        : textureAsset.resource.width,
      height       : textureAsset.resource.height,
      textureAsset : textureAsset,
      color        : new pc.Color(1, 1, 1, 1),
      layers       : [this.layer.id],
    });
    this.addChild(this.logoLagged);
    this.logoLagged.setLocalScale(0.8, 0.8, 0.8);
  }

  private _createLogoGame() {
    this.logo = new pc.Entity("spr_game_logo");
    let textureAsset = AssetManager.find("spr_game_logo");
    this.logo.addComponent("element", {
      type         : pc.ELEMENTTYPE_IMAGE,
      anchor       : new pc.Vec4(0.5, 0.7, 0.5, 0.7),
      pivot        : new pc.Vec2(0.5, 0.5),
      width        : textureAsset.resource.width,
      height       : textureAsset.resource.height,
      textureAsset : textureAsset,
      color        : new pc.Color(1, 1, 1, 1),
      layers       : [this.layer.id],
    });
    this.logo.setLocalScale(1.5, 1.5, 1.5);
    this.addChild(this.logo);
  }

  private _createTextLoading() {
    this.textLoading = new pc.Entity("textLoading");
    this.textLoading.addComponent("element", {
      type         : pc.ELEMENTTYPE_IMAGE,
      textureAsset : AssetManager.find("spr_text_loading"),
      anchor       : new pc.Vec4(0.5, 0.1, 0.5, 0.1),
      pivot        : new pc.Vec2(0.5, 0.5),
      width        : 200,
      height       : 50,
      color        : new pc.Color(1, 1, 1, 1),
      layers       : [this.layer.id],
    });
    this.textLoading.setLocalPosition(0, -65, 0);
    this.addChild(this.textLoading);
  }

  private _createLoadingIcon() {
    this.sline = new pc.Entity("progressBar");
    this.sline.addComponent("element", {
      type         : pc.ELEMENTTYPE_IMAGE,
      textureAsset : AssetManager.find("spr_progress_loading"),
      anchor       : new pc.Vec4(0.5, 0.1, 0.5, 0.1),
      pivot        : new pc.Vec2(0.5, 0.5),
      width        : 600,
      height       : 50,
      color        : new pc.Color(1, 1, 1, 1),
      layers       : [this.layer.id],
    });
    this.addChild(this.sline);

    this.mask = new pc.Entity("mask");
    this.sline.addChild(this.mask);
    this.mask.addComponent("element", {
      type    : pc.ELEMENTTYPE_IMAGE,
      anchor  : new pc.Vec4(0, 0.5, 0, 0.5),
      pivot   : new Vec2(0, 0.5),
      mask    : false,
      width   : 600,
      height  : 50,
      opacity : 1,
    });

    this.fill = new pc.Entity("mainProgressBar");
    this.fill.addComponent("element", {
      type         : pc.ELEMENTTYPE_IMAGE,
      textureAsset : AssetManager.find("spr_main_progress_loading"),
      anchor       : new pc.Vec4(0.01, 0.5, 0.01, 0.5),
      pivot        : new pc.Vec2(0, 0.5),
      height       : 40,
      color        : new pc.Color(1, 1, 1, 1),
      layers       : [this.layer.id],
    });
    this.mask.addChild(this.fill);

    this.loadingIcon = new pc.Entity("loadingIcon");
    this.loadingIcon.addComponent("element", {
      type         : pc.ELEMENTTYPE_IMAGE,
      textureAsset : AssetManager.find("spr_icon_loading_progress"),
      anchor       : new pc.Vec4(1, 1, 1, 1),
      pivot        : new pc.Vec2(0.5, 0.5),
      layers       : [this.layer.id],
      width        : 123,
      height       : 116,
    });
    this.fill.addChild(this.loadingIcon);
  }

  public updateProgress(percent: number) {
    Tween.createTween(this.fill.element, { width: percent * 600 }, {
      duration: 1.5,
    }).start();
  }

  public setFullProgress(cb: any) {
    Tween.createTween(this.fill.element, { width: 589 }, {
      duration   : 1.5,
      onComplete : () => {
        cb && cb();
      },
    }).start();
  }

  public show() {
    this.enabled = true;
  }

  public hide() {
    this.enabled = false;
  }
}
