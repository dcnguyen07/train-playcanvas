import {
  BLEND_NORMAL,
  CULLFACE_NONE,
  GraphNode,
  Material,
  Mesh,
  MeshInstance,
  PRIMITIVE_TRISTRIP,
  SEMANTIC_POSITION,
  SEMANTIC_TEXCOORD0,
  ScriptType,
  Shader,
  Texture,
  Vec3,
  BLEND_ADDITIVEALPHA,
} from "playcanvas";
import { Time } from "../../../template/systems/time/time";


interface VertexPair {
  spawnTime: number;
  vertexPair: number[];
}

export default class Ribbon extends ScriptType {
  isStop: boolean = false;
  private timeoutId: any;

  static override get scriptName() {
    return "ribbon";
  }

  constructor(args: any) {
    super(args);
  }

  MAX_VERTICES = 600;
  VERTEX_SIZE = 4;

  lifeTime = 5;
  xOffset = -1;
  yOffset = 1;
  height = 0.5;
  minHeight = 0.1;
  color = [255, 255, 255];
  useTexture = false;
  texture: Texture = null;
  alpha: number = 0;

  timer = 0;
  node = null as GraphNode | null;
  vertices = [] as VertexPair[];
  vertexData = new Float32Array(this.MAX_VERTICES * this.VERTEX_SIZE);
  uvData = new Float32Array(this.MAX_VERTICES * 2);
  vertexIndexArray = [] as number[];
  isAdded = false;
  material: Material;
  mesh: Mesh;

  create(): void {
    this.timer = 0;
    this.node = null;
    this.vertices = [];
    this.vertexData = new Float32Array(this.MAX_VERTICES * this.VERTEX_SIZE);
    this.uvData = new Float32Array(this.MAX_VERTICES * 2);
    this.vertexIndexArray = [];
    for (let i = 0; i < this.vertexData.length; ++i) {
      this.vertexIndexArray.push(i);
    }
    this.isAdded = false;
  }

  override initialize() {
    this.create();

    const shaderDefinition = {
      attributes: {
        aPositionAge : SEMANTIC_POSITION,
        aUv          : SEMANTIC_TEXCOORD0,
      },
      vshader: [
        "attribute vec4 aPositionAge;",
        "attribute vec2 aUv;",
        "",
        "uniform mat4 matrix_viewProjection;",
        "uniform float trail_time;",
        "",
        "varying vec2 vUv;",
        "varying float vAge;",
        "",
        "void main(void)",
        "{",
        "    vAge = trail_time - aPositionAge.w;",
        "    vUv = aUv;",
        "    gl_Position = matrix_viewProjection * vec4(aPositionAge.xyz, 1.0);",
        "}",
      ].join("\n"),
      fshader: null as string | null,
    };
    if (this.useTexture) {
      shaderDefinition.fshader = [
        "precision mediump float;",
        "",
        "varying vec2 vUv;",
        "varying float vAge;",
        "",
        "uniform float trail_lifetime;",
        "uniform sampler2D texture_diffuseMap;",
        "uniform vec3 uColor;",
        "uniform float alpha;",
        "",
        "void main(void)",
        "{",
        "    float alpha2 = alpha == float(0) ? alpha : (1.0 - vAge / trail_lifetime) * 1.0;",
        "    vec4 texColor = texture2D(texture_diffuseMap, vUv);",
        "    gl_FragColor = vec4(texColor.rgb, alpha2);",
        "}",
      ].join("\n");
    }
    else {
      shaderDefinition.fshader = [
        "precision mediump float;",
        "",
        "varying vec2 vUv;",
        "varying float vAge;",
        "",
        "uniform float trail_lifetime;",
        "uniform vec3 uColor;",
        "uniform float alpha;",
        "",
        "void main(void)",
        "{",
        "    gl_FragColor = vec4(uColor, alpha);",
        "}",
      ].join("\n");
    }

    const shader = new Shader(this.app.graphicsDevice, shaderDefinition);

    this.material = new Material();
    this.material.shader = shader;
    this.material.cull = CULLFACE_NONE;
    this.material.blendType = BLEND_NORMAL;
    this.material.depthWrite = false;
    this.material.setParameter("uColor", [this.color[0] / 255, this.color[1] / 255, this.color[2] / 255]);
    this.material.setParameter("trail_time", 0.0);
    this.material.setParameter("trail_lifetime", this.lifeTime);
    this.material.setParameter("alpha", this.alpha);
    if (this.useTexture) {
      this.material.setParameter("texture_diffuseMap", this.texture);
    }
    this.material.update();

    this.mesh = new Mesh(this.app.graphicsDevice);
    this.mesh.clear(true, false);
    this.mesh.setPositions(this.vertexData, this.VERTEX_SIZE, this.MAX_VERTICES);
    this.mesh.setUvs(0, this.uvData, 2, this.MAX_VERTICES);
    this.mesh.setIndices(this.vertexIndexArray, this.MAX_VERTICES);
    this.mesh.update(PRIMITIVE_TRISTRIP);


    const meshInstance = new MeshInstance(this.mesh, this.material);
    meshInstance.cull = false;

    this.entity.addComponent("render", {
      meshInstances: [meshInstance],
    });
    this.entity.render.castShadows = false;
    this.entity.render.receiveShadows = false;
    this.entity.render.castShadowsLightmap = false;
    this.entity.render.enabled = false;
  }

  updateAlpha(alpha: number) {
    this.material.setParameter("alpha", alpha);
    this.material.update();
  }

  reset(): void {
    this.timer = 0.0;
    this.vertices = [];
    this.mesh.clear(true, false);
    this.mesh.update();
    this.entity.render.enabled = false;
  }

  spawn(): void {
    const node = this.entity;
    const pos = node.getPosition();
    const yaxis = node.up.clone().scale(this.height);

    const s = this.xOffset;
    const e = this.yOffset;

    this.vertices.unshift({
      spawnTime  : this.timer,
      vertexPair : [
        pos.x + yaxis.x * s, pos.y + yaxis.y * s, pos.z + yaxis.z * s,
        pos.x + yaxis.x * e, pos.y + yaxis.y * e, pos.z + yaxis.z * e,
      ],
    });
  }

  clearOld(): void {
    for (let i = this.vertices.length - 1; i >= 0; i--) {
      const vp = this.vertices[i];
      if (this.timer - vp.spawnTime >= this.lifeTime) {
        this.vertices.pop();
      }
      else {
        return;
      }
    }
  }

  updateVertexPairHeight() {
    for (let i = 0; i < this.vertices.length; i++) {
      const vp = this.vertices[i];
      let point1: Vec3 = new Vec3(vp.vertexPair[0], vp.vertexPair[1], vp.vertexPair[2]);
      let point2: Vec3 = new Vec3(vp.vertexPair[3], vp.vertexPair[4], vp.vertexPair[5]);
      let currentHeight = this.height - (this.height - this.minHeight) * (this.timer - vp.spawnTime) / this.lifeTime;
      let yaxis: Vec3 = point2.clone().sub(point1).normalize().scale(currentHeight);
      let anchor = point1.clone().add(point2).scale(0.5);
      const s = this.xOffset;
      const e = this.yOffset;
      vp.vertexPair[0] = anchor.x + yaxis.x * s;
      vp.vertexPair[1] = anchor.y + yaxis.y * s;
      vp.vertexPair[2] = anchor.z + yaxis.z * s;
      vp.vertexPair[3] = anchor.x + yaxis.x * e;
      vp.vertexPair[4] = anchor.y + yaxis.y * e;
      vp.vertexPair[5] = anchor.z + yaxis.z * e;
    }
  }

  copyToArrayBuffer(): void {
    for (let i = 0; i < this.vertices.length; i++) {
      const vp = this.vertices[i];

      this.vertexData[i * 8 + 0] = vp.vertexPair[0];
      this.vertexData[i * 8 + 1] = vp.vertexPair[1];
      this.vertexData[i * 8 + 2] = vp.vertexPair[2];
      this.vertexData[i * 8 + 3] = vp.spawnTime;
      this.uvData[i * 4 + 0] = 0;
      this.uvData[i * 4 + 1] = 0;

      this.vertexData[i * 8 + 4] = vp.vertexPair[3];
      this.vertexData[i * 8 + 5] = vp.vertexPair[4];
      this.vertexData[i * 8 + 6] = vp.vertexPair[5];
      this.vertexData[i * 8 + 7] = vp.spawnTime;
      this.uvData[i * 4 + 2] = 1;
      this.uvData[i * 4 + 3] = 1;

      if (this.vertexData.length === i) {
        break;
      }
    }
  }

  updateNumActive(): void {
    this.entity.render.meshInstances[0].mesh.primitive[0].count = this.vertices.length * 2;
  }

  override update(): void {
    if (this.isStop) {
      this.timer += 0;
    }
    else {
      this.timer += Time.dt;
    }

    this.material.setParameter("trail_time", this.timer);

    this.clearOld();
    this.updateVertexPairHeight();
    this.spawn();

    if (this.vertices.length > 1) {
      this.copyToArrayBuffer();
      const currentLength = this.vertices.length * 2;
      let limit = this.MAX_VERTICES;
      if (currentLength < limit) {
        limit = currentLength;
      }
      this.mesh.setPositions(this.vertexData, this.VERTEX_SIZE, limit);
      this.mesh.setUvs(0, this.uvData, 2, limit);
      this.mesh.setIndices(this.vertexIndexArray, limit);
      this.mesh.update(PRIMITIVE_TRISTRIP);
      this.entity.render.enabled = true;
    }
  }

  setColor([r, g, b]: [number, number, number]): void {
    this.material.setParameter("uColor", [r / 255, g / 255, b / 255]);
  }
}
