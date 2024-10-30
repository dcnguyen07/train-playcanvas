import { Entity, Curve, CurveSet, BLEND_ADDITIVEALPHA, EMITTERSHAPE_BOX, Vec3, BLEND_NORMAL } from "playcanvas";
import { AssetManager } from "../../../../template/assetManager";
import { BoxFragment } from "./boxFragment";

export class FragmentEffect extends Entity {
  boxs : BoxFragment[] = [];
  starParticle: Entity;
  constructor() {
    super();
    this._initFragment();
  }

  private _initFragment() {
    this.starParticle = new Entity();
    this.starParticle.setLocalPosition(0, 1, 0);
    // this.starParticle.setLocalScale(1.2, 1.2, 1.2);
    this.addChild(this.starParticle);

    let alphaGraph = new Curve([0, 1, 1, 1]);

    let velocityGraph = new CurveSet([
      [0, 1.5, 1, 1.5],
      [0, 3, 1, -4],
      [0, 1.5, 1, 1.5],
    ]);

    let velocityGraph2 = new CurveSet([
      [0, -1.5, 1, -1.5],
      [0, 2, 1, -3],
      [0, -1.5, 1, -1.5],
    ]);

    let scaleGraph = new Curve([0, 0]);
    let scaleGraph2 = new Curve([0, 0.1]);
    let colorGraph = new CurveSet([
      [0, 255 / 255],
      [0, 255 / 255],
      [0, 76 / 255],
    ]);

    let texture = AssetManager.find("tex_particle").resource;
    this.starParticle.addComponent("particlesystem", {
      numParticles        : 50,
      lifetime            : 1,
      rate                : 0,
      autoPlay            : true,
      loop                : false,
      colorMap            : texture,
      startAngle          : 0,
      startAngle2         : 360,
      blendType           : BLEND_NORMAL,
      emitterShape        : EMITTERSHAPE_BOX,
      emitterExtents      : new Vec3(0, 0, 0),
      emitterExtentsInner : new Vec3(0, 0, 0),
      localSpace          : true,
      localVelocityGraph  : velocityGraph,
      localVelocityGraph2 : velocityGraph2,
      scaleGraph,
      scaleGraph2,
      colorGraph          : colorGraph,
      alphaGraph          : alphaGraph,
    });
    this.showFragment();
  }

  public showFragment() {
    this.starParticle.particlesystem.reset();
    this.starParticle.particlesystem.play();
  }

  public hideFragment() {

  }
}
