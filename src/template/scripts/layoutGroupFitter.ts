/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Entity, ORIENTATION_HORIZONTAL, ORIENTATION_VERTICAL, ScriptType } from "playcanvas";

export class LayoutGroupFitter extends ScriptType {
  static override get scriptName() {
    return "LayoutGroupFitter";
  }

  orientation: number = ORIENTATION_VERTICAL;
  margin: number = 0;
  includeExcludedChildren: boolean = true;

  fit() {
    // calculate on next frame to make sure the layout group has updated
    if (this.orientation === ORIENTATION_VERTICAL) {
      this.fitVertical();
    }
    else if (this.orientation === ORIENTATION_HORIZONTAL) {
      this.fitHorizontal();
    }
  }

  fitVertical() {
    const layoutGroup = this.entity.layoutgroup;
    if (!layoutGroup || !this.entity.element) {
      return;
    }

    let height = layoutGroup.padding.y + layoutGroup.padding.w;
    const children = this.entity.children;
    for (let i = 0; i < children.length; ++i) {
      const child = children[i] as Entity;
      // @ts-ignore
      if (!child._enabled || !child.element || (!this.includeExcludedChildren && child.layoutchild?.excludeFromLayout)) {
        continue;
      }

      // Add the height of child to the new height of the content element
      height += child.element.height;
    }

    // Add the spacing
    height += Math.max(0, children.length) * layoutGroup.spacing.y;

    this.entity.element.height = height + this.margin;
  }

  fitHorizontal() {
    const layoutGroup = this.entity.layoutgroup;
    if (!layoutGroup || !this.entity.element) {
      return;
    }

    let width = layoutGroup.padding.x + layoutGroup.padding.z;
    const children = this.entity.children;
    for (let i = 0; i < children.length; ++i) {
      const child = children[i] as Entity;
      // @ts-ignore
      if (!child._enabled || !child.element || (!this.includeExcludedChildren && child.layoutchild?.excludeFromLayout)) {
        continue;
      }

      // Add the width of child to the new width of the content element
      width += child.element.width;
    }

    // Add the spacing
    width += Math.max(0, children.length) * layoutGroup.spacing.x;

    this.entity.element.width = width + this.margin;
  }
}
