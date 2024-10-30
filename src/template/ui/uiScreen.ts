import { GameConstant } from "../../gameConstant";
import { Game } from "../../game";
import { Entity, GraphNode, SCALEMODE_BLEND, Vec2, Vec3 } from "playcanvas";

export class UIScreen extends Entity {
  public static readonly EVENT_ACTIVATED = "UIScreen:ACTIVATED";
  public static readonly EVENT_DEACTIVATED = "UIScreen:DEACTIVATED";
  public static readonly EVENT_SHOW = "UIScreen:SHOW";
  public static readonly EVENT_HIDE = "UIScreen:HIDE";
  public created: boolean;

  constructor(name: string = "UIScreen") {
    super(name);
    this.addComponent("screen", {
      screenSpace         : true,
      scaleMode           : SCALEMODE_BLEND,
      resolution          : new Vec2(GameConstant.GAME_WIDTH, GameConstant.GAME_HEIGHT),
      referenceResolution : new Vec2(GameConstant.GAME_WIDTH, GameConstant.GAME_HEIGHT),
    });
    this.enabled = false;
    this.created = false;
  }

  create(): void {
    if (this.created) {
      console.error(`UIScreen ${typeof this} already created!`);
      return;
    }

    this.created = true;
  }

  onActivated(): void {
    this.enabled = true;
    this.fire(UIScreen.EVENT_ACTIVATED, this);
  }

  onDeactivated(): void {
    this.enabled = false;
    this.fire(UIScreen.EVENT_DEACTIVATED, this);
  }

  update(): void {
  }

  resize(): void {
  }

  pause(): void {
  }

  resume(): void {
  }

  show(): void {
    this.enabled = true;
  }

  hide(): void {
    this.enabled = false;
    this.fire(UIScreen.EVENT_HIDE, this);
  }

  destroyChildren(): void {
    while (this.children.length > 0) {
      this.children[0].destroy();
    }
  }

  getScreenSpacePosition(deviceScreenPos: Vec2, dst: Vec3 = new Vec3()): Vec3 {
    if (!this.screen) {
      return Vec3.ZERO;
    }
    dst.x = deviceScreenPos.x * Game.app.graphicsDevice.maxPixelRatio;
    dst.y = Game.app.graphicsDevice.height - deviceScreenPos.y * Game.app.graphicsDevice.maxPixelRatio;
    dst.z = 0;
    dst.mulScalar(1 / this.screen.scale);
    return dst;
  }

  getChildGlobalScale(child: GraphNode) {
    let scale = child.getLocalScale().clone();
    let parent = child.parent;
    while (parent !== this) {
      scale.mul(parent.getLocalScale());
      parent = parent.parent;
      if (parent === null) {
        return null;
      }
    }
    return scale;
  }
}
