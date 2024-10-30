import { UIScreen } from "../../../template/ui/uiScreen";

export class PopupScreenManager {
  listPopupScreen: UIScreen[] = [];
  private _currentPopupScreen: UIScreen = null;
  private actionQueue: (() => void)[] = [];

  addPopupScreen(popupScreen: UIScreen) {
    this.listPopupScreen.push(popupScreen);
    popupScreen.on(UIScreen.EVENT_HIDE, this._onClosePopup.bind(this));
  }

  triggerShowPopupScreen(popupScreen: UIScreen) {
    if (this._currentPopupScreen) {
      this.actionQueue.push(this._showPopupScreen.bind(this, popupScreen));
    }
    else {
      this._showPopupScreen(popupScreen);
    }
  }

  addActionQueue(action: () => void) {
    if (this._currentPopupScreen) {
      this.actionQueue.push(action);
    }
    else {
      action();
    }
  }

  setPopupScreen(popupScreen: UIScreen) {
    this._currentPopupScreen = popupScreen;
  }

  private _showPopupScreen(popupScreen: UIScreen) {
    this._currentPopupScreen = popupScreen;
    popupScreen.show();
  }

  private _onClosePopup() {
    this._currentPopupScreen = null;
    if (this.actionQueue.length > 0) {
      let action = this.actionQueue.shift();
      action();
    }
  }
}
