import { AssetManager } from "../../template/assetManager";
import { SoundManager } from "../../template/soundManager";

export default class ResourceHelper {
  public static async loadModel(modelKey: string) {
    let modelAsset = AssetManager.find(modelKey);
    if (!modelAsset) {
      if (AssetManager.hasResource(modelKey, "model")) {
        modelAsset = await AssetManager.loadResource(modelKey, "model");
      }
      else {
        console.error(`Model ${modelKey} not found`);
        return null;
      }
    }
    return modelAsset;
  }

  public static async loadAnim(animKey: string) {
    let animAsset = AssetManager.find(animKey);
    if (!animAsset) {
      if (AssetManager.hasResource(animKey, "animation")) {
        animAsset = await AssetManager.loadResource(animKey, "animation");
      }
      else {
        console.error(`Animation ${animKey} not found`);
        return null;
      }
    }
    return animAsset;
  }

  public static async loadAudio(audioKey: string) {
    let audioAsset = SoundManager.find(audioKey);
    if (!audioAsset) {
      if (AssetManager.hasResource(audioKey, "audio")) {
        audioAsset = await AssetManager.loadResource(audioKey, "audio");
      }
      else {
        console.error(`Audio ${audioKey} not found`);
        return null;
      }
    }
    else if (audioAsset.state() !== "loaded") {
      await new Promise<void>((resolve) => {
        audioAsset.once("load", () => resolve());
      });
    }
    return audioAsset;
  }

  public static async loadTexture(textureKey: string) {
    let textureAsset = AssetManager.find(textureKey);
    if (!textureAsset) {
      if (AssetManager.hasResource(textureKey, "texture")) {
        textureAsset = await AssetManager.loadResource(textureKey, "texture");
      }
      else {
        console.error(`Texture ${textureKey} not found`);
        return null;
      }
    }
    return textureAsset;
  }

  public static async loadMaterial(materialKey: string) {
    let materialAsset = AssetManager.find(materialKey);
    if (!materialAsset) {
      if (AssetManager.hasResource(materialKey, "material")) {
        materialAsset = await AssetManager.loadResource(materialKey, "material");
      }
      else {
        console.error(`Material ${materialKey} not found`);
        return null;
      }
    }
    return materialAsset;
  }

  public static async loadJson(jsonKey: string) {
    let jsonAsset = AssetManager.find(jsonKey);
    if (!jsonAsset) {
      if (AssetManager.hasResource(jsonKey, "json")) {
        jsonAsset = await AssetManager.loadResource(jsonKey, "json");
      }
      else {
        console.error(`Json ${jsonKey} not found`);
        return null;
      }
    }
    return jsonAsset;
  }
}
