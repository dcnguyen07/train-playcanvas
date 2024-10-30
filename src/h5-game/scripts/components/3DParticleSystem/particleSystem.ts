import { Entity, ScriptType } from "playcanvas";
import { Spawner } from "../spawner";
import ParticleController from "./particleController";
import { Time } from "../../../../template/systems/time/time";

export default class ParticleSystem extends ScriptType {
  static override get scriptName() {
    return "particleSystem";
  }

  public duration: number = 0;
  public isLoop: boolean = false;
  public interval: number = 0;
  public maxParticle: number = 0;
  public spawner: Spawner<Entity> = null;

  private _isPlay = false;
  private _lastSpawnTime = 0;
  private _totalSpawned = 0;
  private _currentDuration = 0;

  override update() {
    if (this._isPlay) {
      if (!this.isLoop) {
        this._currentDuration -= Time.dt;
        // eslint-disable-next-line max-depth
        if (this._currentDuration <= 0) {
          this._isPlay = false;
          return;
        }
      }
    }
    else {
      return;
    }

    if (Time.current - this._lastSpawnTime >= this.interval && (this.maxParticle === 0 || this._totalSpawned < this.maxParticle)) {
      this._lastSpawnTime = Time.current;
      this.spawnParticle();
    }
  }

  play() {
    this._isPlay = true;
    this._currentDuration = this.duration;
    this.spawnParticle();
  }

  stop() {
    this._isPlay = false;
  }

  spawnParticle() {
    let particle = this.spawner.spawn();
    this.entity.addChild(particle);
    let particleController = particle.getScript(ParticleController);
    particleController.reset();
    this._totalSpawned++;
    particle.once(Spawner.Event.Despawn, this.onOneParticleDespawned, this);
  }

  onOneParticleDespawned() {
    this._totalSpawned--;
  }
}
