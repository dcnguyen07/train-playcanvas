import { BLEND_SCREEN, Color, ELEMENTTYPE_IMAGE, Entity, StandardMaterial, Vec2, Vec4 } from "playcanvas";
import { AssetManager } from "../../../../template/assetManager";

export default class RadialProgress {

  textureAsset: string;

  parentElement: Entity;
  groupElement: Entity;
  loadingRadial: Entity;
  matRadialProgress: StandardMaterial;
  _width: number;
  _height: number;

  constructor(textureAsset: string, parentElement: Entity, width: number = 95, height: number = 95) {
    this.textureAsset = textureAsset;
    this.parentElement = parentElement;
    this._width = width;
    this._height = height;
    this.init();
  }

  init() {
    let loadingRadial = new Entity("loadingRadial");
    this.parentElement.addChild(loadingRadial);
    loadingRadial.addComponent("element", {
      type   : ELEMENTTYPE_IMAGE,
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      mask   : true,
      width  : this._width,
      height : this._height,
    });
    this.matRadialProgress = new StandardMaterial();
    this.matRadialProgress.opacityMapTiling = new Vec2(-1, 1);
    this.matRadialProgress.diffuse = new Color(0, 0, 0);
    this.matRadialProgress.opacityMap = AssetManager.find("tex_radial_gradient").resource;
    this.matRadialProgress.opacityMapChannel = "r";
    this.matRadialProgress.alphaTest = 0.5;
    this.matRadialProgress.blendType = BLEND_SCREEN;
    this.matRadialProgress.depthTest = false;
    this.matRadialProgress.depthWrite = false;
    this.matRadialProgress.useFog = false;
    this.matRadialProgress.useLighting = false;
    this.matRadialProgress.useGammaTonemap = false;
    this.matRadialProgress.useSkybox = false;
    loadingRadial.element.material = this.matRadialProgress;

    let circleLoading = new Entity("circleLoading");
    circleLoading.addComponent("element", {
      type    : "image",
      anchor  : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot   : new Vec2(0.5, 0.5),
      color   : new Color(1, 1, 1),
      opacity : 1,
      mask    : false,
      width   : this._width,
      height  : this._height,
    });
    circleLoading.element.spriteAsset = AssetManager.find(this.textureAsset).id;
    loadingRadial.addChild(circleLoading);
  }

  setProgress(percent: number) {
    this.matRadialProgress.alphaTest = 1 - percent;
  }
}
