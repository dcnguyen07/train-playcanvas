import { Vec2, Vec3, Vec4 } from "playcanvas";


Vec2.prototype.scale = function(scalar:number) {
  return this.mulScalar(scalar);
};

Vec3.prototype.scale = function(scalar:number) {
  return this.mulScalar(scalar);
};

Vec4.prototype.scale = function(scalar:number) {
  return this.mulScalar(scalar);
};


export {};
