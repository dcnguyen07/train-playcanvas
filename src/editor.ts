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
    Asset,
    AssetListLoader,
    RenderComponentSystem,
    CameraComponentSystem,
    LightComponentSystem,
    ScriptComponentSystem,
    TextureHandler,
    ContainerHandler,
    ScriptHandler,
    FontHandler,
  } from "playcanvas";
  
  const deviceType = "webgl2";
  const rootPath = window.location.origin;
  
  export class Editor {
    static canvas: HTMLCanvasElement;
    static app: Application;
    static width: number;
    static height: number;
    static gameCreated: boolean;
    static isLoading: boolean;
    static isPaused: boolean = false;
  
    static async load() {
      this.canvas = document.createElement("canvas");
      this.canvas.id = "application-canvas";
      document.body.appendChild(this.canvas);
  
      const gfxOptions = {
        deviceTypes: [deviceType],
        glslangUrl: `${rootPath}/static/lib/glslang/glslang.js`,
        twgslUrl: `${rootPath}/static/lib/twgsl/twgsl.js`,
      };
  
      const device = await createGraphicsDevice(this.canvas, gfxOptions);
      device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);
  
      const createOptions = {
        graphicsDevice: device,
        elementInput: new ElementInput(this.canvas),
        keyboard: new Keyboard(window),
        mouse: new Mouse(document.body),
        componentSystems: [
          RenderComponentSystem,
          CameraComponentSystem,
          LightComponentSystem,
          ScriptComponentSystem,
        ],
        resourceHandlers: [TextureHandler, ContainerHandler, ScriptHandler, FontHandler],
      };
  
      this.app = new Application(this.canvas, createOptions);
      this.app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
      this.app.setCanvasResolution(RESOLUTION_AUTO);
  
     
      this.app.start();
  
      function createColorMaterial(color: Color): StandardMaterial {
        const material = new StandardMaterial();
        material.diffuse = color;
        material.update();
        return material;
      }
  
      
      this.app.scene.ambientLight = new Color(0.2, 0.2, 0.2);
  
      const box = new Entity("box");
      box.addComponent("render", {
        type: "box",
        material: createColorMaterial(new Color(0.8, 1, 1)),
      });
      box.setPosition(1, 0, 1);
      this.app.root.addChild(box);
  
      const sphere = new Entity("sphere");
      sphere.addComponent("render", {
        type: "sphere",
        material: createColorMaterial(new Color(1, 0.8, 1)),
      });
      sphere.setPosition(-1, 0, 1);
      this.app.root.addChild(sphere);
  
      const cone = new Entity("cone");
      cone.addComponent("render", {
        type: "cone",
        material: createColorMaterial(new Color(1, 1, 0.8)),
      });
      cone.setPosition(-1, 0, -1);
      cone.setLocalScale(1.5, 2.25, 1.5);
      this.app.root.addChild(cone);
  
      const capsule = new Entity("capsule");
      capsule.addComponent("render", {
        type: "capsule",
        material: createColorMaterial(new Color(0.8, 0.8, 1)),
      });
      capsule.setPosition(1, 1, -1);
      this.app.root.addChild(capsule);
  
      const camera = new Entity("camera");
      camera.addComponent("camera", {
        clearColor: new Color(0.1, 0.1, 0.1),
        farClip: 1000,
      });
      camera.setPosition(0, 1, 10);
      this.app.root.addChild(camera);
  
      const light = new Entity("light");
      light.addComponent("light", { intensity: 1 });
      light.setEulerAngles(0, 0, 60);
      this.app.root.addChild(light);
  
      window.addEventListener("resize", () => this.resize());
      this.resize();
    }
  
    static resize() {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.app.resizeCanvas(this.width, this.height);
    }
  
    static setPause(isPaused: boolean) {
      this.isPaused = isPaused;
      this.app.timeScale = isPaused ? 0 : 1;
    }
  }
  
  document.addEventListener("visibilitychange", () => {
    Editor.setPause(document.hidden);
  });
  
  window.addEventListener("focus", () => Editor.setPause(false));
  window.addEventListener("blur", () => Editor.setPause(true));
  