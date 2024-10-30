
import { Vec4 } from "playcanvas";
import { Tween } from "./tween";

export enum UITweenDirection {
  LeftToRight = "UiTweenDirection:LeftToRight",
  RightToLeft = "UiTweenDirection:RightToLeft",
  TopToBottom = "UiTweenDirection:TopToBottom",
  BottomToTop = "UiTweenDirection:BottomToTop",
}

export class UITween {

  static createElementTransitionAppearTween(entity: any, direction: UITweenDirection, config: any = Tween.defaultConfig): any {
    const anchor: any = entity.element.anchor.clone();
    const startAnchor: any = anchor.clone();
    if (direction === UITweenDirection.LeftToRight) {
      startAnchor.x -= 1;
      startAnchor.z -= 1;
    }
    else if (direction === UITweenDirection.RightToLeft) {
      startAnchor.x += 1;
      startAnchor.z += 1;
    }
    else if (direction === UITweenDirection.TopToBottom) {
      startAnchor.y += 1;
      startAnchor.w += 1;
    }
    else if (direction === UITweenDirection.BottomToTop) {
      startAnchor.y -= 1;
      startAnchor.w -= 1;
    }

    const tween: any = Tween.createTween(startAnchor, anchor, config);
    const onUpdate: any = tween._onUpdateCallback;
    const _onStart: any = tween._onStartCallback;
    tween.onStart(() => {
      entity.element.anchor = startAnchor;
      entity.element.enabled = true;
      _onStart();
    });
    tween.onUpdate(() => {
      entity.element.anchor = startAnchor;
      onUpdate();
    });
    return tween;
  }

  static createElementTransitionDisappearTween(entity: any, direction: UITweenDirection, config: any = Tween.defaultConfig): any {
    const anchor: any = entity.element.anchor.clone();
    const endAnchor: any = anchor.clone();
    if (direction === UITweenDirection.LeftToRight) {
      endAnchor.x += 1;
      endAnchor.z += 1;
    }
    else if (direction === UITweenDirection.RightToLeft) {
      endAnchor.x -= 1;
      endAnchor.z -= 1;
    }
    else if (direction === UITweenDirection.TopToBottom) {
      endAnchor.y -= 1;
      endAnchor.w -= 1;
    }
    else if (direction === UITweenDirection.BottomToTop) {
      endAnchor.y += 1;
      endAnchor.w += 1;
    }

    const tween: any = Tween.createTween(anchor, endAnchor, config);
    const onUpdate: any = tween._onUpdateCallback;
    tween.onUpdate(() => {
      entity.element.anchor = anchor;
      onUpdate();
    });
    return tween;
  }

  static createElementTransitionTweenByAnchor(entity: any, start : Vec4, target : Vec4, config: any = Tween.defaultConfig): any {
    const tween: any = Tween.createTween(start, target, config);
    const onUpdate: any = tween._onUpdateCallback;
    const _onStart: any = tween._onStartCallback;
    tween.onStart(() => {
      entity.element.anchor = start;
      entity.element.enabled = true;
      _onStart();
    });
    tween.onUpdate(() => {
      entity.element.anchor = start;
      onUpdate();
    });
    return tween;
  }

}
