import EventEmitter from "events";
import data from "../../../assets/jsons/languageData.json";
import { Game } from "../../game";
import { GameConstant } from "../../gameConstant";
import { AssetManager } from "../../template/assetManager";
import { GameStorage } from "../../template/systems/storage/gameStorage";

export class LanguageData {
  static currentLanguageCode: string;
  static app: any;
  static defaultLanguageCode = "en";
  static eventEmitter = new EventEmitter();
  static readonly Event = {
    LANGUAGE_CHANGED: "languageChanged",
  };
  static DEFAULT_LOCALE_FALLBACKS = {
    en : "en-US",
    es : "en-ES",
    zh : "zh-CN",
    fr : "fr-FR",
    de : "de-DE",
    it : "it-IT",
    ru : "ru-RU",
    ja : "ja-JP",
  };

  static init(app: any) {
    this.app = app;
    let currentLanguage = this.findCurrentLanguage();
    this.currentLanguageCode = GameStorage.instance.getString(GameConstant.STORAGE_KEY_LANGUAGE, currentLanguage);
    this.setLanguage({ code: this.currentLanguageCode });
  }

  static async setLanguage(language: any) {
    this.currentLanguageCode = language.code;
    this.changeFontWithLanguage();
    GameStorage.instance.setItem(GameConstant.STORAGE_KEY_LANGUAGE, language.code);
  }

  static getLanguageByName(name: string): any {
    return data.find((item) => item.name === name);
  }

  static getLanguageByCode(code: string): any {
    return data.find((item) => item.code === code);
  }

  static getLanguageCodeByName(name: string): string {
    return this.getLanguageByName(name).code;
  }

  static getFlagByCode(code: string): string {
    return this.getLanguageByCode(code).flag;
  }

  static getAllLanguage(): any[] {
    let languages = [];
    for (let i = 0; i < data.length; i++) {
      languages.push(data[i]);
    }
    return languages;
  }

  static getLanguageByIndex(index: number): any {
    if (index < 0 || index >= data.length) {
      return null;
    }
    return data[index];
  }

  static getTextByKey(key: string): string {
    return Game.app.i18n.getText(key, this.currentLanguageCode);
  }

  static async changeFontWithLanguage() {
    let defaultFont = AssetManager.find(GameConstant.GAME_FONT_NOTOSANS_BLACK);
    if (!defaultFont) {
      await AssetManager.loadResource(GameConstant.GAME_FONT_NOTOSANS_BLACK, "font");
    }
    let notoSansFont = AssetManager.find(GameConstant.GAME_FONT_NOTOSANS_BLACK);
    let currentLanguageData = this.getLanguageByCode(this.currentLanguageCode);
    if (!currentLanguageData.font) {
      this.eventEmitter.emit(LanguageData.Event.LANGUAGE_CHANGED);
      Game.app.i18n.locale = currentLanguageData.code;
      return;
    }
    if (AssetManager.find(currentLanguageData.font)) {
      Game.app.i18n.locale = currentLanguageData.code;
      this.eventEmitter.emit(LanguageData.Event.LANGUAGE_CHANGED);
      return;
    }
    if (AssetManager.hasResource(currentLanguageData.font, "font")) {
      await AssetManager.loadResource(currentLanguageData.font, "font").then((assets: any) => {
        let languageCode = currentLanguageData.code;
        notoSansFont._i18n = {
          ...notoSansFont._i18n,
          [languageCode]: assets._id,
        };
        Game.app.i18n.locale = languageCode;
        this.eventEmitter.emit(LanguageData.Event.LANGUAGE_CHANGED);
      });
    }
  }

  static findCurrentLanguage(): string {
    let locale = this.app.i18n.locale;
    if (navigator.language) {
      locale = navigator.language;
    }
    let isLanguageAvailable = data.find((item) => item.code === locale);
    if (isLanguageAvailable) {
      return locale;
    }
    let languageFallback = this.findFallbackLanguageByLocale(locale);
    if (languageFallback === null) {
      return this.defaultLanguageCode;
    }
    return languageFallback;
  }

  static findFallbackLanguageByLocale(locale: string): string {
    for (let key in this.DEFAULT_LOCALE_FALLBACKS) {
      // @ts-ignoreP>
      if (this.DEFAULT_LOCALE_FALLBACKS[key] === locale) {
        return key;
      }
    }

    return null;
  }
}
