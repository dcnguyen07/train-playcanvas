import { Color, Entity, SCALEMODE_BLEND, Vec2, Vec4 } from "playcanvas";
import { GameConstant } from "../../gameConstant";
import { ObjectFactory } from "../../template/objects/objectFactory";
import { Scene } from "../../template/scene/scene";
import { Tween } from "../../template/systems/tween/tween";

export class TransitionScene extends Scene {
  transitionScreen: Entity;
  fakeBackground: Entity;
  isPlaying: boolean = false;

  constructor() {
    super(GameConstant.SCENE_TRANSITION);
  }

  override create() {
    super.create();
    this._initScreen();
    this._initFakeBg();
  }

  private _initScreen() {
    this.transitionScreen = new Entity("transitionScreen");
    this.transitionScreen.addComponent("screen", {
      screenSpace         : true,
      scaleMode           : SCALEMODE_BLEND,
      resolution          : new Vec2(GameConstant.GAME_WIDTH, GameConstant.GAME_HEIGHT),
      referenceResolution : new Vec2(
        GameConstant.GAME_WIDTH,
        GameConstant.GAME_HEIGHT,
      ),
      priority: 100,
    });
    this.addChild(this.transitionScreen);
  }

  private _initFakeBg() {
    this.fakeBackground = ObjectFactory.createEmptyImageElement({
      color    : Color.BLACK,
      useInput : false,
      opacity  : 1,
    });
    this.fakeBackground.element.opacity = 0.01;
    this.fakeBackground.enabled = false;
    this.fakeBackground.element.anchor = new Vec4(0, 0, 1, 1);
    this.transitionScreen.addChild(this.fakeBackground);
    this.playFadeOut();
  }

  public playFadeIn(callBack: () => void) {
    this.isPlaying = true;
    this.fakeBackground.element.opacity = 0.01;
    this.fakeBackground.element.useInput = true;
    this.fakeBackground.enabled = true;
    Tween.createTween(this.fakeBackground.element, { opacity: 1 }, {
      duration   : 0.5,
      easing     : Tween.Easing.Quadratic.Out,
      onComplete : () => {
        callBack();
      },
    }).start();
  }

  public playFadeOut() {
    if (!this.isPlaying) {
      return;
    }
    Tween.createTween(this.fakeBackground.element, { opacity: 0.01 }, {
      duration   : 0.55,
      easing     : Tween.Easing.Quadratic.In,
      onComplete : () => {
        this.fakeBackground.element.useInput = false;
        this.fakeBackground.element.opacity = 0.01;
        this.fakeBackground.enabled = false;
        this.isPlaying = false;
      },
    }).start();
  }
}
