/* eslint-disable max-depth */
import * as pc from "playcanvas";
import { AssetManager } from "../../template/assetManager.js";
import { Rotate } from "../scripts/components/rotate.js";


export class LoadedEntity extends pc.Entity {
  options: any;
  data: {[key: string]: any};
  private _parentEntity: pc.Entity | undefined;
  // eslint-disable-next-line default-param-last
  constructor(entityData: any, parent? : pc.Entity, options : any = {
    autoLoad: true,
  }) {
    super(entityData.name);
    this.options = options;
    this.data = entityData;
    this.data.children = this.data.children || [];
    this._parentEntity = parent;
    this.load();
  }

  load() {
    this._addTags();
    this._applyTransformData();
    this._initComponents();

    for (let child of this.children) {
      // @ts-ignore
      if (child.load) {
        // @ts-ignore
        child.load();
      }
    }
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

  private _initModel(modelName: string, modelData: {[key: string] : any}) {
    if (modelName) {
      let modelAsset = AssetManager.find(modelName);
      modelData.asset = modelAsset;
    }

    this.addComponent("model", modelData);
    this.model.castShadows = false;
    this.model.receiveShadows = false;
    this.model.castShadowsLightmap = false;
    this.model.isStatic = true;
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

  protected _initComponents() {
    if (this.data.components) {
      for (let componentName in this.data.components) {
        if (componentName === "model") {
          this._initModel(this.data.components[componentName].asset, this.data.components[componentName]);
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
            this.rigidbody.friction = 0;
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
}
