import "./template/systems/overrides/index";

import { Game } from "./game";

import "./template/systems/overrides/playcanvas.d";
import { GameConstant } from "./gameConstant";
import { GamePads, log } from "playcanvas";
import { Rotate } from "./h5-game/scripts/components/rotate";
import { BoxSnake, Hello } from "./snake/box";
import { Editor } from "./playcanvas/editor";
import { MiniStat } from "./playcanvas/miniStats";
import { SpineBoy } from "./playcanvas/spineboy";
import { Gamepad } from "./playcanvas/gamepad";
import { MultiApp } from "./playcanvas/multiapp";

window.addEventListener("contextmenu", (e) => e.preventDefault());
window.onload = () => {
  // Game.load();
  BoxSnake.load();
  // Editor.load();
  // MiniStat.load();
  // SpineBoy.load();
  // Gamepad.load();
  // MultiApp.load();
};
window.requestAnimationFrame = (cb) => setTimeout(cb, 1000 / GameConstant.TARGET_FPS);
