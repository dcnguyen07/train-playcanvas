import {
  Application,
  ElementInput,
  FILLMODE_FILL_WINDOW,
  RESOLUTION_AUTO,
  Keyboard,
  Mouse,
  createGraphicsDevice,
  platform,
  Entity,
  Color,
  StandardMaterial,
  createScript,
  Vec3,
  log,
} from "playcanvas";

const deviceType = "webgl2";

export class Editor {
  static canvas: HTMLCanvasElement;
  static app: Application;
  static width: number;
  static height: number;

  static async load() {
    this.canvas = document.createElement("canvas");
    this.canvas.id = "application-canvas";
    document.body.appendChild(this.canvas);

    const gfxOptions = {
      deviceTypes: [deviceType],
    };

    const device = await createGraphicsDevice(this.canvas, gfxOptions);
    device.maxPixelRatio = Math.min(window.devicePixelRatio, 2);

    const createOptions = {
      graphicsDevice: device,
      elementInput: new ElementInput(this.canvas),
      keyboard: new Keyboard(window),
      mouse: new Mouse(document.body),
    };

    this.app = new Application(this.canvas, createOptions);
    this.app.setCanvasFillMode(FILLMODE_FILL_WINDOW);
    this.app.setCanvasResolution(RESOLUTION_AUTO);
    this.app.start();

    // Thiết lập ánh sáng
    this.app.scene.ambientLight = new Color(0.2, 0.2, 0.2);

    // Đăng ký script BoxGrid
    const BoxGrid = createScript("boxGrid");
    
    BoxGrid.prototype.createFace = function (
      parent,
      rows,
      cols,
      width,
      height,
      position,
      rotation
    ) {
      const cellWidth = width / cols;
      const cellHeight = height / rows;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cell = new Entity();
          cell.addComponent("model", {
            type: "plane",
          });

          // Material với màu ngẫu nhiên
          const material = new StandardMaterial();
          material.diffuse.set(
            Math.random(),
            Math.random(),
            Math.random()
          );
          material.update();
          cell.model.material = material;

          // Đặt kích thước và vị trí
          cell.setLocalScale(cellWidth, cellHeight, 1);
          cell.setLocalPosition(
            col * cellWidth - width / 2 + cellWidth / 2,
            row * cellHeight - height / 2 + cellHeight / 2,
            0
          );

          parent.addChild(cell);
        }
      }

      parent.setLocalPosition(position.x, position.y, position.z);
      parent.setLocalEulerAngles(rotation.x, rotation.y, rotation.z);
    };

    BoxGrid.prototype.initialize = function () {
      const rows = 8,
        cols = 8;
      const size = 4; 
      const faces = [
        { pos: { x: 0, y: 0, z: size / 2 }, rot: { x: 0, y: 0, z: 0 } },
        { pos: { x: 0, y: 0, z: -size / 2 }, rot: { x: 0, y: 180, z: 0 } },
        { pos: { x: -size / 2, y: 0, z: 0 }, rot: { x: 0, y: 90, z: 0 } },
        { pos: { x: size / 2, y: 0, z: 0 }, rot: { x: 0, y: -90, z: 0 } },
        { pos: { x: 0, y: size / 2, z: 0 }, rot: { x: -90, y: 0, z: 0 } },
        { pos: { x: 0, y: -size / 2, z: 0 }, rot: { x: 90, y: 0, z: 0 } },
      ];

      for (let i = 0; i < faces.length; i++) {
        const face = new Entity();
        this.app.root.addChild(face);

        this.createFace(
          face,
          rows,
          cols,
          size,
          size,
          new Vec3(faces[i].pos.x, faces[i].pos.y, faces[i].pos.z),
          new Vec3(faces[i].rot.x, faces[i].rot.y, faces[i].rot.z)
        );
      }
    };

    const boxEntity = new Entity();
    boxEntity.addComponent("script");
    boxEntity.script.create("boxGrid");
    this.app.root.addChild(boxEntity);

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  static resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.app.resizeCanvas(this.width, this.height);
  }
}

Editor.load();
