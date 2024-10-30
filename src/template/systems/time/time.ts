
export class Time {
  private static _current: number;
  private static _dt: number;
  private static _unscaledTime: number;
  private static _unscaledDeltaTime: number;
  public static scale: number;
  public static gamePlayScale: number;

  static init() {
    this._current = 0;
    this._dt = 0;
    this._unscaledTime = 0;
    this._unscaledDeltaTime = 0;
    this.gamePlayScale = 1;
    this.scale = 1;
  }

  static update(dt: number) {
    this._dt = dt * this.scale * this.gamePlayScale;
    this._current += this._dt;
    this._unscaledDeltaTime = dt;
    this._unscaledTime += dt;
  }

  static get dt() {
    return this._dt;
  }

  /**
   * @summary Current time in seconds
   */
  static get current() {
    return this._current;
  }

  /**
   * @summary Current time in miliseconds
   */
  static get currentMS() {
    return this._current * 1000;
  }

  static get unscaledTime() {
    return this._unscaledTime;
  }

  static get unscaledDeltaTime() {
    return this._unscaledDeltaTime;
  }
}
