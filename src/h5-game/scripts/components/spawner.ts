import { ScriptType, Entity } from "playcanvas";


export class Spawner<T extends Entity> extends ScriptType {

  public static readonly Event: { [key: string]: string } = {
    Spawn   : "spawn",
    Despawn : "despawn",
  };

  public static override get scriptName() {
    return "Spawner";
  }
  class: new (...args: any[]) => T = null;
  args: any[] = [];
  poolSize: number = 10;

  pool: T[];

  override initialize(): void {
    this.pool = [];
  }

  override postInitialize(): void {
    this._createPool();
  }

  spawn(parent: Entity | null = null, index: number = -1): T {
    let entity = this.pool.pop() as T;
    if (!entity) {
      entity = this.createEntity();
    }

    entity.enabled = true;
    entity.once(Spawner.Event.Despawn, () => this.despawn(entity));

    if (parent) {
      if (index >= 0) {
        parent.insertChild(entity, index);
      }
      else {
        parent.addChild(entity);
      }
    }
    else {
      this.entity.addChild(entity);
    }

    entity.fire(Spawner.Event.Spawn);
    return entity;
  }

  despawn(entity: T): void {
    entity.enabled = false;
    entity.parent?.removeChild(entity);
    this.pool.push(entity);
  }

  spawnAt(
    targetEntity: Entity,
    parent: Entity | null = null,
    index: number = -1
  ): Entity {
    let pos = targetEntity.getPosition();
    let entity = this.spawn(parent || targetEntity, index);
    entity.setPosition(pos);
    return entity;
  }

  spawnTo(pos: any, parent: Entity | null = null, index: number = -1): Entity {
    let entity = this.spawn(parent || this.entity, index);
    entity.setPosition(pos);
    return entity;
  }

  _createPool(): void {
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push(this.createEntity());
    }
  }

  createEntity(): T {
    return new this.class(...this.args);
  }
}
