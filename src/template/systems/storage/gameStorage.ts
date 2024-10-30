/* eslint-disable no-param-reassign */
import { EventHandler } from "playcanvas";
import { GameConstant } from "../../../gameConstant";

export enum GameStorageEvent {
  ValueChanged = "GameStorage:ValueChanged",
}

export class GameStorage extends EventHandler {
  static instance = new GameStorage();
  gameCode: string;

  constructor() {
    super();
    this.gameCode = GameConstant.GAME_CODE;
    if (GameConstant.STORAGE_CLEAR_ON_START) {
      this.clear();
    }
  }

  clear() {
    localStorage.clear();
  }

  getItem(key: string) {
    key = this.getStorageKey(key);
    return localStorage.getItem(key);
  }

  setItem(key: string, value: any) {
    key = this.getStorageKey(key);
    localStorage.setItem(key, value);
    this.fire(GameStorageEvent.ValueChanged, key);
  }

  addInt(key: string, amount: number) {
    const value = this.getInt(key);
    this.setItem(key, value + amount);
    return value + amount;
  }

  addFloat(key: string, amount: number) {
    const value = this.getFloat(key);
    this.setItem(key, value + amount);
  }

  getInt(key: string, defaultValue = 0) {
    const sValue = this.getItem(key);
    if (!sValue) {
      return defaultValue;
    }
    let value = parseInt(sValue);
    if (!value) {
      value = defaultValue;
    }
    return value;
  }

  getFloat(key: string) {
    const sValue = this.getItem(key);
    if (!sValue) {
      return 0;
    }
    let value = parseFloat(sValue);
    if (!value) {
      value = 0;
    }
    return value;
  }

  getObject<T>(key: string, defaultValue?: T): T {
    const value = this.getItem(key);
    if (!value) {
      if (defaultValue) {
        return defaultValue;
      }
      return {} as T;
    }
    return JSON.parse(value) as T;
  }

  getString(key: string, defaultValue = "") {
    let value = this.getItem(key);
    if (!value) {
      value = defaultValue;
    }
    return value;
  }

  getBoolean(key: string, defaultValue = false) {
    let value = this.getItem(key);
    if (!value) {
      return defaultValue;
    }
    return value === "true";
  }

  getStorageKey(key: string) {
    return `${GameConstant.GAME_CODE}_${key}`;
  }
}
