import { Entity } from "playcanvas";
import { AssetManager } from "../../../template/assetManager";
import JsonEntity from "../jsonEntity";
import { getComponentInChildren } from "../../../template/helpers/util";


export class CarCrashEffect extends Entity {
  private explodeEffect: JsonEntity;
  private particles: any;
  constructor() {
    super();
    this._initParticle();
  }

  private _initParticle() {
    this.addComponent("particlesystem", {
      enabled        : true,
      autoPlay       : false,
      numParticles   : 30,
      lifetime       : 1,
      rate           : 0.02,
      rate2          : 0.05,
      blendType      : 2,
      emitterShape   : 0,
      emitterExtents : [
        0.5,
        0.57,
        0.5,
      ],
      colorMapAsset      : AssetManager.find("smoke"),
      localVelocityGraph : {
        type : 1,
        keys : [
          [
            0,
            0,
          ],
          [
            0,
            6.9,
          ],
          [
            0,
            0,
          ],
        ],
        betweenCurves: true,
      },
      localVelocityGraph2: {
        type : 1,
        keys : [
          [
            0,
            0,
          ],
          [
            0,
            3.3000000000000007,
          ],
          [
            0,
            0,
          ],
        ],
      },
      scaleGraph: {
        type : 1,
        keys : [
          0,
          0.3375,
        ],
        betweenCurves: false,
      },
      scaleGraph2: {
        type : 1,
        keys : [
          0,
          0.3375,
        ],
      },
      colorGraph: {
        type : 4,
        keys : [
          [
            0,
            0.9803921568627451,
            0.14134754335260116,
            0.9803921568627451,
            0.3176481213872832,
            0.3803921568627451,
            0.7078215317919075,
            0.20392156862745098,
            1,
            0.14901960784313725,
          ],
          [
            0,
            0.48627450980392156,
            0.14134754335260116,
            0.7411764705882353,
            0.3176481213872832,
            0.3803921568627451,
            0.7078215317919075,
            0.20392156862745098,
            1,
            0.14901960784313725,
          ],
          [
            0,
            0.12549019607843137,
            0.14134754335260116,
            0.12549019607843137,
            0.3176481213872832,
            0.3803921568627451,
            0.7078215317919075,
            0.20392156862745098,
            1,
            0.14901960784313725,
          ],
        ],
        betweenCurves: false,
      },
      alphaGraph: {
        type : 1,
        keys : [
          0,
          1,
          0.6023255813953489,
          1,
          0.9953488372093023,
          0,
        ],
        betweenCurves: true,
      },
      alphaGraph2: {
        type : 1,
        keys : [
          0,
          1,
          0.6255813953488372,
          0.59375,
          1,
          0,
        ],
      },
    });
    let explodeData = AssetManager.find("explodeEffect.json").resource;
    this.explodeEffect = new JsonEntity(explodeData);
    this.addChild(this.explodeEffect);
    this.particles = getComponentInChildren(this, "particlesystem");
  }

  play() {
    this.particles.forEach((particle : any) => {
      particle.reset();
      particle.play();
    });
  }

  stop() {
    this.particles.forEach((particle : any) => {
      particle.stop();
    });
  }
}
