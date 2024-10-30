/* eslint-disable max-depth */
import { Entity } from "playcanvas";
import { LoadedEntity } from "./loadedEntity";

export const ObjectMapping = Object.freeze({});


export default class LoadedJsonEntity extends Entity {
  private _objectMapping: { [key: string]: any };
  public rootNode: LoadedEntity;

  constructor(
    data: { [key: string]: any },
    // eslint-disable-next-line no-empty-pattern
    objectMapping: { [key: string]: new(...[]: any[]) => LoadedEntity } = ObjectMapping,
  ) {
    super(data.name || "map");
    this._objectMapping = objectMapping;
    this.rootNode = this._addEntityNode(data, undefined, false);
    this.addChild(this.rootNode);
  }

  _addEntityNode(entityData: {[key: string]: any}, parent?: LoadedEntity, autoLoad = true) {
    let entity = this._createEntityNode(entityData, parent, autoLoad);
    parent?.addChild(entity);
    return entity;
  }

  _createEntityNode(entityData: {[key: string]: any}, parent?: LoadedEntity, autoLoad = true) {
    let entity: LoadedEntity | undefined;

    if (this._objectMapping[entityData.name]) {
      entity = new this._objectMapping[entityData.name](entityData, parent, { autoLoad });
    }
    else {
      entityData.tags?.forEach((tag: string) => {
        if (entity) {
          return;
        }
        if (this._objectMapping[tag]) {
          entity = new this._objectMapping[tag](entityData, parent, { autoLoad });
        }
      });
    }


    if (!entity) {
      entity = new LoadedEntity(entityData, parent, { autoLoad });
    }

    if (entityData.children && entityData.children.length > 0) {
      entityData.children.forEach((child: {[key: string]: any}) => {
        this._addEntityNode(child, entity, autoLoad);
      });
    }

    return entity;
  }
}
