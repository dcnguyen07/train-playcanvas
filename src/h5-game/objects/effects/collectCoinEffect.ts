import { Entity, CurveSet, Curve, BLEND_ADDITIVEALPHA } from "playcanvas";
import { AssetManager } from "../../../template/assetManager";
import { Spawner } from "../../scripts/components/spawner";

export class CollectCoinEffect extends Entity {
  private starParticle: Entity;
  constructor() {
    super("collectCoinEffect");
    this._initStarParticle();
    this.on(Spawner.Event.Spawn, this.play);
  }

  private _initStarParticle() {
    this.starParticle = new Entity();
    // this.starParticle.setLocalPosition(0, 1.5, 0);
    this.starParticle.setLocalScale(1.2, 1.2, 1.2);
    this.addChild(this.starParticle);

    let alphaGraph = new Curve([0, 1, 1, 0]);

    let velocityGraph = new CurveSet([
      [0, -2],
      [0, -3, 1, -3],
      [0, -2],
    ]);

    let velocityGraph2 = new CurveSet([
      [0, 2],
      [0, 4, 1, -3],
      [0, 2],
    ]);

    let scaleGraph = new Curve([0, 0.5, 1, 0]);
    let scaleGraph2 = new Curve([0, 0.25, 1, 0]);
    let colorGraph = new CurveSet([
      [0, 232 / 255],
      [0, 255 / 255],
      [0, 110 / 255],
    ]);

    let texture = AssetManager.find("tex_light_02").resource;
    this.starParticle.addComponent("particlesystem", {
      numParticles : 50,
      lifetime     : 0.8,
      rate         : 0,
      autoPlay     : true,
      loop         : false,
      colorMap     : texture,
      startAngle   : 0,
      startAngle2  : 360,
      blendType    : BLEND_ADDITIVEALPHA,
      velocityGraph,
      velocityGraph2,
      scaleGraph,
      scaleGraph2,
      colorGraph   : colorGraph,
      alphaGraph   : alphaGraph,
    });
  }

  play() {
    this.starParticle.particlesystem.reset();
    this.starParticle.particlesystem.play();
  }
}
