import { rootPath } from 'examples/utils';
import {
  Application,
  ElementInput,
  FILLMODE_FILL_WINDOW,
  RESOLUTION_AUTO,
  Keyboard,
  Mouse,
  TouchDevice,
  createGraphicsDevice,
  platform,
  Entity,
  Color,
  StandardMaterial,
  BLEND_NORMAL,
  KEY_LEFT,
  KEY_RIGHT,
  KEY_DOWN,
  KEY_UP,
} from "playcanvas";
const FACES = {
  FRONT: 'front',
  BACK: 'back',
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom'
};
export class BoxSnake {
  static canvas: HTMLCanvasElement;
  static app: Application;
  static width: number;
  static height: number;
  static gameCreated: boolean;
  static isLoading: boolean;
  static isPaused: boolean;
  
  static async load() {
      // Create canvas element
      this.canvas = document.createElement("canvas");
      this.canvas.id = "application-canvas";
      document.body.appendChild(this.canvas);

      const isMobile = platform.mobile;
      const rootPath = window.location.href;
      const gfxOptions = {
          deviceTypes: ["webgl2", "webgl"],
          glslangUrl: `${rootPath}assets/scripts/glslang.js`,
          twgslUrl: `${rootPath}assets/scripts/twgsl.js`,
          antialias: !isMobile,
      };

      const device = await createGraphicsDevice(this.canvas, gfxOptions);

      this.app = new Application(this.canvas, {
          elementInput: new ElementInput(this.canvas),
          keyboard: new Keyboard(window),
          mouse: new Mouse(this.canvas),
          graphicsDevice: device,
      });

      if (platform.touch) {
          this.app.touch = new TouchDevice(this.canvas);
      }

      this.app.graphicsDevice.maxPixelRatio = Math.min(window.devicePixelRatio, 2);
      this.app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
      this.app.setCanvasResolution(RESOLUTION_AUTO);

      this.app.start();

      window.addEventListener("resize", () => this.resize());
      this.resize();

      this.create();
  }

  static create(): void {
      const box = new Entity("cube");
      box.addComponent("render", { type: "box" });
      this.app.root.addChild(box);
      
      const material = new StandardMaterial();
      material.opacity = 0.5; 
      material.blendType = BLEND_NORMAL; 
      box.render.material = material;
      this.app.root.addChild(box);

      const boxScale = 1;
      box.setLocalScale(boxScale, boxScale, boxScale);

      const smallBox = new Entity("smallCube");
      smallBox.addComponent("render", { type: "box"});
      const smallBoxScale = boxScale / 8; 
      smallBox.setLocalScale(smallBoxScale, smallBoxScale, smallBoxScale);

      smallBox.setLocalPosition(0, 0, 0);

      this.app.root.addChild(smallBox);

      const randomBox = new Entity("randomSmallCube");
      randomBox.addComponent("render", { type: "box" });
      randomBox.setLocalScale(smallBoxScale, smallBoxScale, smallBoxScale);
  
      const randomBoxMaterial = new StandardMaterial();
      randomBoxMaterial.diffuse = new Color(1, 0, 0);
      randomBox.render.material = randomBoxMaterial;
  
      const maxOffset = boxScale / 2 - smallBoxScale / 2; 
      const randomX = (Math.random() * 2 - 1) * maxOffset;
      const randomY = (Math.random() * 2 - 1) * maxOffset;
      const randomZ = (Math.random() * 2 - 1) * maxOffset;
      randomBox.setLocalPosition(randomX, randomY, randomZ);
  
      this.app.root.addChild(randomBox);


      const camera = new Entity("camera");
      camera.addComponent("camera", { clearColor: new Color(0, 0, 0) });
      this.app.root.addChild(camera);
      camera.setPosition(0, 0, 3);

      const light = new Entity("light");
      light.addComponent("light");
      this.app.root.addChild(light);
      light.setEulerAngles(45, 0, 0);
      

      const keyboard = new Keyboard(document.body);
      const movePosition = 0.015;
      const boundary = boxScale / 2 - smallBoxScale / 2;
      this.app.on('update', function(dt) {
        if (keyboard.isPressed(KEY_DOWN)){
          box.rotate(-20 * dt, 0, 0);
          smallBox.translateLocal(0, -movePosition, 0);
        }
        if (keyboard.isPressed(KEY_UP)){
          box.rotate(20 * dt, 0, 0);
          smallBox.translateLocal(0, movePosition, 0);
        }
        if (keyboard.isPressed(KEY_LEFT)){
          box.rotate(0, 20 * dt, 0);
          smallBox.translateLocal(-movePosition, 0, 0);
        }
        if (keyboard.isPressed(KEY_RIGHT)){
          box.rotate(0, -20 * dt, 0);
          smallBox.translateLocal(movePosition, 0, 0);
        }

        const position = smallBox.getLocalPosition();
        if (position.x > boundary) {
            smallBox.setLocalPosition(boundary, position.y, position.z);
            box.rotate(0, -90, 0);
        } else if (position.x < -boundary) { 
            smallBox.setLocalPosition(-boundary, position.y, position.z);
            box.rotate(0, 90, 0);
        } else if (position.y > boundary) {
            smallBox.setLocalPosition(position.x, boundary, position.z);
            box.rotate(-90, 0, 0);
        } else if (position.y < -boundary) {
            smallBox.setLocalPosition(position.x, -boundary, position.z);
            box.rotate(90, 0, 0);
        } else if (position.z > boundary) {
            smallBox.setLocalPosition(position.x, position.y, boundary);
        } else if (position.z < -boundary) {
            smallBox.setLocalPosition(position.x, position.y, -boundary);
        }
      });
      this.gameCreated = true;
  }

  static handleKeyboardInput(){
  }

  static resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.app.resizeCanvas(this.width, this.height);
  }

  static setPause(isPaused) {
      this.isPaused = isPaused;
      this.app.timeScale = this.isPaused ? 0 : 1;
  }
}

document.addEventListener("visibilitychange", () => {
  BoxSnake.setPause(document.hidden);
});

window.addEventListener("focus", () => BoxSnake.setPause(false));
window.addEventListener("blur", () => BoxSnake.setPause(true));