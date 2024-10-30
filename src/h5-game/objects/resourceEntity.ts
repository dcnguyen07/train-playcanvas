/* eslint-disable max-depth */
import * as pc from "playcanvas";
import { AssetManager } from "../../template/assetManager.js";
import { Rotate } from "../scripts/components/rotate";
import ResourceHelper from "./ResourceHelper.js";


export class ResourceEntity extends pc.Entity {

  public static readonly Event = {
    ModelLoaded : "resourceEntity:modelLoaded",
    Loaded      : "resourceEntity:loaded",
    OnProgress  : "resourceEntity:progress",
  };
  isCaching: boolean;
  options: any;
  data: {[key: string]: any};
  private _modelLoaded: boolean;
  private _parentEntity: pc.Entity | undefined;
  private _childrenLoaded: number;
  // eslint-disable-next-line default-param-last
  constructor(entityData: any, isCaching : boolean = false, parent? : pc.Entity, options : any = {
    autoLoad: true,
  }) {
    super(entityData.name);
    this.isCaching = isCaching;
    this.options = options;
    this.data = entityData;
    this.data.children = this.data.children || [];
    this._modelLoaded = false;
    this._parentEntity = parent;
    this._childrenLoaded = 0;
    this.once(ResourceEntity.Event.ModelLoaded, this.checkLoaded, this);

    if (!this.options || this.options.autoLoad) {
      this.load();
    }
  }

  async load() {
    this._addTags();
    let promises = [];
    promises.push(this._initComponents());
    this._applyTransformData();
    if (this.data.children.length === 0 && ((this.data.components && !this.data.components.model) || !this.data.components)) {
      this.checkLoaded();
    }

    for (let child of this.children) {
      // @ts-ignore
      if (child.load) {
        // @ts-ignore
        promises.push(child.load());
      }
    }
    await Promise.allSettled(promises);
  }

  _addTags() {
    if (this.data.tags) {
      this.data.tags.forEach((tag: any) => {
        this.tags.add(tag);
      });
    }
  }

  _applyTransformData() {
    let rotation: [number, number, number] = this.data.eulerAngles || this.data.rotation;
    if (this.data.position) {
      this.setLocalPosition(...(this.data.position as [number, number, number]));
    }
    if (rotation) {
      // @ts-ignore
      this.setLocalEulerAngles(...rotation);
    }
    if (this.data.scale) {
      this.setLocalScale(...(this.data.scale as [number, number, number]));
    }
  }

  private async _initModel(modelName: string, modelData: {[key: string] : any}) {
    if (modelName) {
      let modelAsset = AssetManager.find(modelName);
      if (!modelAsset) {
        if (AssetManager.hasResource(modelName)) {
          try {
            await AssetManager.loadResource(modelName, "model");
            await this._initModel(modelName, modelData);
          }
          catch (e) {
            console.error(e);
          }
        }
        else {
          console.error(`Model ${modelName} not found`);
        }
        return;
      }
      modelData.asset = modelAsset;
    }

    if (modelData.materialAsset) {
      let materialKey = modelData.materialAsset;
      if (typeof materialKey === "string" && materialKey.includes(".json")) {
        materialKey = materialKey.replace(".json", "");
      }
      let mat =  await ResourceHelper.loadMaterial(materialKey);
      modelData.materialAsset = mat;
    }
    this.addComponent("model", modelData);
    this.model.castShadows = false;
    this.model.receiveShadows = false;
    this.model.castShadowsLightmap = false;
    this.model.isStatic = true;
    this._modelLoaded = true;

    this.fire(ResourceEntity.Event.ModelLoaded);

    if (this.options.layers) {
      this.model!.layers = this.options.layers;
    }
  }

  _initParticle(data : {[key: string] : any}) {
    for (let key in data) {
      if (key.toLowerCase().includes("asset") || key === "mesh") {
        data[key] = AssetManager.find(data[key]);
      }
    }
    this.addComponent("particlesystem", data);
  }

  protected async _initComponents() {
    if (this.data.components) {
      for (let componentName in this.data.components) {
        if (componentName === "model") {
          await this._initModel(this.data.components[componentName].asset, this.data.components[componentName]);
        }
        else if (componentName === "particlesystem") {
          this._initParticle(this.data.components[componentName]);
        }
        else if (componentName === "script") {
          this._initScripts(this.data.components[componentName]);
        }
        else {
          this.addComponent(componentName, this.data.components[componentName]);
          if (componentName === "rigidbody") {
            // this.rigidbody.friction = 0;
          }
        }
      }
    }
  }

  _initScripts(scripts: {[key: string] : any}) {
    for (let scriptName in scripts) {
      let script = scripts[scriptName];
      if (scriptName === "rotate") {
        this.addScript(Rotate, {
          speed: new pc.Vec3(script.speed),
        });
      }
    }
  }

  get loaded() {
    let loaded = true;
    if (this.data.components) {
      if (this.data.components.model && !this._modelLoaded) {
        loaded = false;
      }
    }
    if (this._childrenLoaded < this.data.children.length) {
      loaded = false;
    }
    return loaded;
  }

  checkLoaded() {
    if (this.loaded) {
      this.fire(ResourceEntity.Event.Loaded);
      if (this._parentEntity && this._parentEntity instanceof ResourceEntity) {
        this._parentEntity.onChildLoaded();
      }
    }
  }

  onChildLoaded() {
    this._childrenLoaded += 1;
    this.checkLoaded();
    this.fire(ResourceEntity.Event.OnProgress, this._childrenLoaded / this.data.children.length);
  }
}
