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
  } from "playcanvas";
  
  export class Hello {
    static canvas: HTMLCanvasElement;
    static app: Application;
    static width: number;
    static height: number;
    static gameCreated: boolean;
    static isLoading: boolean;
    static isPaused: boolean ;
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
  
      const camera = new Entity("camera");
      camera.addComponent("camera", { clearColor: new Color(0.5, 0.6, 0.9) });
      this.app.root.addChild(camera);
      camera.setPosition(0, 0, 3);
  
      const light = new Entity("light");
      light.addComponent("light");
      this.app.root.addChild(light);
      light.setEulerAngles(45, 0, 0);
  
      this.app.on("update", (dt) => {
        box.rotate(10 * dt, 20 * dt, 30 * dt);
      });
  
      this.gameCreated = true;
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
    Hello.setPause(document.hidden);
  });
  
  window.addEventListener("focus", () => Hello.setPause(false));
  window.addEventListener("blur", () => Hello.setPause(true));
  