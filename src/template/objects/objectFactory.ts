/* eslint-disable no-negated-condition */
import { AssetManager } from "../assetManager";
import { Color, ELEMENTTYPE_GROUP, ELEMENTTYPE_IMAGE, ELEMENTTYPE_TEXT, Entity, FITTING_NONE, ORIENTATION_HORIZONTAL, Vec2, Vec4 } from "playcanvas";
import { Util } from "../helpers/util";
import { LayoutGroupFitter } from "../scripts/layoutGroupFitter";

export class ObjectFactory {
  static createCamera(name: string, data: any): Entity {
    const entity = new Entity(name);
    entity.addComponent("camera", data);
    return entity;
  }

  static createColorBackground(color: Color = new Color(), opacity: number = 1): Entity {
    const sprBackground = new Entity("spr_bg");
    sprBackground.addComponent("element", {
      type   : "image",
      anchor : new Vec4(0, 0, 1, 1),
      color,
      opacity,
    });
    return sprBackground;
  }

  static createModel(modelAsset: string, ...materialAssets: string[]): Entity {
    const asset = AssetManager.find(modelAsset);
    if (!asset) {
      throw new Error(`Asset ${modelAsset} not found`);
    }
    const entity = new Entity(asset.name);
    entity.addComponent("model", { asset: asset });
    materialAssets.forEach((materialAsset, index) => {
      const mat = AssetManager.find(materialAsset)?.resource;
      if (entity.model) {
        entity.model.meshInstances[index].material = mat;
      }
    });
    return entity;
  }

  static createBox(materialAsset?: string): Entity {
    const entity = new Entity();
    entity.addComponent("model", { type: "box" });
    if (materialAsset) {
      const material = AssetManager.find(materialAsset)?.resource;
      if (entity.model) {
        entity.model.meshInstances[0].material = material;
      }
    }
    return entity;
  }

  static createSphere(materialAsset?: string): Entity {
    const entity = new Entity();
    entity.addComponent("model", { type: "sphere" });
    if (materialAsset) {
      const material = AssetManager.find(materialAsset)?.resource;
      if (entity.model) {
        entity.model.meshInstances[0].material = material;
      }
    }
    return entity;
  }

  static createCone(material: any): Entity {
    const entity = new Entity();
    entity.addComponent("model", { type: "cone" });
    if (material && entity.model) {
      entity.model.meshInstances[0].material = material;
    }
    return entity;
  }

  static createPlane(materialAsset?: string): Entity {
    const entity = new Entity();
    entity.addComponent("model", { type: "plane" });
    if (materialAsset) {
      const asset = AssetManager.find(materialAsset);
      if (entity.model) {
        entity.model.meshInstances[0].material = asset?.resource;
      }
    }
    return entity;
  }

  static createSprite(spriteAsset: string): Entity {
    const asset = AssetManager.find(spriteAsset);
    if (!asset) {
      throw new Error(`Asset ${spriteAsset} not found`);
    }
    const entity = new Entity(asset.name);
    entity.addComponent("sprite", { spriteAsset: asset });
    return entity;
  }

  static createImageElement(spriteAsset: string, data: any = {}): Entity {
    data.type = ELEMENTTYPE_IMAGE;
    const scale = data.scale || 1;
    if (spriteAsset) {
      data.spriteAsset = AssetManager.find(spriteAsset);
      if (data.spriteAsset) {
        const frame = Util.getSpriteFrame(data.spriteAsset.resource, scale);
        data.width = data.width || frame.width;
        data.height = data.height || frame.height;
      }
      else {
        console.error(`Asset ${spriteAsset} not found`);
      }
    }

    data.opacity = data.opacity || 1;
    data.anchor = data.anchor || new Vec4(0.5, 0.5, 0.5, 0.5);
    data.pivot = data.pivot || new Vec2(0.5, 0.5);
    data.useInput = data.useInput || false;

    const name = data.name || data.spriteAsset?.name;
    const entity = new Entity(name);
    entity.addComponent("element", data);

    const x = data.x || 0;
    const y = data.y || 0;
    const z = data.z || 0;
    entity.setLocalPosition(x, y, z);

    return entity;
  }

  static createEmptyImageElement(data: any = {}): Entity {
    data.type = ELEMENTTYPE_IMAGE;
    data.width = data.width || 100;
    data.height = data.height || 100;
    data.opacity = data.opacity || 1;
    data.anchor = data.anchor || new Vec4(0.5, 0.5, 0.5, 0.5);
    data.pivot = data.pivot || new Vec2(0.5, 0.5);
    data.useInput = data.useInput || false;
    data.color = data.color || new Color(1, 1, 1);

    const entity = new Entity("element");
    entity.addComponent("element", data);

    const x = data.x || 0;
    const y = data.y || 0;
    const z = data.z || 0;
    entity.setLocalPosition(x, y, z);
    return entity;
  }

  static createButtonElement(textureAsset: string, data: any = {}): Entity {
    if (data.useInput === undefined) {
      data.useInput = true;
    }
    const entity = this.createImageElement(textureAsset, data);
    const hoverTint = data.hoverTint || new Color(0.9, 0.9, 0.9);
    const pressedTint = data.pressedTint || new Color(0.5, 0.5, 0.5);
    const inactiveTint = data.inactiveTint || new Color(150 / 255, 150 / 255, 150 / 255);
    entity.addComponent("button", {
      active       : true,
      hoverTint    : hoverTint,
      pressedTint  : pressedTint,
      imageEntity  : entity,
      inactiveTint : inactiveTint,
    });
    return entity;
  }

  static createGroupElement(data: any = {}): Entity {
    data.type = ELEMENTTYPE_GROUP;
    data.anchor = data.anchor || new Vec4(0.5, 0.5, 0.5, 0.5);
    data.pivot = data.pivot || new Vec2(0.5, 0.5);

    const name = data.name || "groupElement";
    const entity = new Entity(name);
    entity.addComponent("element", data);

    const x = data.x || 0;
    const y = data.y || 0;
    const z = data.z || 0;
    entity.setLocalPosition(x, y, z);
    return entity;
  }

  static createTextElement(fontAsset: string, data: any): Entity {
    data.fontAsset = AssetManager.find(fontAsset);
    if (!data.fontAsset) {
      console.error(`Asset ${fontAsset} not found`);
    }

    data.type = ELEMENTTYPE_TEXT;
    data.text = data.text || "Text";
    data.fontSize = data.fontSize || 32;
    data.anchor = data.anchor || new Vec4(0.5, 0.5, 0.5, 0.5);
    data.pivot = data.pivot || new Vec2(0.5, 0.5);
    data.alignment = data.alignment || new Vec2(0.5, 0.5);
    data.color = data.color || new Color(0, 0, 0);
    data.opacity = data.opacity || 1;
    data.margin = data.margin || new Vec4(0, 0, 0, 0);
    data.wrapLines = data.wrapLines === undefined ? true : data.wrapLines;
    data.autoWidth = data.autoWidth === undefined ? !data.width : data.autoWidth;
    data.autoHeight = data.autoHeight === undefined ? !data.height : data.autoHeight;
    data.lineHeight = data.lineHeight || 32;
    data.autoFitWidth = data.autoFitWidth === undefined ? false : data.autoFitWidth;
    data.autoFitHeight = data.autoFitHeight === undefined ? false : data.autoFitHeight;
    data.maxWidth = data.maxWidth || 0;
    data.maxLines = data.maxLines || Number.MAX_SAFE_INTEGER;

    const name = data.name || data.fontAsset?.name;
    const entity = new Entity(name);
    entity.addComponent("element", data);

    const x = data.x || 0;
    const y = data.y || 0;
    entity.setLocalPosition(x, y, 0);
    return entity;
  }

  static createLayoutGroupElement(data: any = {}): Entity {
    const entity = this.createGroupElement(data);
    data.orientation = data.orientation !== undefined ? data.orientation : ORIENTATION_HORIZONTAL;
    data.spacing = data.spacing || new Vec2(0, 0);
    data.alignment = data.alignment || new Vec2(0.5, 0.5);
    data.widthFitting = data.widthFitting !== undefined ? data.widthFitting : FITTING_NONE;
    data.heightFitting = data.heightFitting !== undefined ? data.heightFitting : FITTING_NONE;
    data.wrap = data.wrap !== undefined ? data.wrap : false;
    data.padding = data.padding || new Vec4(0, 0, 0, 0);
    data.reverseX = data.reverseX !== undefined ? data.reverseX : false;
    data.reverseY = data.reverseY !== undefined ? data.reverseY : false;
    data.autoWidth = data.autoWidth !== undefined ? data.autoWidth : false;
    data.autoHeight = data.autoHeight !== undefined ? data.autoHeight : false;
    entity.addComponent("layoutgroup", data);
    return entity;
  }

  static createFittedLayoutGroupElement(data: any = {}): Entity {
    const entity = this.createLayoutGroupElement(data);
    const fitter = entity.addScript(LayoutGroupFitter, {
      attributes: {
        orientation: data.orientation,
      },
    });
    // @ts-ignore
    entity.fitter = fitter;
    return entity;
  }
}
