import { Entity } from "playcanvas";
import { AssetManager } from "../../../template/assetManager";
import { SoundManager } from "../../../template/soundManager";
import { Tween } from "../../../template/systems/tween/tween";
import { Tweener } from "../../../template/systems/tween/tweener";
import { BridgeRotate } from "../../scripts/components/bridgeRotate";
import { ResourceEntity } from "../resourceEntity";

export class TrainTrafficLight extends ResourceEntity {
  tweenScale: Tweener;
  lights : Entity[] = [];
  isPlay: boolean = false;
  collisionChecker1: any;
  collisionChecker: any;
  collisionChecker2: any;

  // eslint-disable-next-line default-param-last
  constructor(data: any, isCaching = false, parent?: Entity, options = {
    autoLoad: true,
  }) {
    super(data, isCaching, parent, options);
    if (this.loaded) {
      this.onLoaded();
    }
    else {
      this.once(ResourceEntity.Event.Loaded, this.onLoaded, this);
    }
  }

  onLoaded() {
    this._initTrafficLight();
    this._initLight();
  }

  private _initTrafficLight() {

    this.collisionChecker = this.findByName("collisionChecker");
    if (this.collisionChecker) {
      this.collisionChecker.collision.on("triggerenter", (other : any) => {
        if (other.name === "car") {
          if (!this.isPlay) {
            this.isPlay = true;
            this.playEffect();
            this.toggleLight();
            SoundManager.play("sfx_train", 0);
          }
        }
      });
    }


    this.collisionChecker1 = this.findByName("collisionChecker1");
    if (this.collisionChecker1) {
      this.collisionChecker1.collision.on("triggerenter", (other : any) => {
        if (other.name === "car") {
          if (!this.isPlay) {
            this.isPlay = true;
            this.playEffect();
            this.toggleLight();
            SoundManager.play("sfx_train", 0);
          }
        }
      });
    }

    this.collisionChecker2 = this.findByName("collisionChecker2");
    if (this.collisionChecker2) {
      this.collisionChecker2.collision.on("triggerenter", (other : any) => {
        if (other.name === "car") {
          if (!this.isPlay) {
            this.isPlay = true;
            this.playEffect();
            this.toggleLight();
            SoundManager.play("sfx_train", 0);
          }
        }
      });
    }


    this.tweenScale = Tween.createCountTween({
      duration   : 0.1,
      onComplete : () => {
        Tween.createTween({ scale: 1 }, { scale: 1.3 }, {
          duration : 0.3,
          easing   : Tween.Easing.Circular.In,
          onUpdate : (value : any) => {
            this.setLocalScale(value.scale, value.scale, value.scale);
          },
          onComplete: () => {
            Tween.createTween({ scale: 1.3 }, { scale: 1 }, {
              delay    : 0.7,
              duration : 0.3,
              easing   : Tween.Easing.Circular.Out,
              onUpdate : (value : any) => {
                this.setLocalScale(value.scale, value.scale, value.scale);
              },
              onComplete: () => {
                this.isPlay = false;
              },
            }).start();
          },
        }).start();
      },
    });
  }

  private _initLight() {
    for (let i = 0; i < 2; i++) {
      let lightEntity = new Entity();
      lightEntity.addComponent("model", {
        type: "plane",
      });
      lightEntity.setLocalScale(2, 2, 2);
      lightEntity.setLocalEulerAngles(90, 0, 0);
      lightEntity.setLocalPosition(-0.5 + i, 2.5, 0.2);
      let lightMaterial = AssetManager.find("mat_train_traffic_light").resource;
      lightEntity.model.meshInstances[0].material = lightMaterial;
      this.addChild(lightEntity);
      this.lights.push(lightEntity);
    }
    this.lights[0].enabled = false;
    this.lights[1].enabled = false;


  }

  toggleLight() {
    Tween.createCountTween({
      delay    : 0.3,
      duration : 0.1,
      repeat   : 7,
      onStart  : () => {
        this.lights[0].enabled = true;
        this.lights[1].enabled = false;
      },
      onRepeat: () => {
        this.lights[0].enabled = !this.lights[0].enabled;
        this.lights[1].enabled = !this.lights[1].enabled;
      },
      onComplete: () => {
        this.lights[0].enabled = false;
        this.lights[1].enabled = false;
      },
    }).start();
  }

  public playEffect() {
    this.tweenScale.stop();
    this.tweenScale.start();
  }
}
