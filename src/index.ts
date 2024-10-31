import "./template/systems/overrides/index";

import { Game } from "./game";

import "./template/systems/overrides/playcanvas.d";
import { GameConstant } from "./gameConstant";
import { log } from "playcanvas";
import { Rotate } from "./h5-game/scripts/components/rotate";
import { Hello } from "./hello";
import { Editor } from "./editor";

window.addEventListener("contextmenu", (e) => e.preventDefault());
window.onload = () => {
  // Game.load();
  // Hello.load();
  Editor.load();
};
window.requestAnimationFrame = (cb) => setTimeout(cb, 1000 / GameConstant.TARGET_FPS);
