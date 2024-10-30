import { Entity } from "playcanvas";
import { UIManager } from "../ui/uiManager";

export class Scene extends Entity {
  public key: any;
  public ui: UIManager;
  public created: boolean = false;

  constructor(key: string) {
    super(key);
    this.key = key;
    this.ui = new UIManager();
    this.addChild(this.ui);
    this.created = false;
  }

  update() {
    this.ui.update();
  }

  resize() {
    this.ui.resize();
  }

  pause() {
    this.ui.pause();
  }

  resume() {
    this.ui.resume();
  }

  create() {
  }
}
