import { GAMMA_SRGB, Vec3, FOG_LINEAR, StandardMaterial } from "playcanvas";
import { Game } from "../game";
import { GameConstant } from "../gameConstant";
import { Util } from "../template/helpers/util";
import { AssetConfigurator } from "./assetConfigurator";
import localizationData from "../../assets/jsons/localizationData.json";

export class Configurator {
  static scene: pc.Scene;
  static config() {
    this.scene = Game.app.scene;
    AssetConfigurator.config();
    this._configScene();
    this._configFog();
    this._configSpriteFog();
  }

  static _configScene() {
    this.configAmbientLight(new Vec3(51, 51, 51));
    this.scene.gammaCorrection = GAMMA_SRGB;
  }

  static configAmbientLight(color: Vec3) {
    this.scene.ambientLight = Util.createColor(color.x, color.y, color.z);
  }

  static configLocalize() {
    Game.app.i18n.addData(localizationData);
  }

  static _configFog() {
    this.scene.fog = FOG_LINEAR;
    this.scene.fogColor = Util.createColor(255, 255, 255);
    let fogStart = Game.isLandscape ? GameConstant.FOG_DISTANCE_START_LANDSCAPE : GameConstant.FOG_DISTANCE_START_PORTRAIT;
    let fogEnd = Game.isLandscape ? GameConstant.FOG_DISTANCE_END_LANDSCAPE : GameConstant.FOG_DISTANCE_END_PORTRAIT;
    this.configFogDistance(fogStart, fogEnd);
  }

  static configFogDistance(start: number, end: number) {
    this.scene.fogStart = start;
    this.scene.fogEnd = end;

  }

  static _configSpriteFog() {
    let mat = Game.app.systems.sprite.defaultMaterial as StandardMaterial;
    mat.useFog = true;
    mat.useGammaTonemap = true;
  }
}
