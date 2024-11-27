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
  Vec3,
  createScript,
  Ray,
  BoundingBox,
  EVENT_MOUSEDOWN,
  MOUSEBUTTON_LEFT,
  EVENT_MOUSEUP,
  EVENT_MOUSEMOVE,
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
    const boxScale = 1;
    box.setLocalScale(boxScale, boxScale, boxScale);

    const smallBox = new Entity("smallCube");
    smallBox.addComponent("render", { type: "box" });
    smallBox.addComponent("script");
    const smallBoxScale = boxScale / 8;
    smallBox.setLocalScale(smallBoxScale, smallBoxScale, smallBoxScale);
    smallBox.setLocalPosition(0, 0, 0);  
    const smallBoxMaterial = new StandardMaterial();
    smallBoxMaterial.diffuse = new Color(1, 1, 0);
    smallBox.render.material = smallBoxMaterial;
    box.addChild(smallBox); 

    const randomBox = new Entity("randomSmallCube");
    randomBox.addComponent("render", { type: "box" });
    randomBox.setLocalScale(smallBoxScale, smallBoxScale, smallBoxScale);
    const randomBoxMaterial = new StandardMaterial();
    randomBoxMaterial.diffuse = new Color(1, 0, 0);
    randomBox.render.material = randomBoxMaterial;

    const maxOffset = boxScale / 2 - smallBoxScale / 2;

    const randomFace = Object.values(FACES)[Math.floor(Math.random() * 6)];

    let randomX = 0, randomY = 0, randomZ = 0;
    switch(randomFace) {
      case FACES.FRONT:
        randomZ = maxOffset;  
        break;
      case FACES.BACK:
        randomZ = -maxOffset; 
        break;
      case FACES.LEFT:
        randomX = -maxOffset; 
        break;
      case FACES.RIGHT:
        randomX = maxOffset;  
        break;
      case FACES.TOP:
        randomY = maxOffset;  
        break;
      case FACES.BOTTOM:
        randomY = -maxOffset; 
        break;
    }

    randomBox.setLocalPosition(randomX, randomY, randomZ);
    box.addChild(randomBox);

      const camera = new Entity("camera");
      camera.addComponent("camera", { clearColor: new Color(0, 0, 0) });
      this.app.root.addChild(camera);
      camera.setPosition(0, 0, 3);

      const light = new Entity("light");
      light.addComponent("light");
      this.app.root.addChild(light);
      light.setEulerAngles(45, 0, 0);
      
      const boundary = boxScale / 2 - smallBoxScale / 2;
      let currentFace = FACES.FRONT; 
      const keyboard = new Keyboard(document.body);
      const mouse = new Mouse(this.canvas);
      const movePosition = 0.015;
      let isMouseDown = false;
      let mouseStartX = 0;
      let mouseStartY = 0;
      let lastMouseX = 0;
      let lastMouseY = 0;
      const rotationDirection = new Vec3(0, 0, 0);

      this.app.on('update', function(dt) {
        if (keyboard.isPressed(KEY_DOWN)) {
          rotationDirection.set(-20, 0, 0); 
      } else if (keyboard.isPressed(KEY_UP)) {
          rotationDirection.set(20, 0, 0); 
      } else if (keyboard.isPressed(KEY_LEFT)) {
          rotationDirection.set(0, 10, 0); 
      } else if (keyboard.isPressed(KEY_RIGHT)) {
          rotationDirection.set(0, -10, 0); 
      }
      if (rotationDirection.lengthSq() > 0) { 
        box.rotate(rotationDirection.x * dt, rotationDirection.y * dt, rotationDirection.z * dt);
    }

        if (keyboard.isPressed(KEY_LEFT)) {
          smallBox.translateLocal(-movePosition, 0, 0); 
        }
        if (keyboard.isPressed(KEY_RIGHT)) {
          smallBox.translateLocal(movePosition, 0, 0); 
        }
        if (keyboard.isPressed(KEY_UP)) {
          smallBox.translateLocal(0, movePosition, 0); 
        }
        if (keyboard.isPressed(KEY_DOWN)) {
          smallBox.translateLocal(0, -movePosition, 0); 
        }
      
        const position = smallBox.getLocalPosition();
        if (position.x > boundary) {
            smallBox.setLocalPosition(boundary, position.y, position.z);
        } else if (position.x < -boundary) { 
            smallBox.setLocalPosition(-boundary, position.y, position.z);
        } else if (position.y > boundary) {
            smallBox.setLocalPosition(position.x, boundary, position.z);
        } else if (position.y < -boundary) {
            smallBox.setLocalPosition(position.x, -boundary, position.z);
        } else if (position.z > boundary) {
            smallBox.setLocalPosition(position.x, position.y, boundary);
        } else if (position.z < -boundary) {
            smallBox.setLocalPosition(position.x, position.y, -boundary);
        } 
      });
      mouse.on("mousedown", (event) => {
        if (event.button === MOUSEBUTTON_LEFT) {
            isMouseDown = true;
            mouseStartX = event.x;
            mouseStartY = event.y;
            lastMouseX = event.x;
            lastMouseY = event.y;
        }
    });

    mouse.on("mousemove", (event) => {
      if (isMouseDown) {
          const deltaX = event.x - lastMouseX; 
          const deltaY = event.y - lastMouseY; 

          if (deltaX > 0) {
              rotationDirection.set(0, -10, 0); 
              smallBox.translateLocal(movePosition, 0, 0); 
          } else if (deltaX < 0) { 
              rotationDirection.set(0, 10, 0);
              smallBox.translateLocal(-movePosition, 0, 0);  
          } else if (deltaY > 0) {
            rotationDirection.set(-20, 0, 0); 
              smallBox.translateLocal(0, -movePosition, 0);
          } else if (deltaY < 0) {
              rotationDirection.set(20, 0, 0); 
              smallBox.translateLocal(0, movePosition, 0); 
          }

          lastMouseX = event.x;
          lastMouseY = event.y;
      }
  });

  mouse.on("mouseup", () => {
        isMouseDown = true;  
    });
    
      this.gameCreated = true;
    }
  
    static setRandomPosition(entity, maxOffset) {
      const randomX = (Math.random() * 2 - 1) * maxOffset;
      const randomY = (Math.random() * 2 - 1) * maxOffset;
      const randomZ = (Math.random() * 2 - 1) * maxOffset;
      entity.setLocalPosition(randomX, randomY, randomZ);
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


