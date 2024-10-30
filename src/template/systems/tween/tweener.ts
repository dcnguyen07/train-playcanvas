import { Tween, Group } from "@tweenjs/tween.js";

export class Tweener extends Tween<any> {
  constructor(object: any, group?: Group) {
    super(object, group);
  }
}
