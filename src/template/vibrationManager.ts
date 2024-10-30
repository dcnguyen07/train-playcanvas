import GameSetting from "../gameSetting";

export default class VibrationManager {

  /**
   * @param {number} duration - duration in second
   */
  static vibrate(duration = 0.1) {
    if (navigator.vibrate && GameSetting.get("vibration")) {
      navigator.vibrate(duration * 1000);
    }
  }
}
