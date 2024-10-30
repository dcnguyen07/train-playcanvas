import { SPRITE_RENDERMODE_TILED, Sprite, Vec4, StandardMaterial, Asset, MeshInstance } from "playcanvas";
import { AssetManager } from "../template/assetManager";

export class AssetConfigurator {
  static config() : void {
    this._configDialogFrame();
  }

  private static _configDialogFrame() : void {
    this.setSpriteSlice("spr_dialog_frame_stroke", new Vec4(100, 100, 100, 100));
    this.setSpriteSlice("spr_dialog_frame", new Vec4(100, 100, 100, 100));
    this.setSpriteSlice("spr_stroke_rectangle", new Vec4(60, 60, 60, 60));
    this.setSpriteSlice("spr_square_rounded_stroke", new Vec4(18, 18, 18, 18));
  }

  static setSpriteSlice(spriteAsset : any, border = new Vec4()) : void {
    const asset = AssetManager.find(spriteAsset);
    if (!asset) {
      return;
    }
    (asset.resource as Sprite).renderMode = SPRITE_RENDERMODE_TILED;
    const frameKey = asset.resource.frameKeys[0];
    asset.resource.atlas.frames[frameKey].border = border;
  }

  static setModelMaterial(modelAsset: Asset, material: StandardMaterial, index = 0) {
    let model = AssetManager.find(modelAsset).resource;
    model.meshInstances[index].material = material;
  }

  static setModelMaterialInRange(modelAsset: Asset, material: StandardMaterial, startIndex: number, endIndex: number) {
    for (let i = startIndex; i <= endIndex; i++) {
      this.setModelMaterial(modelAsset, material, i);
    }
  }
}
