import "./template/systems/overrides/index";

import { Game } from "./game";

import "./template/systems/overrides/playcanvas.d";
import { GameConstant } from "./gameConstant";

window.addEventListener("contextmenu", (e) => e.preventDefault());
window.onload = () => {
  Game.load();
};
window.requestAnimationFrame = (cb) => setTimeout(cb, 1000 / GameConstant.TARGET_FPS);
