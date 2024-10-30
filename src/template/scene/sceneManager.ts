import { Game } from "../../game";
import { Scene } from "./scene";

export class SceneManager {
  static scenes: Array<Scene> = [];
  static additiveScenes: Array<Scene> = [];
  static currentScene: Scene;

  static init(scenes: Array<Scene>) {
    this.scenes = scenes;
  }

  static loadScene(scene: Scene) {
    const oldScene = this.currentScene;
    this.currentScene = scene;

    this.additiveScenes.forEach((s) => s.destroy());
    Game.app.root.addChild(this.currentScene);
    this.currentScene.create();

    if (oldScene) {
      Game.app.root.removeChild(oldScene);
      oldScene.destroy();
    }
  }

  static loadSceneAddtive(scene: Scene) {
    this.additiveScenes.push(scene);
    scene.create();
    Game.app.root.addChild(scene);
  }

  static update() {
    this.currentScene?.update();
    this.additiveScenes.forEach((scene) => scene.update());
  }

  static resize() {
    this.currentScene?.resize();
    this.additiveScenes.forEach((scene) => scene.resize());
  }

  static pause() {
    this.currentScene?.pause();
    this.additiveScenes.forEach((scene) => scene.pause());
  }

  static resume() {
    this.currentScene?.resume();
    this.additiveScenes.forEach((scene) => scene.resume());
  }

  static getScene(key: string) {
    return this.scenes.find((s: Scene) => s.key === key);
  }
}
