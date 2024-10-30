import { Color, HandleEventCallback, Vec3, Entity, BoundingBox, RenderComponent, ModelComponent } from "playcanvas";

export interface AccessibleObject {
  [key:string]: any;
}

export class Util {
  private static _numberFormatter: Intl.NumberFormat;

  static isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  }

  static linear(a: number, b: number, percent: number): number {
    return a + (b - a) * percent;
  }

  static easeIn(a: number, b: number, percent: number): number {
    return a + (b - a) * percent ** 2;
  }

  static easeOut(a: number, b: number, percent: number): number {
    return a + (b - a) * (1 - (1 - percent) ** 2);
  }

  static easeInOut(a: number, b: number, percent: number): number {
    return a + (b - a) * ((-Math.cos(percent * Math.PI) / 2) + 0.5);
  }

  static copyObject(src: AccessibleObject, dst?: AccessibleObject): AccessibleObject {
    if (dst === undefined) {
      dst = {} as AccessibleObject;
    }
    Object.keys(src).forEach((key) => {
      dst![key] = src[key];
    });
    return dst;
  }

  static hexToRgb(hex: string): Color {
    hex = hex.toLowerCase();
    const result = (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i).exec(hex)!;
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    return new Color(r, g, b);
  }

  static clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }

  public static repeat(t: number, length :number) {
    return this.clamp(t - Math.floor(t / length) * length, 0, length);
  }

  public static lerpAngle(a: number, b:number, t: number) {
    let delta = this.repeat((b - a), 360);
    if (delta > 180) {
      delta -= 360;
    }
    return a + delta * t;
  }

  static sign(num: number): number {
    return num < 0 ? -1 : 1;
  }

  /**
   * @summary Return random number between min and max, include min and max or random between 2 objects
   * @param min
   * @param max
   */
  static random<T>(min: number | T, max: number | T): any {
    if (typeof min === "number" && typeof max === "number") {
      return Math.random() * (max - min) + min;
    }
    else {
      return (Math.random() < 0.5 ? min : max) as typeof min;
    }
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  /**
   * @summary Return random element from list
   * @param {Array} list
   */
  static randomFromList<T>(list: T[]): T | undefined {
    if (list && list.length > 0) {
      const randomIndex = this.randomInt(0, list.length - 1);
      return list[randomIndex];
    }
    else {
      return undefined;
    }
  }

  static randomItemsFromList<T>(list: T[], count: number, unique = false): T[] {
    const result: T[] = [];
    if (list && list.length > 0) {
      while (result.length < count) {
        const randomIndex = this.randomInt(0, list.length - 1);
        const item = list[randomIndex];
        // eslint-disable-next-line max-depth
        if (unique && result.indexOf(item) !== -1) {
          continue;
        }
        result.push(item);
      }
    }
    return result;
  }

  static formatCurrency(num: number, digits: number = 0): string {
    if (!this._numberFormatter) {
      this._numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: digits, currency: "USD", style: "currency" });
    }
    return this._numberFormatter.format(num);
  }

  static randomFromEnum<T extends {}>(anEnum: T): T[keyof T] {
    const keys = Object.keys(anEnum);
    const enumValues = keys.map((k) => anEnum[k as keyof T]);
    const randomIndex = this.randomInt(0, enumValues.length - 1);
    return enumValues[randomIndex];
  }

  static randomVector(vecMin: Vec3, vecMax: Vec3, out: Vec3 = new Vec3()): Vec3 {
    out.x = Util.random(vecMin.x, vecMax.x);
    out.y = Util.random(vecMin.y, vecMax.y);
    out.z = Util.random(vecMin.z, vecMax.z);
    return out;
  }

  static distanceBetween(a: number, b: number): number {
    return Math.abs(Math.abs(a) - Math.abs(b));
  }

  /**
   * @returns Angle of vector in degree
   */
  static getAlpha(x: number, y: number): number {
    if (y === 0) {
      return 90;
    }
    return this.toDegree(Math.atan(Math.abs(x) / Math.abs(y)));
  }

  static toDegree(radian: number): number {
    return radian * 180 / Math.PI;
  }

  static toRadian(degree: number): number {
    return degree * Math.PI / 180;
  }

  /**
   * Return a random integer between min (inclusive), max (inclusive)
   * and not include 'excludeNumber'.
   * Note: the 'excludeNumber' must be >= min and <= max value,
   * if not, the probality may be incorect
   * Using Math.round() will give you a non-uniform distribution!
   * @param {number} min min number
   * @param {number} max max number (inclusive)
   * @param {number} excludeNumber the number not included in result
   * @returns {number} Random number
   */
  static getRandomIntExclude(min: number, max: number, excludeNumber: number): number {
    let rand = Math.floor(Math.random() * (max - min)) + min;
    if (rand === excludeNumber) {
      rand = max;
    }
    return rand;
  }

  /**
   * @summary Return first frame
   * @param {pc.Sprite} sprite
   */
  static getSpriteFrame(sprite: pc.Sprite, scale: number = 1): { x: number, y: number, width: number, height: number } {
    const rect = sprite.atlas.frames[sprite.frameKeys[0]].rect;
    return { x: rect.x, y: rect.y, width: rect.z * scale, height: rect.w * scale };
  }

  static createColor(r: number = 255, g: number = 255, b: number = 255, a: number = 1): Color {
    return new Color(r / 255, g / 255, b / 255, a);
  }

  static registerOnTouch(element: pc.ElementComponent, callback: HandleEventCallback, scope: any): void {
    element.useInput = true;
    element.on("mousedown", callback, scope);
    element.on("touchstart", callback, scope);
  }

  static registerOnceTouch(element: pc.ElementComponent, callback: HandleEventCallback, scope?: any): void {
    element.useInput = true;
    element.once("mousedown", callback, scope);
    element.once("touchstart", callback, scope);
  }

  static updateCircleTransform(entity: pc.Entity, radius: number, centerY: number, rotateMultiplier: number): void {
    const pos = entity.getLocalPosition();

    // calculate y in equation: (x-a)^2 + (y-b)^2 = r^2
    const x = pos.x;
    // let radius = GameConstant.PLAYER_MOVE_RADIUS;
    const squaredR = radius ** 2;
    const squredX = x ** 2;
    const y = Math.sqrt(squaredR + squredX) + centerY;
    pos.y = y;
    entity.setLocalPosition(pos);

    const rotation = entity.getLocalEulerAngles();
    const axis = Util.sign(pos.x);
    const distanceY = Math.abs(y - centerY);
    const alpha = Math.atan(distanceY / Math.abs(x)) * 180 / Math.PI;
    rotation.z = -axis * (alpha - 90) * rotateMultiplier;
    entity.setLocalEulerAngles(rotation);
  }

  static getCashFormat(num: number): string {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2).replace(/\.00$/, "") }B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2).replace(/\.00$/, "") }M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2).replace(/\.00$/, "") }K`;
    }
    return num.toString();
  }

  static shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  static upperFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const paddedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${paddedMinutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
  }

  static formatCharacterTime(time: number): string {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    let res = `${seconds}s`;
    if (minutes > 0) {
      res = `${minutes}m ${res}`;
    }
    if (hours > 0) {
      res = `${hours}h ${res}`;
    }
    return res;
  }

  private static readonly charA: number = "a".charCodeAt(0);

  private static readonly units: Map<number, string> = new Map<number, string>([
    [0, ""],
    [1, "K"],
    [2, "M"],
    [3, "B"],
    [4, "T"],
  ]);

  public static formatNumber(value: number): string {
    const absValue: number = Math.abs(value);

    if (absValue < 100) {
      let text: string = absValue.toFixed(2);
      if (value < 0) {
        text = `-${ text}`;
      }
      // Remove decimal part if it's an integer
      return parseFloat(text).toString();
    }

    const n: number = Math.floor(Math.log10(absValue) / Math.log10(1000));
    const m: number = absValue / 1000 ** n;
    let unit: string = "";

    if (n < this.units.size) {
      unit = this.units.get(n) ?? "";
    }
    else {
      const unitInt: number = n - this.units.size;
      const secondUnit: number = unitInt % 26;
      const firstUnit: number = Math.floor(unitInt / 26);
      unit = String.fromCharCode(firstUnit + this.charA) + String.fromCharCode(secondUnit + this.charA);
    }

    let numberString: string;
    if (m >= 10) {
      numberString = (Math.floor(m * 10) / 10).toString().replace(/(\.0*|(?<=\..*?)0*)$/, "");
    }
    else {
      numberString = (Math.floor(m * 100) / 100).toString().replace(/(\.0*|(?<=\..*?)0*)$/, "");
    }
    let result: string = numberString + unit;

    if (value < 0) {
      result = `-${ result}`;
    }

    return result;
  }

  public static formatFloat(value: number, decimalPlaces: number = 1): string {
    return value.toFixed(decimalPlaces).replace(/(\.0*|(?<=\..*?)0*)$/, "");
  }

  public static _arrayToVec3(arr: number[]): Vec3 {
    if (arr.length < 3) {
      console.warn("Invalid array to convert to Vec3");
      return new Vec3();
    }
    return new Vec3(arr[0], arr[1], arr[2]);
  }
}

export function isSubclassOf(subclass: Function, superclass: Function): boolean {
  if (typeof subclass !== "function" || typeof superclass !== "function") {
    return false;
  }

  return subclass.prototype instanceof superclass;
}

export function waitToNFrames(n: number = 1): Promise<void> {
  return new Promise((resolve) => {
    let count = 0;
    const callback = () => {
      count++;
      if (count >= n) {
        resolve();
      }
      else {
        requestAnimationFrame(callback);
      }
    };
    requestAnimationFrame(callback);
  });
}

export function waitTo(condition: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const callback = () => {
      if (condition()) {
        resolve();
      }
      else {
        requestAnimationFrame(callback);
      }
    };
    requestAnimationFrame(callback);
  });
}

/**
 * @summary Wait for time in seconds
 * @param time in seconds
 */
export function waitToTime(time: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time * 1000);
  });

}

// eslint-disable-next-line @typescript-eslint/ban-types
export function getAllSubclasses(baseClass: Function) {
  // eslint-disable-next-line no-new-func
  const globalObject = Function("return this")();
  const allVars = Object.keys(globalObject);
  const classes = allVars.filter(function(key) {
    try {
      const obj = globalObject[key];
      return obj.prototype instanceof baseClass;
    }
    catch (e) {
      return false;
    }
  });
  return classes;
}

export function buildAabb(entity: Entity) {
  let i;
  let m;
  let meshInstances = [];
  let aabb = new BoundingBox();

  let renders = entity.findComponents("render") as RenderComponent[];
  for (i = 0; i < renders.length; i++) {
    let render = renders[i];
    for (m = 0; m < render.meshInstances.length; m++) {
      meshInstances.push(render.meshInstances[m]);
    }
  }

  let models = entity.findComponents("model") as ModelComponent[];
  for (i = 0; i < models.length; i++) {
    let model = models[i];
    for (m = 0; m < model.meshInstances.length; m++) {
      meshInstances.push(model.meshInstances[m]);
    }
  }

  aabb.copy(meshInstances[0].aabb);
  for (i = 1; i < meshInstances.length; i++) {
    aabb.add(meshInstances[i].aabb);
  }

  return aabb;
}

export function getComponentInChildren(entity : any, componentName : any, components: any = []) {
  if (entity[componentName]) {
    components.push(entity[componentName]);
  }
  entity.children.forEach((child : any) => {
    getComponentInChildren(child, componentName, components);
  });
  return components;
}
