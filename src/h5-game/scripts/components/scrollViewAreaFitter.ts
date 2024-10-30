import { Entity, ScriptType, Vec2 } from "playcanvas";
import { Game } from "../../../game";

export enum ScrollViewAreaFitterFitMode {
  Min = "ScrollViewAreaFitterFitMode:min",
  Max = "ScrollViewAreaFitterFitMode:max",
}

export type ScrollViewAreaConfig = {
  naturalWidth: number;
  naturalHeight: number;
  fitMode: ScrollViewAreaFitterFitMode;
  border: Vec2;
}
export default class ScrollViewAreaFitter extends ScriptType {
  static override get scriptName() {
    return "scrollViewAreaFitter";
  }

  portraitConfig: ScrollViewAreaConfig = null;
  landscapeConfig: ScrollViewAreaConfig = null;

  private _totalContentHeight = 0;

  fit() {
    let config = Game.isPortrait ? (this.portraitConfig ?? this.landscapeConfig) : (this.landscapeConfig ?? this.portraitConfig);

    let parent = this.entity.parent as Entity;
    let parentWidth = parent.element.width;
    let parentHeight = parent.element.height;
    let scaleWidthBase = (parentWidth / 571) * config.border.x;
    let scaleHeightBase = (parentHeight / config.naturalHeight) * config.border.y;
    let scale = 1;
    if (config.fitMode === ScrollViewAreaFitterFitMode.Min) {
      scale = Math.min(scaleWidthBase, scaleHeightBase);
    }
    else if (config.fitMode === ScrollViewAreaFitterFitMode.Max) {
      scale = Math.max(scaleWidthBase, scaleHeightBase);
    }

    this.entity.setLocalScale(scale, scale, scale);
    this.entity.element.height = this._totalContentHeight * scale;
  }

  onContentChange() {
    let layoutGroup = this.entity.layoutgroup;
    if (layoutGroup) {
      let height = layoutGroup.padding.y + layoutGroup.padding.w;
      let layoutChildCount = 0;
      let children = this.entity.children;
      for (let i = 0; i < children.length; ++i) {
        let child = children[i] as Entity;
        // eslint-disable-next-line max-depth
        if (child.layoutchild) {
          layoutChildCount += 1;
          height += child.element.height;
        }
      }

      // Add the spacing
      height += Math.max(0, layoutChildCount - 1) * layoutGroup.spacing.y;
      this._totalContentHeight = height;
    }
  }
}
