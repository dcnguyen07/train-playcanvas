import * as pc from "playcanvas";

export function interpolate(p0: number, p1: number, p2: number, p3: number, t: number): number {
  let v0: number = (p2 - p0) * 0.5;
  let v1: number = (p3 - p1) * 0.5;
  let t2: number = t * t;
  let t3: number = t * t2;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
}

export function bezierCurve(p0: number[], p1: number[], p2: number[], p3: number[], t: number): number[] {
  // Assuming p0, p1, p2, p3 are the control points

  let u: number = 1 - t;
  let tt: number = t * t;
  let uu: number = u * u;
  let uuu: number = uu * u;
  let ttt: number = tt * t;

  let p: number[] = p0.map((coord: number, index: number) => {
    return uuu * coord
      + 3 * uu * t * p1[index]
      + 3 * u * tt * p2[index]
      + ttt * p3[index];
  });

  return p;
}

let vector2: pc.Vec3 = new pc.Vec3();
let vector3: pc.Vec3 = new pc.Vec3();
let quaternion: pc.Quat = new pc.Quat();

export function lookRotation(forward: pc.Vec3, up: pc.Vec3, quatOut?: pc.Quat): pc.Quat {
  forward = forward.normalize();

  let vector: pc.Vec3 = forward.normalize();
  vector2 = vector2.cross(up, vector).normalize();
  vector3 = vector3.cross(vector, vector2);
  let m00: number = vector2.x;
  let m01: number = vector2.y;
  let m02: number = vector2.z;
  let m10: number = vector3.x;
  let m11: number = vector3.y;
  let m12: number = vector3.z;
  let m20: number = vector.x;
  let m21: number = vector.y;
  let m22: number = vector.z;

  let num8: number = (m00 + m11) + m22;
  if (num8 > 0.0) {
    let num: number = Math.sqrt(num8 + 1.0);
    quaternion.w = num * 0.5;
    num = 0.5 / num;
    quaternion.x = (m12 - m21) * num;
    quaternion.y = (m20 - m02) * num;
    quaternion.z = (m01 - m10) * num;
    return quaternion;
  }
  if ((m00 >= m11) && (m00 >= m22)) {
    let num7: number = Math.sqrt(((1.0 + m00) - m11) - m22);
    let num4: number = 0.5 / num7;
    quaternion.x = 0.5 * num7;
    quaternion.y = (m01 + m10) * num4;
    quaternion.z = (m02 + m20) * num4;
    quaternion.w = (m12 - m21) * num4;
    return quaternion;
  }
  if (m11 > m22) {
    let num6: number = Math.sqrt(((1.0 + m11) - m00) - m22);
    let num3: number = 0.5 / num6;
    quaternion.x = (m10 + m01) * num3;
    quaternion.y = 0.5 * num6;
    quaternion.z = (m21 + m12) * num3;
    quaternion.w = (m20 - m02) * num3;
    return quaternion;
  }
  let num5: number = Math.sqrt(((1.0 + m22) - m00) - m11);
  let num2: number = 0.5 / num5;
  quaternion.x = (m20 + m02) * num2;
  quaternion.y = (m21 + m12) * num2;
  quaternion.z = 0.5 * num5;
  quaternion.w = (m01 - m10) * num2;
  if (quatOut) {
    quatOut.copy(quaternion);
  }
  return quaternion.clone();
}


export function move(current: number, target: number, amount: number): number {
  if (target > current) {
    current += amount;
    if (current > target) {
      return target;
    }
  }
  else {
    current -= amount;
    if (current < target) {
      return target;
    }
  }
  return current;
}
