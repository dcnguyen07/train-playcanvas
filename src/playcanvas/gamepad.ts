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
    TEXTURETYPE_RGBP,
    AppOptions,
    AppBase,
    TONEMAP_ACES,
    GamePads,
    PAD_1,
    PAD_LEFT,
    PAD_RIGHT,
    PAD_UP,
    PAD_DOWN,
  } from "playcanvas";
  
  const deviceType = "webgl2";
  const rootPath = window.location.origin;
  
  export class Gamepad {
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

      const assets = {
        helipad: new Asset(
            'helipad-env-atlas',
            'texture',
            { url: rootPath + '/static/assets/cubemaps/helipad-env-atlas.png' },
            { type: TEXTURETYPE_RGBP, mipmaps: false }
        ),
        statue: new Asset('statue', 'container', { url: rootPath + '/static/assets/models/statue.glb' })
      };
      
      const gfxOptions = {
        deviceType: [deviceType],
        glslangUrl: rootPath + '/static/lib/glslang/glslang.js',
        twgslUrl : rootPath + '/static/lib/twgsl/twgsl.js'
      };

      const device = await createGraphicsDevice(this.canvas, gfxOptions);
      device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

      const createOptions = new AppOptions();
      createOptions.graphicsDevice = device;
      createOptions.componentSystems = [RenderComponentSystem, CameraComponentSystem];
      createOptions.resourceHandlers = [TextureHandler, ContainerHandler];

      const app = new AppBase(this.canvas);
      app.init(createOptions);
      app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
      app.setCanvasResolution(RESOLUTION_AUTO);

      const resize = () => app.resizeCanvas();
      window.addEventListener('resize', resize);
      app.on('destroy', () => {
        window.removeEventListener('resize', resize);
      });

      const assetListLoader = new AssetListLoader(Object.values(assets), app.assets);
      assetListLoader.load(() => {
        app.start();
        app.scene.envAtlas = assets.helipad.resource;
        app.scene.rendering.toneMapping = TONEMAP_ACES;
        app.scene.exposure = 1.6;
        app.scene.skyboxMip = 1;

        const camera = new Entity();
        camera.addComponent('camera',{
            clearColor: new Color(0.4, 0.45, 0.5),
        });
        camera.translate(0, 7, 25);
        app.root.addChild(camera);

        const entity = assets.statue.resource.instantiateRenderEntity();
        app.root.addChild(entity);

    const gamepads = new GamePads();
    app.on('update', function () {
        gamepads.update();
        if (gamepads.isPressed(PAD_1, PAD_LEFT)) {
            entity.rotate(0, -1, 0);
        }
        if (gamepads.isPressed(PAD_1, PAD_RIGHT)) {
            entity.rotate(0, 1, 0);
        }
        if (gamepads.wasPressed(PAD_1, PAD_UP)) {
            entity.rotate(-1, 0, 0);
        }
        if (gamepads.wasPressed(PAD_1, PAD_DOWN)) {
            entity.rotate(1, 0, 0);
        }
        });
      })
    }
}