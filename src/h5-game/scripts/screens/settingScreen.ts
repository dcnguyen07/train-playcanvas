import { GameConstant } from "../../../gameConstant";
import { UIScreen } from "../../../template/ui/uiScreen";
import { SettingPanel } from "../../screens/uiElements/settingPanel";

export class SettingScreen extends UIScreen {

  public static readonly Event = {
    Close: "close",
  };

  settingPanel: SettingPanel;

  constructor() {
    super(GameConstant.SETTING_SCREEN_NAME);
  }

  override create() {
    super.create();
    this._initSettingPanel();
  }

  _initSettingPanel() {
    this.settingPanel = new SettingPanel();
    this.addChild(this.settingPanel);
  }

  override onActivated() {
    super.onActivated();
    this.settingPanel.show();
  }

  override onDeactivated() {
    super.onDeactivated();
  }

  override hide() {
    super.hide();
  }
}
