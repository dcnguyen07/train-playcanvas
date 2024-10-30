/* eslint-disable max-depth */
import { Entity } from "playcanvas";
import { ResourceEntity } from "./resourceEntity";

export const ObjectMapping = Object.freeze({});


export default class JsonEntity extends Entity {

  public static readonly Event = {
    Loaded   : "jsonEntity:loaded",
    Progress : "jsonEntity:progress",
  };
  private data: { [key: string]: any };
  private finish: null;
  private isCaching: boolean;
  private _objectMapping: { [key: string]: any };
  private options: {[key: string]: any};
  public rootNode: ResourceEntity;

  constructor(
    data: { [key: string]: any },
    isCaching: boolean = false,
    // eslint-disable-next-line no-empty-pattern
    objectMapping: { [key: string]: new(...[]: any[]) => ResourceEntity } = ObjectMapping,
    options: {[key: string]: any} = { autoLoad: true }
  ) {
    super(data.name || "map");
    this.data = data;
    this.finish = null;
    this.isCaching = isCaching;
    this._objectMapping = objectMapping;
    this.options = options;
    this.rootNode = this._addEntityNode(data, undefined, false);
    this.rootNode.once(ResourceEntity.Event.Loaded, this.fire.bind(this, JsonEntity.Event.Loaded));
    if (this.options.autoLoad) {
      this.load();
    }
    this.addChild(this.rootNode);
  }

  load() {
    this.rootNode.load();
  }

  get loaded() {
    return this.rootNode.loaded;
  }

  _addEntityNode(entityData: {[key: string]: any}, parent?: ResourceEntity, autoLoad = true) {
    let entity = this._createEntityNode(entityData, parent, autoLoad);
    parent?.addChild(entity);
    return entity;
  }

  _createEntityNode(entityData: {[key: string]: any}, parent?: ResourceEntity, autoLoad = true) {
    let entity: ResourceEntity | undefined;

    if (this._objectMapping[entityData.name]) {
      entity = new this._objectMapping[entityData.name](entityData, this.isCaching, parent, { autoLoad });
    }
    else {
      entityData.tags?.forEach((tag: string) => {
        if (entity) {
          return;
        }
        if (this._objectMapping[tag]) {
          entity = new this._objectMapping[tag](entityData, this.isCaching, parent, { autoLoad });
        }
      });
    }


    if (!entity) {
      entity = new ResourceEntity(entityData, this.isCaching, parent, { autoLoad });
    }

    if (entityData.children && entityData.children.length > 0) {
      entityData.children.forEach((child: {[key: string]: any}) => {
        this._addEntityNode(child, entity, autoLoad);
      });
    }

    return entity;
  }
}
