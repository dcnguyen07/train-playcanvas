import EventEmitter from "events";

export class GameStateManager {
  private static _state: string;
  public static emitter: EventEmitter;
  public static prevState: string;

  static init(state: string): void {
    this.emitter = new EventEmitter();
    this.state = state;
  }

  static get state(): string {
    return this._state;
  }

  static set state(state: string) {
    if (this._state !== state) {
      this.prevState = this.state;
      this._state = state;
      if (this.emitter) {
        this.emitter.emit("changed", this.state, this.prevState);
      }
    }
  }

  static isState(...state: string[]): boolean {
    for (let i = 0; i < state.length; i++) {
      if (state[i] === this.state) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {(state: string, prevState: string) => void} callback
   */
  static registerOnStateChangedCallback(callback: (state: string, prevState: string) => void): void {
    this.emitter.on("changed", callback);
  }

  /**
   * @param {(state: string, prevState: string) => void} callback
   */
  static removeOnStateChangedCallback(callback: (state: string, prevState: string) => void): void {
    this.emitter.off("changed", callback);
  }
}

export enum GameState {
  MainMenu = "mainmenu",
  Playing = "playing",
  Paused = "paused",
  Lose = "lose",
  Win = "win",
  GameOver = "gameover",
  Tutorial = "tutorial",
  AutoPlay = "autoplay",
  AutoPlayOver = "autoplayover",
}
