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
    AppOptions,
    AppBase,
    log,
    Mesh,
    PRIMITIVE_POINTS,
    SEMANTIC_POSITION,
    SEMANTIC_COLOR,
    BLENDMODE_ONE_MINUS_DST_ALPHA,
    CULLFACE_NONE,
    MeshInstance,
    Vec3,
  } from "playcanvas";
  import files from 'examples/files';
  import { deviceType, loadES5, rootPath } from 'examples/utils';
  
  const deviceType = "webgl2";
  const rootPath = window.location.origin;
  
  export class MultiApp {
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

      const CORE = await loadES5('https://cdn.jsdelivr.net/npm/@loaders.gl/core@2.3.6/dist/dist.min.js');
      const DRACO = await loadES5('https://cdn.jsdelivr.net/npm/@loaders.gl/draco@2.3.6/dist/dist.min.js');
      const gfxOptions = {
        deviceTypes : [deviceType],
        glslangUrl : rootPath + '/static/lib/glslang/glslang.js',
        twgslUrl: rootPath + '/static/lib/twgsl/twgsl.js'
      };

      /** @type {GraphicsDevice} */
      const device = await createGraphicsDevice(this.canvas, gfxOptions);
      device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

      const createOptions = new AppOptions();
      createOptions.graphicsDevice = device;
      createOptions.componentSystems = [RenderComponentSystem, CameraComponentSystem];
      createOptions.resourceHandlers = [TextureHandler, ContainerHandler];

      const app = new AppBase(this.canvas);
      app.init(createOptions);
      app.start();
      app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
      app.setCanvasResolution(RESOLUTION_AUTO);

      const resize = () => app.resizeCanvas();
      window.addEventListener('resize', resize);
      app.on('destroy', () =>{
        window.removeEventListener('resize', resize);
      });
      /**
       * @param {string}
       */
    
      async function loadModel(url) {
        console.log('loader.gl example url', url);
        const modelData = await CORE.load(url, DRACO.DracoLoader);
        const srcColors = modelData.attributes.COLOR_0.value;
        const numVertices = srcColors.length / modelData.attributes.COLOR_0.size;
        const colors32 = new Uint8Array(numVertices * 4);
        for (let i = 0; i < numVertices; i++){
          colors32[i * 4 + 0] = srcColors[i * 3 + 0];
          colors32[i * 4 + 1] = srcColors[i * 3 + 1];
          colors32[i * 4 + 2] = srcColors[i * 3 + 2];
          colors32[i * 4 + 3] = 255;
        }
        const mesh = new Mesh(app.graphicsDevice);
        mesh.clear(true, false);
        mesh.setPositions(modelData.attributes.POSITION.value, modelData.attributes.POSITION.size);
        mesh.setColors32(colors32);
        mesh.update(PRIMITIVE_POINTS);

        const material = new ShaderMaterial({
          uniqueName: 'MyShader',
          vertexCode: files['shader.vert'],
          fragmentCode: files['shader.frag'],
          attributes: {
            aPosition: SEMANTIC_POSITION,
            aColor: SEMANTIC_COLOR
          }
        });
        material.blendType = BLENDMODE_ONE_MINUS_DST_ALPHA;
        material.cull = CULLFACE_NONE;

        const entity = new Entity();
        entity.addComponent('render', {
          material: material,
          meshInstances: [new MeshInstance(mesh, material)]
        });
        app.root.addChild(entity);
    }
    const camera = new Entity();
        camera.addComponent('camera', {
          cleanColor: new Color(0.1, 0.1, 0.1),
          farClip: 100
        });    
        camera.translate(-20, 15, 20);
        camera.lookAt(0, 7, 0);
        app.root.addChild(camera);
        loadModel(rootPath + '/static/assets/models/park_points.drc');
        let time = 0;
        app.on('update', function(dt){
          time += dt;
          if(camera){
            camera.setLocalPosition(40 * Math.sin(time * 0.5), 10, 20 * Math.cos(time * 0.5));
            camera.lookAt(Vec3.ZERO);
            
          }
        });
    }
}