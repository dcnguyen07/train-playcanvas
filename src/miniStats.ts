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
    ModelComponent,
    ModelComponentSystem,
    AppBase,
    MiniStats,
    Vec3,
    Texture,
    VertexFormat,
    VertexBuffer,
    PIXELFORMAT_RGB8,
  } from "playcanvas";
  
  const deviceType = "webgl2";
  const rootPath = window.location.origin;
  
  export class MiniStat {
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
        deviceType: [deviceType],
        glslangUrl: rootPath + '/static/lib/glslang/glslang.js',
        twgslUrl: rootPath + '/static/lib/twgsl/twgsl.js'
      };

      const device = await createGraphicsDevice(this.canvas, gfxOptions);
      device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

      const createOptions = new AppOptions();
      createOptions.graphicsDevice = device;
      createOptions.componentSystems = [
        ModelComponentSystem,
        RenderComponentSystem,
        CameraComponentSystem,
        LightComponentSystem
      ];

      const app = new AppBase(this.canvas);
      app.init(createOptions);
      app.start();
      app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
      app.setCanvasResolution(RESOLUTION_AUTO);

      const resize = () => app.resizeCanvas();
      window.addEventListener('resize', resize);
      app.on('destroy', () => {
        window.removeEventListener('resize', resize);
      });

      const options = MiniStats.getDefaultOptions();
      options.sizes = [
        { width: 128, height: 16, spacing: 0, graphs: false },
        { width: 256, height: 32, spacing: 2, graphs: true },
        { width: 500, height: 64, spacing: 2, graphs: true }
      ];

      options.startSizeIndex = 2;
      options.starts = [
        {
            name: 'Update',
            stats: ['frame.updateTime'],
            decimalPlaces: 1,
            unitsName: 'ms',
            watermark: 33
        },
        {
            name: 'DrawCalls',
            stats: ['drawCalls.total'],
            watermark: 2000
        },
        {
            name: 'triCount',
            stats: ['frame.triangles'],
            decimalPlaces: 1,
            multiplier: 1 / 1000,
            unitsName: 'k',
            watermark: 500
        },
        {
            name: 'materials',
            stats: ['frame.materials'],
            watermark: 2000
        },
        {
            name: 'cull',
            stats: ['frame.cullTime'],
            decimalPlaces: 1,
            watermark: 1,
            unitsName: 'ms'
        },
        {
            name: 'VRAM',
            stats: ['vram.tex', 'vram.geom'],
            decimalPlaces: 1,
            multiplier: 1 / (1024 * 1024),
            unitsName: 'MB',
            watermark: 100
        },
        {
            name: 'FPS',
            stats: ['frame.fps'],
            watermark: 60
        },
        {
            name: 'Frame',
            stats: ['frame.ms'],
            decimalPlaces: 1,
            unitsName: 'ms',
            watermark: 33
        }
      ];

      const miniStats = new MiniStats(app, options);
      const light = new Entity();
      light.addComponent('light', {
        type: 'directional'
      });
      app.root.addChild(light);
      light.setLocalEulerAngles(45, 30, 0);

      const camera = new Entity();
      camera.addComponent('camera', {
        clearColor: new Color(0.1, 0.1, 0.1)
      });
      app.root.addChild(camera);
      camera.setLocalPosition(20, 10, 10);
      camera.lookAt(Vec3.ZERO);

      /**
     * Helper function to create a primitive with shape type, position, scale.
     *
     * @param {string} primitiveType - The primitive type.
     * @param {number | pc.Vec3} position - The position.
     * @param {number | pc.Vec3} scale - The scale.
     * @returns {pc.Entity} The new primitive entity.
     */
    function createPrimitive(primitiveType, position, scale){
        const material = new StandardMaterial();
        material.diffuse = new Color(Math.random(), Math.random(), Math.random());
        material.update();

        const primitive = new Entity();
        primitive.addComponent('model', {
            type: primitiveType
        });
        primitive.model.material = material;
        primitive.setLocalPosition(position);
        primitive.setLocalScale(scale);
        return primitive;
    }
    // list of all created engine resources
    /** @type {Entity[]} */
    const entities = [];
    /** @type {any[]} */
    const vertexBuffers = [];
    /** @type {any[]} */
    const textures = [];

    // update function called every frame
    let adding = true;
    const step = 10,
        max = 2000;
    /** @type {Entity} */
    let entity;
    /** @type {VertexBuffer} */
    let vertexBuffer;
    /** @type {{ destroy: () => void}} */
    let texture;
    app.on('update', function(){
        for (let i = 0 ; i < step; i++){
            if(adding){
                const shape = Math.random() < 0.5 ? 'box' : 'sphere';
                const position = new Vec3(Math.random() * 10, Math.random() * 10, Math.random() * 10);
                const scale = 0.5 + Math.random();
                entity = createPrimitive(shape, position, new Vec3(scale, scale, scale));
                entities.push(entity);
                app.root.addChild(entity);
    
                if (entities.length >= max) {
                    adding = false;
                }
            }
            const vertexCount = 500;
            const data = new Float32Array(vertexCount * 16);
            const format = VertexFormat.getDefaultInstancingFormat(app.graphicsDevice);
            vertexBuffer = new VertexBuffer(app.graphicsDevice, format, vertexCount, {
                data: data
            });
            vertexBuffers.push(vertexBuffer);

            const texture = new Texture(app.graphicsDevice, {
                width: 64,
                height: 64,
                format: PIXELFORMAT_RGB8,
                mipmaps: false
            });
            textures.push(texture);

            texture.lock();
            texture.unlock();

            if (!app.graphicsDevice.isWebGPU) {
                // @ts-ignore engine-tsd
                app.graphicsDevice.setTexture(texture, 0);
            }
         else {
            // de-allocating resources

            if (entities.length > 0) {
                // destroy entities
                entity = entities[entities.length - 1];
                // @ts-ignore engine-tsd
                entity.destroy();
                entities.length--;

                // destroy vertex buffer
                vertexBuffer = vertexBuffers[vertexBuffers.length - 1];
                vertexBuffer.destroy();
                vertexBuffers.length--;

                // destroy texture
                texture = textures[textures.length - 1];
                texture.destroy();
                textures.length--;
            } else {
                adding = true;
            }
        }
    }
    });
    }
}