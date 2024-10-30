// @ts-nocheck
import * as pc from "playcanvas";

const oldUpdateText = pc.TextElement.prototype._updateText;

pc.TextElement.prototype._updateText = function(text) {
  if (text === undefined) {
    text = this._text;
  }
  if (this._entity.element.localizeParams) {
    let keys = Object.keys(this._entity.element.localizeParams);
    keys.forEach((key) => {
      if (text.includes(`{${key}}`)) {
        text = text.replace(`{${key}}`, this._entity.element.localizeParams[key]);
      }
    });
  }
  if (this._entity.element.isUpperCase) {
    text = text.toUpperCase();
  }
  oldUpdateText.bind(this, text)();
};
