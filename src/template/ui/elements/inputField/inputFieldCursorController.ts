import { ScriptType } from "playcanvas";
import { InputField } from "./inputField";

export class InputFieldCursorController extends ScriptType {
  static override get scriptName() {
    return "InputFieldCursorController";
  }

  inputField!: InputField;

  private _lastFrameCursorIndex: number = 0;

  override initialize() {
    if (!this.inputField) {
      this.inputField = this.entity as InputField;
    }

    this.updateCursorPosition();
  }

  override update() {
    if (this.inputField.inputElement.selectionEnd !== this._lastFrameCursorIndex) {
      this.updateCursorPosition();
      this._lastFrameCursorIndex = this.inputField.inputElement.selectionEnd || 0;
    }
  }

  public updateCursorPosition() {
    const inputElement = this.inputField.inputElement;
    const txtContent = this.inputField.txtContent;
    const contentMask = this.inputField.contentMask;
    const txtCursor = this.inputField.txtCursor;
    const txtTextToCursor = this.inputField.txtTextToCursor;

    const index = inputElement.selectionEnd || 0;
    const textToCursor = txtContent.element!.text.slice(0, index);
    const margin = contentMask.element!.margin.x;
    if (!textToCursor) {
      txtCursor.setLocalPosition(margin, 0, 0);
      return;
    }

    txtTextToCursor.element!.text = textToCursor;
    const cursorPosition = txtTextToCursor.element!.width + margin;
    const maxCursorPosition = contentMask.element!.calculatedWidth;
    let contentOffset = 0;
    if (cursorPosition < maxCursorPosition) {
      txtCursor.setLocalPosition(cursorPosition, 0, 0);
    }
    else {
      txtCursor.setLocalPosition(maxCursorPosition, 0, 0);
      contentOffset = maxCursorPosition - cursorPosition;
    }

    const contentPosition = txtContent.getLocalPosition();
    contentPosition.x = contentOffset;
    txtContent.setLocalPosition(contentPosition);
  }
}
