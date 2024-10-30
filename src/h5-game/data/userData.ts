import EventEmitter from "events";
import { GameConstant } from "../../gameConstant";
import { GameStorage } from "../../template/systems/storage/gameStorage";

export class UserData {

  private static _currentLevel: number;
  private static _currency: number;
  private static _currentSkin: string;
  private static _skinUnlocked: string[];
  private static _progressRewardSkin: number;

  public static readonly Event = {
    CurrencyChanged: "currency-changed",
  };
  static emitter: EventEmitter = new EventEmitter();

  static init() {
    this._achievementData = [
      {
        carsUnlocked  : 3,
        achievementId : "unlock3Cars",
      },
      {
        carsUnlocked  : 5,
        achievementId : "unlock5Cars",
      },
      {
        carsUnlocked  : 10,
        achievementId : "unlock10Cars",
      },
      {
        carsUnlocked  : 15,
        achievementId : "unlock15Cars",
      },
    ];

    this._initCurrentLevel();
    this._initCurrency();
    this._initSkinData();
    this._initProgressRewardSkin();
  }

  private static _initCurrentLevel() {
    this._currentLevel = GameStorage.instance.getInt(GameConstant.STORAGE_CURRENT_LEVEL, -1);
    if (this._currentLevel === -1) {
      this._currentLevel = 1;
      GameStorage.instance.setItem(GameConstant.STORAGE_CURRENT_LEVEL, this._currentLevel);
    }
  }

  public static get currentLevel() {
    return this._currentLevel;
  }

  public static set currentLevel(value: number) {
    this._currentLevel = value;
    GameStorage.instance.setItem(GameConstant.STORAGE_CURRENT_LEVEL, value);
  }

  private static _initCurrency() {
    this._currency = GameStorage.instance.getInt(GameConstant.STORAGE_CURRENCY, -1);
    if (this._currency === -1) {
      this._currency = 0;
      GameStorage.instance.setItem(GameConstant.STORAGE_CURRENCY, this._currency);
    }
  }

  public static get currency() {
    return this._currency;
  }

  public static set currency(value: number) {
    this._currency = value;
    this.emitter.emit(this.Event.CurrencyChanged, value);
    GameStorage.instance.setItem(GameConstant.STORAGE_CURRENCY, value);
  }

  private static _initSkinData() {
    this._skinUnlocked = GameStorage.instance.getObject(GameConstant.STORAGE_SKINS_UNLOCKED);
    let length = Object.values(this._skinUnlocked).length;
    if (length <= 0) {
      this._skinUnlocked = [GameConstant.USER_DATA_DEFAULT_SKIN];
      GameStorage.instance.setItem(GameConstant.STORAGE_SKINS_UNLOCKED, JSON.stringify(this._skinUnlocked));
    }
    this._currentSkin = GameStorage.instance.getItem(GameConstant.STORAGE_CURRENT_SKIN);
    if (!this._currentSkin) {
      this._currentSkin = GameConstant.USER_DATA_DEFAULT_SKIN;
      GameStorage.instance.setItem(GameConstant.STORAGE_CURRENT_SKIN, this._currentSkin);
    }
  }

  public static get currentSkin() {
    return this._currentSkin;
  }

  public static set currentSkin(value: string) {
    this._currentSkin = value;
    GameStorage.instance.setItem(GameConstant.STORAGE_CURRENT_SKIN, value);
  }

  public static get skinUnlocked() {
    return this._skinUnlocked;
  }

  public static isSkinUnlocked(skinName: string) {
    return this._skinUnlocked.includes(skinName);
  }

  public static unlockSkin(skinName: string) {
    this._skinUnlocked.push(skinName);
    this.saveSkinUnlocked();
  }

  public static saveSkinUnlocked() {
    GameStorage.instance.setItem(GameConstant.STORAGE_SKINS_UNLOCKED, JSON.stringify(this._skinUnlocked));
  }

  private static _initProgressRewardSkin() {
    this._progressRewardSkin = GameStorage.instance.getInt(GameConstant.STORAGE_PROGRESS_REWARD_SKIN, -1);
    if (this._progressRewardSkin === -1) {
      this._progressRewardSkin = 0;
      GameStorage.instance.setItem(GameConstant.STORAGE_PROGRESS_REWARD_SKIN, this._progressRewardSkin);
    }
  }

  public static get progressRewardSkin() {
    return this._progressRewardSkin;
  }

  public static set progressRewardSkin(value: number) {
    this._progressRewardSkin = value;
    GameStorage.instance.setItem(GameConstant.STORAGE_PROGRESS_REWARD_SKIN, value);
  }
}
