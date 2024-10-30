import { Entity, Vec3 } from "playcanvas";
import { Game } from "../../../game";
import { GameConstant } from "../../../gameConstant";
import { SoundManager } from "../../../template/soundManager";
import { UserData } from "../../data/userData";
import { Rotate } from "../../scripts/components/rotate";
import { Spawner } from "../../scripts/components/spawner";
import { CollectCoinEffect } from "../effects/collectCoinEffect";
import { ResourceEntity } from "../resourceEntity";

export class CoinObstacle extends ResourceEntity {
  collectEffectSpawner: Spawner<CollectCoinEffect>;

  override async _initComponents() {
    await Promise.all([
      super._initComponents(),
      this._initCoin(),
      this._initEffect(),
    ]);
  }

  private _initCoin() {
    this.addComponent("collision", {
      type        : "box",
      halfExtents : new Vec3(0.4, 0.4, 0.05),
    });

    this.addScript(Rotate, {
      attributes: {
        speed: new Vec3(0, 360, 0),
      },
    });

    this.collision.on("triggerenter", this._onCollisionStart, this);
  }

  private _initEffect() {
    let spawnerEntity = new Entity();
    Game.app.root.addChild(spawnerEntity);
    this.collectEffectSpawner = spawnerEntity.addScript(Spawner<CollectCoinEffect>, {
      attributes: {
        class    : CollectCoinEffect,
        poolSize : 5,
      },
    });
  }

  _onCollisionStart(other: Entity) {
    if (other.name === "player") {
      UserData.currency += GameConstant.CURRENCY_PER_BY_COLLIDE;
      SoundManager.play("sfx_collect_coin");
      let spawn = this.collectEffectSpawner.spawn();
      spawn.setLocalPosition(this.getLocalPosition());
      this.destroy();
    }
  }

}
