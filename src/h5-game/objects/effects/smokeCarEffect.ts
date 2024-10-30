import { Entity, Curve, CurveSet, Vec3 } from "playcanvas";
import { AssetManager } from "../../../template/assetManager";

export class SmokeCarEffect extends Entity {
  constructor() {
    super("smokeCarEffect");
    this._initParticle();
  }

  private _initParticle() {
    this.addComponent("particlesystem", {
      autoPlay       : true,
      numParticles   : 20,
      lifetime       : 1,
      rate           : 0.05,
      rate2          : 0.2,
      loop           : true,
      alignToMotion  : true,
      emitterExtents : [
        0.07,
        0,
        0.08,
      ],
      orientation    : 0,
      particleNormal : [
        0,
        0,
        1,
      ],
      colorMapAsset      : AssetManager.find("exhaustSmoke"),
      localVelocityGraph : {
        type : 1,
        keys : [
          [
            0,
            -0.1,
          ],
          [
            0,
            1,
          ],
          [
            0,
            1,
          ],
        ],
        betweenCurves: true,
      },
      localVelocityGraph2: {
        type : 1,
        keys : [
          [
            0,
            0.1,
          ],
          [
            0,
            1,
          ],
          [
            0,
            4,
          ],
        ],
      },
      radialSpeedGraph: {
        type : 1,
        keys : [
          0,
          0.6875,
        ],
        betweenCurves: false,
      },
      radialSpeedGraph2: {
        type : 1,
        keys : [
          0,
          0.6875,
        ],
      },
      scaleGraph: {
        type : 4,
        keys : [
          0,
          0.2,
          0.48604651162790696,
          0.3,
          1,
          0.1,
        ],
        betweenCurves: false,
      },
      scaleGraph2: {
        type : 1,
        keys : [
          0,
          0.1,
          0.48604651162790696,
          0.5,
          1,
          0.1,
        ],
      },
      alphaGraph: {
        type : 1,
        keys : [
          0,
          0.125,
          0.19767441860465115,
          0.2,
          1,
          0,
        ],
        betweenCurves: false,
      },
    });
  }

  play() {
    this.particlesystem.enabled = true;
  }

  stop() {
    this.particlesystem.enabled = false;
  }
}
