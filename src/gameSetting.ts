import { GameConstant } from "./gameConstant";
import { AccessibleObject } from "./template/helpers/util";
import { SoundManager } from "./template/soundManager";
import { GameStorage } from "./template/systems/storage/gameStorage";

export interface GameSettingData extends AccessibleObject{
  music: boolean,
  sound: boolean,
  vibration: boolean,
}

export default class GameSetting {

  static _settings: GameSettingData = {
    music     : true,
    sound     : true,
    vibration : true,
  };

  static loadSetting(): void {
    const setting = GameStorage.instance.getObject<GameSettingData>(GameConstant.STORAGE_KEY_SETTING, GameSetting._settings);
    if (setting) {
      GameSetting._settings = setting;
    }
    GameSetting.saveSetting();
    SoundManager.muteAllMusic(!GameSetting._settings.music);
    SoundManager.muteAllSound(!GameSetting._settings.sound);
  }

  static saveSetting(): void {
    GameStorage.instance.setItem(GameConstant.STORAGE_KEY_SETTING, JSON.stringify(GameSetting._settings));
  }

  static get(key: string): boolean {
    return GameSetting._settings[key];
  }

  static set(key: string, value: boolean): void {
    GameSetting._settings[key] = value;
    GameSetting.saveSetting();
    switch (key) {
    case "music":
      SoundManager.muteAllMusic(!value);
      break;
    case "sound":
      SoundManager.muteAllSound(!value);
      break;
    case "vibration":
      break;
    default:
      break;
    }
  }

}
