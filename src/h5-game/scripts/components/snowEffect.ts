import { BLEND_ADDITIVE, CULLFACE_FRONT, Entity, Material, SEMANTIC_POSITION, SEMANTIC_TEXCOORD0, ScriptType, Shader } from "playcanvas";
import { Game } from "../../../game";
import { Time } from "../../../template/systems/time/time";
import GamePlayManager from "../../objects/gamePlayManager/gamePlayManager";

export default class SnowEffect extends ScriptType {
  layer: number = 0;

  mat: Material;
  effect: Entity;

  static override get scriptName() {
    return "snowEffect";
  }

  override initialize() {
    this.effect = new Entity();
    this.entity.addChild(this.effect);
    this.effect.addComponent("render", {
      type: "plane",
      layers : [this.layer],
    });
    const shaderDefinition = {
      attributes: {
        aPosition : SEMANTIC_POSITION,
        aUv       : SEMANTIC_TEXCOORD0,
      },
      vshader: [
        "attribute vec3 aPosition;",
        "attribute vec2 aUv;",
        "",
        "uniform mat4 matrix_viewProjection;",
        "uniform mat4 matrix_model;",
        "",
        "varying vec2 vUv0;",
        "",
        "void main(void)",
        "{",
        "    vUv0 = aUv;",
        "    gl_Position = matrix_viewProjection * matrix_model * vec4(aPosition, 1.0);",
        "}",
      ].join("\n"),
      fshader: `
      precision mediump float;
      #define AMOUNT 20

      varying vec2 vUv0;

    uniform float uTime;
    uniform float uAspect;
    
    const vec2 rnd = vec2(31.31738093, 1117.81051701);
    const vec2 speed = vec2(4, 2);
    
    float smootherstep(float x) {
      return x*x*x*(3.0*x*(2.0*x-5.0)+10.0);
    }
    
    vec2 hash(vec2 p)
    {
      p = vec2( dot(p,vec2(127.1,311.7)),
            dot(p,vec2(269.5,183.3)) );
    
      return -1.0 + 2.0*fract(sin(p)*43758.5453123);
    }
    
    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
    
        return mix( mix( dot( hash( i + vec2(0, 0) ), f - vec2(0, 0) ), 
                         dot( hash( i + vec2(1, 0) ), f - vec2(1, 0) ), u.x),
                    mix( dot( hash( i + vec2(0, 1) ), f - vec2(0, 1) ), 
                         dot( hash( i + vec2(1, 1) ), f - vec2(1, 1) ), u.x), u.y);
    }
    
    
    // -------- FLAKE
    
    float flake(vec2 uv, vec2 pos, float size) {
      vec2 d = uv - pos;
      return 1.0 - smoothstep(0.0, size*size, dot(d,d));
    }
    
    // -------- WIND
    
    vec2 windifyTime(vec2 p, float t) {
        vec2 time = vec2(
            sin(t * 0.137 + p.y * 0.52) * 0.533 + 0.533,
            cos(t * 0.291 + p.x * 1.41) * 0.021 + 0.021
        );
        time *= vec2(
            cos(t * 0.617) * 0.611 + 0.611,
            sin(t * 0.579) * 0.471 + 0.471
        );
        return time *= 2.0;
    }
    
    // -------- AURORA
    
    vec3 aurora(vec2 uv, float scale, float speed, vec3 color) {
      float t = uTime * speed;
      vec2 s = vec2(scale, 2);
      vec2 m = vec2(-2, -2);
    
      vec2 p = uv * s + t * m;
      float n = 0.5 + 0.5 * noise(p + t);
    
      float aurora = n * (1.0 - uv.y);
      
      return color * aurora;
    }
    
    
    
    // -------- MAIN
    
    void main() {
          // prepare uv
        vec2 uv;
        uv.x = 1.0 - vUv0.x;
        uv.y = vUv0.y;
        float aspect = uAspect;
    
    
    
        // SNOWFLAKES and WIND
        
        // make uv borders extended off screen by 0.05 of its length
        // to make snow seemlessly infinite
        vec2 suv = (uv * 0.9 + vec2(0.05));
        suv.x *= aspect;
        
        float flakes = 0.0;
        float wind = 0.0;
    
        for (int i = 0; i < AMOUNT; i++) {
            float j = float(i);
    
            // initial random position
            vec2 p;
            p.x = fract(sin(j) * rnd.y) * aspect;
            p.y = fract(cos(j + p.x) * rnd.x);
    
            // initial random velocity
            float dv = 0.15;
            vec2 v = vec2(
                dv + fract(p.x * rnd.y) * dv,
               -dv - fract(p.y * rnd.x) * dv
            );
    
            // radius, the slower v the smaller r
            float lv = 0.6 - length(v);
            float r = lv * lv * 0.15;
    
            // apply gustiness to linerar time
            vec2 t = windifyTime(p, uTime);
            vec2 dt = windifyTime(p, uTime + 0.01) - t; // -0.008-0.008
    
            // result position
            p += v * (uTime + t) * speed;;
            p = mod(p, vec2(aspect, 1.0));
    
            // draw flakes, fake depth via different uv scales
            flakes += 0.3 * flake(suv, p, r);
            flakes += 0.9 * flake(suv * 0.7 + vec2(0.3), p, r * 0.9);
            flakes += 0.9 * flake(suv * 0.6 + vec2(0, 0.4), p, r * 0.8);
            flakes += 0.9 * flake(suv * 0.5 + vec2(0.5, 0), p, r * 0.7);
    
            // wind
    
            // wind derivative: dec-equal-inc -> 0-0.5-1
            float dw = smootherstep((dt.x + 0.008) * 62.5);
            // length of stripe, smaller value longer stripe
            float wl = 0.04 * (2.0 - dw);
            // distort uv
            vec2 wuv = suv * vec2(wl, sin(suv.x * 0.5 + 0.5));
            // get position
            vec2 wp = v * (uTime * 2.0 + 123.4 + t) * speed * 0.06;
            wp = mod(wp, vec2(aspect * 0.08, 1));
            // draw wind stripes
            wind += flake(wuv, wp, r) * dw;
            wind += flake(wuv * 0.4, wp, r) * dw;
        }
    
        wind *= uv.x * (1.0 - uv.y);
        wind *= noise(uv * vec2(1, 4) + uTime * 0.2) + 0.1;
        wind *= 2.0;
    
        gl_FragColor = vec4(vec3(wind + flakes), 1.0);
    }`,
    };
    const shader = new Shader(Game.app.graphicsDevice, shaderDefinition);
    this.mat = new Material();
    this.mat.shader = shader;
    this.mat.cull = CULLFACE_FRONT;
    this.mat.blendType = BLEND_ADDITIVE;
    // this.mat.setParameter("uAspect", aspect);
    // this.mat.setParameter("uTime", Time.current);
    this.mat.update();

    this.effect.render.meshInstances[0].material = this.mat;

    Game.app.on("resize", this.resize, this);
    this.resize();
    this.effect.enabled = false;
  }

  override update() {
    let aspect = Game.app.graphicsDevice.width / Game.app.graphicsDevice.height;
    this.mat.setParameter("uTime", Time.current);
    this.mat.setParameter("uAspect", aspect);
  }

  resize() {
    let aspect = Game.app.graphicsDevice.width / Game.app.graphicsDevice.height;
    this.effect.setLocalScale(aspect, 1, 1);
  }

  onFreezeSkillStarted() {
    this.effect.enabled = true;
  }

  onFreezeSkillEnded() {
    this.effect.enabled = false;
  }
}
