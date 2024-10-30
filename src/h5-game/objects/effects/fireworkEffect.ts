import { BLEND_ADDITIVEALPHA, Curve, CurveSet, Entity, Vec3 } from "playcanvas";
import { AssetManager } from "../../../template/assetManager.js";
import { Game } from "../../../game.js";
import { Tween } from "../../../template/systems/tween/tween.js";
import { Spawner } from "../../scripts/components/spawner.js";

export class FireworkEffect extends Entity {
  static _spawner: any;
  numParticles: number;
  particles: any[];
  texture: any;
  renderAsset: any;
  velocityGraph1: CurveSet;
  velocityGraph2: CurveSet;
  scaleGraph: Curve;
  scaleGraph2: Curve;
  rotationSpeedGraph: Curve;
  emitterExtents: number[];
  particleBlue: Entity;
  particleGreen: Entity;
  particleOrange: Entity;
  particlePink: Entity;
  particle: Entity;

  /**
   * @param {Vec3} pos - position to play effect
   * @returns {FinishEffect}
   */
  static playAt(pos : Vec3) {
    if (!this._spawner) {
      this._createPool();
    }
    let effect = this._spawner.spawn();
    effect.setPosition(pos);
    effect.play();
    return effect;
  }

  static _createPool() {
    let spawnerEntity = new Entity("spawner_bulletHitEffect");
    this._spawner = spawnerEntity.addScript(Spawner, {
      attributes: {
        class    : FireworkEffect,
        poolSize : 10,
      },
    });
    Game.app.root.addChild(spawnerEntity);
  }

  constructor() {
    super("fx_finish");
    this.numParticles = 35;
    this.particles = [];
    this._initAsset();
    this._configParticle();
    this._initParticle();
    Game.app.root.addChild(this);

  }

  _initAsset() {
    this.texture = AssetManager.find("tex_particle").resource;
  }

  _configParticle() {
    this.velocityGraph1 = new CurveSet([
      [0, -5, 0.5, -5, 1, 2],
      [0, 15, 0.5, -2, 1, -7],
      [0, -3, -0.5, -1, 1, -2],
    ]);
    this.velocityGraph2 = new CurveSet([
      [0, 5, 0.5, 5, 1, 4],
      [0, 25, 0.5, -10, 1, -7],
      [0, 3, -0.5, 1, 1, 2],
    ]);
    this.scaleGraph = new Curve([0, 0.03]);
    this.scaleGraph2 = new Curve([0, 0.12]);
    this.rotationSpeedGraph = new Curve([0, 500, 0.5, 500, 1, 300]);
    this.emitterExtents = [1, 3, 1];
  }

  _createParticle(colorCurve : any) {
    this.particle = new Entity();
    this.addChild(this.particle);
    this.particle.addComponent("particlesystem", {
      autoPlay            : false,
      loop                : false,
      lifetime            : 3,
      numParticles        : this.numParticles,
      rate                : 0.01,
      rate2               : 0.05,
      colorMap            : this.texture,
      blend               : BLEND_ADDITIVEALPHA,
      animNumAnimations   : 4,
      animNumFrames       : 1,
      randomizeAnimIndex  : true,
      animLoop            : true,
      animSpeed           : 1,
      startAngle          : 0,
      startAngle2         : 0,
      colorGraph          : colorCurve,
      scaleGraph          : this.scaleGraph,
      scaleGraph2         : this.scaleGraph2,
      localVelocityGraph  : this.velocityGraph1,
      localVelocityGraph2 : this.velocityGraph2,
      rotationSpeedGraph  : this.rotationSpeedGraph,
      emitterExtents      : this.emitterExtents,
    });
    return this.particle;
  }

  _initParticle() {
    this.particleBlue = this._createParticle(new CurveSet([
      [0, 108 / 255],
      [0, 211 / 255],
      [0, 1],
    ]));

    this.particleGreen = this._createParticle(new CurveSet([
      [0, 0],
      [0, 1],
      [0, 0],
    ]));

    this.particleOrange = this._createParticle(new CurveSet([
      [0, 255 / 255],
      [0, 140 / 255],
      [0, 0],
    ]));

    this.particlePink = this._createParticle(new CurveSet([
      [0, 215 / 255],
      [0, 100 / 255],
      [0, 199 / 255],
    ]));
    this.particles.push(this.particleBlue, this.particleGreen, this.particleOrange, this.particlePink);
  }

  play() {
    this.particles.forEach((particle) => {
      particle.enabled = true;
      particle.particlesystem.reset();
      particle.particlesystem.play();
    });
    Tween.createCountTween({
      duration   : 0.5,
      onComplete : () => {
        // this.fire(Spawner.Event.Despawn);
      },
    });
  }

  public stopEffect() {
    this.particles.forEach((particle) => {
      particle.enabled = false;
    });
  }
}
