import yaml from "js-yaml";
import { Application, Asset, AssetRegistry, Sprite, TextureAtlas, Vec2, Vec4, Texture, WasmModule, path } from "playcanvas";
import { Game } from "../game";
import { AccessibleObject } from "./helpers/util";
import { SoundManager } from "./soundManager";


export class AssetManager {
  static app: Application;
  static assets: AssetRegistry;
  static assetData: { [key: string]: { [key: string]: any } };
  private static _yamlDataCache: AccessibleObject = {};

  /**
   * @param {Application} app
   */
  static async init(app: Application) {
    this.app = app;
    this.assets = app.assets;
    let assetData = new Asset("assetData", "json", { url: "assets/assetData.json" });
    await new Promise<void>((resolve) => {
      assetData.ready(() => {
        this.assetData = assetData.resource;
        resolve();
      });
      this.assets.load(assetData);
    });
  }

  static async load() {
    const loadingPromises: Promise<any>[] = [];

    for (const key in this.assetData.textures) {
      loadingPromises.push(this.loadAsset(key, "texture", this.assetData.textures[key]));
    }

    for (const key in this.assetData.models) {
      loadingPromises.push(this.loadAsset(key, "model", this.assetData.models[key]));
    }

    for (const key in this.assetData.fonts) {
      loadingPromises.push(this.loadAsset(key, "font", this.assetData.fonts[key]));
    }

    for (const key in this.assetData.jsons) {
      loadingPromises.push(this.loadAsset(key, "json", this.assetData.jsons[key]));
    }

    for (const key in this.assetData.materials) {
      loadingPromises.push(this.loadAsset(key, "material", this.assetData.materials[key]));
    }

    for (const key in this.assetData.texts) {
      loadingPromises.push(this.loadAsset(key, "text", this.assetData.texts[key]));
    }

    for (const key in this.assetData.animations) {
      loadingPromises.push(this.loadAsset(key, "animation", this.assetData.animations[key]));
    }

    for (const key in this.assetData.cubemaps) {
      loadingPromises.push(this.loadCubeMap(key, this.assetData.cubemaps[key]));
    }

    for (const key in this.assetData.rawModels) {
      loadingPromises.push(this.loadAsset(key, "container", this.assetData.rawModels[key]));
    }

    for (let key in this.assetData.scripts) {
      loadingPromises.push(this.loadScript(key, this.assetData.scripts[key]));
    }

    for (const key in this.assetData.webfonts) {
      loadingPromises.push(this.loadWebFont(this.assetData.webfonts[key], key));
    }

    loadingPromises.push(this._loadAtlases());
    loadingPromises.push(SoundManager.load(this.assetData.audios));
    await Promise.all(loadingPromises);
  }

  private static async _loadAtlases() {
    await Promise.all(Object.keys(this.assetData.atlas).map((key) => this._loadAtlas(key, this.assetData.atlas[key])));
  }

  private static async loadCubeMap(key: string, url: string) {
    let jsonHandler = this.assets._loader.getHandler("json");
    if (!jsonHandler) {
      console.error(`Json Handler not found. Cannot load cubemap ${key}.`);
      return null;
    }

    // load json as object
    const cubeMapData = await new Promise<any>((resolve) => {
      jsonHandler.load(url, (err, data) => {
        if (err) {
          console.error(`Error loading cubemap ${key}.`, err);
        }
        resolve(data);
      });
    });

    if (!cubeMapData) {
      return null;
    }

    // load all textures in the cubemap
    let texturesToLoad = cubeMapData.textures.filter((texture: any, index: any, arr: string | any[]) => arr.indexOf(texture) === index);
    let textures = await Promise.all(texturesToLoad.map((textureURL: string) => {
      const textureName = this._getFileName(textureURL);
      return this.loadFromUrl(textureURL, textureName, "texture");
    }));

    // create cubemap texture
    let cubeMapTexture = new Texture(this.app.graphicsDevice, {
      cubemap: true,
    });
    cubeMapTexture.name = key;
    cubeMapTexture.anisotropy = cubeMapData.anisotropy;
    cubeMapTexture.minFilter = cubeMapData.minFilter;
    cubeMapTexture.magFilter = cubeMapData.magFilter;

    // set cubemap texture source
    let sources = cubeMapData.textures.map((textureURL: string) => {
      const texture = textures.find((asset: any) => asset.name === this._getFileName(textureURL));
      if (!texture) {
        console.error(`Texture ${textureURL} not loaded`);
        return null;
      }
      return texture.resource.getSource();
    });
    cubeMapTexture.setSource(sources);

    // register cubemap asset
    this.registerAsset(cubeMapTexture, key, "cubemap");
    let asset = new Asset(key, "cubemap");
    asset.resource = cubeMapTexture;
    asset.loaded = true;
    return asset;
  }

  public static async loadFromUrl(url: string, key: string, type: string) {
    return await new Promise<Asset>((resolve, reject) => {
      this.assets.loadFromUrl(url, type, (err: any, asset?: Asset) => {
        if (err || !asset) {
          reject(`Error loading ${key}: ${err}`,);
        }

        if (asset) {
          asset.name = key;
        }

        resolve(asset);
      });
    });
  }

  private static async _loadAtlas(key: string, url: string) {
    const texture = new Asset(key, "texture", { url });
    const jsonUrl = url.replace(".png", ".json").replace(".jpg", ".json");
    const json = new Asset(key, "json", { url: jsonUrl });

    // load texture and json
    await Promise.all([
      new Promise<void>((resolve) => {
        texture.ready(() => {
          resolve();
        });
        this.assets.load(texture);
      }),
      new Promise<void>((resolve) => {
        json.ready(() => {
          resolve();
        });
        this.assets.load(json);
      }),
    ]);

    // setup texture atlas
    const atlas = new TextureAtlas();
    const data = json.resource;
    const textureAsset = texture.resource;
    const frames: AccessibleObject = {};
    for (const frameKey in data.frames) {
      const frame = data.frames[frameKey].frame;
      const pivot = data.frames[frameKey].pivot || {
        x : 0,
        y : 0,
      };
      frames[frameKey] = {
        rect   : new Vec4(frame.x, textureAsset.height - frame.y - frame.h, frame.w, frame.h),
        pivot  : new Vec2(pivot.x, pivot.y),
        border : new Vec4(0, 0, 0, 0),
      };
    }
    atlas.frames = frames;
    atlas.texture = textureAsset;
    atlas.texture.name = key;

    // create and register sprites
    Object.keys(atlas.frames).forEach((frameKey) => {
      const sprite = new Sprite(Game.app.graphicsDevice, {
        atlas,
        frameKeys: [frameKey],
      });
      this.registerAsset(sprite, frameKey, "sprite");
    });
  }

  static async loadScript(key: string, url: any) {
    if (key.startsWith("glslang")) {
      return Promise.resolve();
    }

    if (typeof url === "string") {
      return this.loadFromUrl(url, "script", key);
    }
    // webassembly script
    else {
      return new Promise<any>((resolve) => {
        WasmModule.setConfig(key, url);
        WasmModule.getInstance(key, (instance) => resolve(instance));
      });
    }
  }

  static loadResource(key: string, type: string): Promise<any> {
    switch (type) {
    case "texture":
      return this.loadFromUrl(this.assetData.resources.textures[key], key, "texture");
    case "material":
      return this.loadFromUrl(this.assetData.resources.materials[key], key, "material");
    case "model":
      return this.loadFromUrl(this.assetData.resources.models[key], key, "model");
    case "json":
      return this.loadFromUrl(this.assetData.resources.jsons[key], key, "json");
    case "font":
      return this.loadFromUrl(this.assetData.resources.fonts[key], key, "font");
    case "animation":
      return this.loadFromUrl(this.assetData.resources.animations[key], key, "animation");
    case "cubemap":
      return this.loadCubeMap(this.assetData.resources.cubemaps[key], key);
    case "audio":
      return SoundManager.loadAudio(key, this.assetData.resources.audios[key]);
    case "rawModel":
      return this.loadFromUrl(this.assetData.resources.rawModels[key], key, "container");
    case "webfont":
      return this.loadWebFont(this.assetData.resources.webfonts[key], key);
    default:
      return Promise.reject(`Unknown type: ${type}`);
    }
  }

  static hasResource(key: string, type?: string) {
    // eslint-disable-next-line no-negated-condition
    if (type !== undefined) {
      if (this.assetData.resources[`${type}s`] === undefined) {
        return false;
      }
      return this.assetData.resources[`${type}s`][key] !== undefined;
    }
    else {
      let has = false;
      for (let assetType in this.assetData.resources) {
        has = has || this.assetData.resources[assetType][key] !== undefined;
      }
      return has;
    }
  }

  static registerAsset(object: any, key: string, type: string) {
    const asset = new Asset(key, type);
    asset.resource = object;
    asset.loaded = true;
    this.assets.add(asset);
  }

  static loadAsset(key: string, type: string, url: string) {
    return new Promise((resolve, reject) => {
      this.assets.loadFromUrl(url, type, (err: any, asset?: Asset) => {
        if (err || !asset) {
          reject(err);
        }
        asset!.name = key;
        resolve(asset);
      });
    });
  }

  static async loadWebFont(url: string, key: string) {
    const style = document.createElement("style");
    style.innerHTML = `
      @font-face {
        font-family: "${key}";
        src: url(${url});
      }
    `;
    document.head.appendChild(style);
    return new Promise<void>((resolve) => {
      style.onload = () => {
        resolve();
      };
    });
  }

  static find(asset: string | Asset): Asset | null {
    if (typeof (asset) === "string") {
      return this.assets.find(asset);
    }
    return asset;
  }

  static findAll(asset: string): Asset[] {
    return this.assets.findAll(asset);
  }

  static getYamlData(assetName: string): any {
    if (!this._yamlDataCache[assetName]) {
      const asset = this.find(assetName);
      if (asset) {
        const text = asset.resource;
        this._yamlDataCache[assetName] = yaml.load(text);
      }
    }
    return this._yamlDataCache[assetName];
  }

  private static _getFileName(url: string) {
    return path.getBasename(url).replace(path.getExtension(url), "");
  }
}
