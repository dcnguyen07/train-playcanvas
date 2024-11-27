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
    Asset,
    AppOptions,
    CameraComponentSystem,
    ScreenComponentSystem,
    TextureHandler,
    ScriptHandler,
    JsonHandler,
    TextHandler,
    AppBase,
    AssetListLoader,
    Vec3,
} from "playcanvas";

const deviceType = "webgl2";
const rootPath = window.location.origin;

export class SpineBoy {
    static canvas: HTMLCanvasElement;
    static app: Application;
    static width: number;
    static height: number;
    static gameCreated: boolean;
    static isLoading: boolean;
    static isPaused: boolean;

    static async load() {
        // Tạo phần tử canvas
        this.canvas = document.createElement("canvas");
        this.canvas.id = "application-canvas";
        document.body.appendChild(this.canvas);

        const assets = {
            skeleton: new Asset('skeleton', 'json', { url: `${rootPath}/static/assets/spine/spineboy-pro.json` }),
            atlas: new Asset('atlas', 'text', { url: `${rootPath}/static/assets/spine/spineboy-pro.atlas` }),
            texture: new Asset('spineboy-pro.png', 'texture', { url: `${rootPath}/static/assets/spine/spineboy-pro.png` }),
            spinescript: new Asset('spinescript', 'script', { url: `${rootPath}/static/scripts/spine/playcanvas-spine.3.8.js` })
        };

        const gfxOptions = {
            deviceType: [deviceType],
            glslangUrl: `${rootPath}/static/lib/glslang/glslang.js`,
            twgslUrl: `${rootPath}/static/lib/twgsl/twgsl.js`
        };

        const device = await createGraphicsDevice(this.canvas, gfxOptions);
        device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

        const createOptions = new AppOptions();
        createOptions.graphicsDevice = device;
        createOptions.componentSystems = [CameraComponentSystem, ScreenComponentSystem];
        createOptions.resourceHandlers = [TextureHandler, ScriptHandler, JsonHandler, TextHandler];

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
            app.assets.load(assets.spinescript);
            
            assets.spinescript.ready(() => {
                app.start();

                const camera = new Entity('camera');
                camera.addComponent('camera', {
                    clearColor: new Color(0.5, 0.6, 0.9)
                });
                app.root.addChild(camera);
                camera.translateLocal(0, 7, 20);

                /**
                 * @param {Vec3} position 
                 * @param {Vec3} scale 
                 * @param {number} timeScale 
                 */
                const createSpineInstance = (position, scale, timeScale) => {
                    const spineEntity = new Entity();
                    spineEntity.addComponent('spine', {
                        atlasAsset: assets.atlas.id,
                        skeletonAsset: assets.skeleton.id,
                        textureAssets: [assets.texture.id]
                    });
                    spineEntity.setLocalPosition(position);
                    spineEntity.setLocalScale(scale);
                    app.root.addChild(spineEntity);

                    
                    if (spineEntity.spine && spineEntity.spine.state) {
                        spineEntity.spine.state.setAnimation(0, 'portal', true);
                        spineEntity.spine.state.timeScale = timeScale;
                    }
                };

                
                createSpineInstance(new Vec3(2, 2, 0), new Vec3(1, 1, 1), 1);
                createSpineInstance(new Vec3(2, 10, 0), new Vec3(-0.5, 0.5, 0.5), 0.5);
            });
        });
    }
}

// var BoxGrid = pc.createScript('boxGrid');

// // Tạo một mặt phẳng với lưới ô vuông
// BoxGrid.prototype.createFace = function(parent, rows, cols, width, height, position, rotation) {
//     var cellWidth = width / cols;
//     var cellHeight = height / rows;

//     for (var row = 0; row < rows; row++) {
//         for (var col = 0; col < cols; col++) {
//             // Tạo ô
//             var cell = new pc.Entity();
//             cell.addComponent('model', {
//                 type: 'plane'
//             });

//             // Tạo material cơ bản
//             var material = new pc.StandardMaterial();
//             material.diffuse.set(Math.random(), Math.random(), Math.random()); // Màu ngẫu nhiên
//             material.update();
//             cell.model.material = material;

//             // Đặt kích thước và vị trí ô
//             cell.setLocalScale(cellWidth, cellHeight, 1);
//             cell.setLocalPosition(
//                 col * cellWidth - width / 2 + cellWidth / 2,
//                 row * cellHeight - height / 2 + cellHeight / 2,
//                 0
//             );

//             // Gắn vào mặt cha
//             parent.addChild(cell);
//         }
//     }

//     // Đặt vị trí và xoay mặt
//     parent.setLocalPosition(position.x, position.y, position.z);
//     parent.setLocalEulerAngles(rotation.x, rotation.y, rotation.z);
// };

// // Tạo hình hộp với 6 mặt
// BoxGrid.prototype.initialize = function() {
//     var rows = 8, cols = 8;  // 8x8 ô
//     var size = 4;  // Kích thước mỗi mặt (4x4 units)

//     // Tạo 6 mặt
//     var faces = [
//         { pos: { x: 0, y: 0, z: size / 2 }, rot: { x: 0, y: 0, z: 0 } }, // Front
//         { pos: { x: 0, y: 0, z: -size / 2 }, rot: { x: 0, y: 180, z: 0 } }, // Back
//         { pos: { x: -size / 2, y: 0, z: 0 }, rot: { x: 0, y: 90, z: 0 } }, // Left
//         { pos: { x: size / 2, y: 0, z: 0 }, rot: { x: 0, y: -90, z: 0 } }, // Right
//         { pos: { x: 0, y: size / 2, z: 0 }, rot: { x: -90, y: 0, z: 0 } }, // Top
//         { pos: { x: 0, y: -size / 2, z: 0 }, rot: { x: 90, y: 0, z: 0 } }  // Bottom
//     ];

//     for (var i = 0; i < faces.length; i++) {
//         var face = new pc.Entity();
//         this.app.root.addChild(face);

//         this.createFace(
//             face,
//             rows,
//             cols,
//             size,
//             size,
//             faces[i].pos,
//             faces[i].rot
//         );
//     }
// };
