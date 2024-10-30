import { Howl, Howler } from "howler";
import { Entity } from "playcanvas";
import GameSetting from "../gameSetting";

export class SoundManager {
  private static audios: { [key: string]: Howl };
  private static songs: { [key: string]: Howl };
  public static loaded: boolean;
  private static suspendedMusics: { name: string, volume: number, loop: boolean }[];

  public static resumeAudioContext() {
    if (Howler.ctx.state !== "running") {
      Howler.ctx.resume();
    }
  }

  public static async load(data: { [key: string]: string }) {
    this.audios = {};
    this.songs = {};

    let promises: Promise<void>[] = [];
    for (const key in data) {
      promises.push(this.loadAudio(key, data[key]));
    }
    await Promise.all(promises);
  }

  public static loadAudio(name: string, source: string): Promise<void> {
    return new Promise((resolve) => {
      this.audios[name] = new Howl({
        src         : source,
        onloaderror : (id, err) => console.error("SoundManager", "Load error", id, err),
        onplayerror : (id, err) => console.error("SoundManager", "Play error", id, err),
        onload      : () => resolve(),
      });
    });
  }

  public static play(name: string, volume: number = 1, loop: boolean = false): number {
    if (Howler.ctx.state !== "running") {
      Howler.ctx.resume();
    }

    const audio = this.audios[name];
    const audioId = audio.play();
    audio.volume(volume);
    audio.loop(loop);
    if (GameSetting.get("sound") === false) {
      this.muteSound(name, true);
    }
    return audioId;
  }

  public static playSoundByDistance(name: string, loop: boolean = false, listener: Entity, object: Entity) {
    if (Howler.ctx.state !== "running") {
      Howler.ctx.resume();
    }
    const audio = this.audios[name];
    const audioId = audio.play();
    let distance = listener.getLocalPosition().distance(object.getPosition());
    let volume = 1 - distance / 10;
    audio.volume(volume);
    audio.loop(loop);
    return audioId;
  }

  public static setVolume(name: string, volume: number) {
    this.audios[name].volume(volume);
  }

  public static playMusic(name: string, volume: number = 1, loop: boolean = true): number {
    if (Howler.ctx.state !== "running") {
      if (!this.suspendedMusics) {
        this.suspendedMusics = [];
      }
      if (this.suspendedMusics.find((audio) => audio.name === name)) {
        return -1;
      }
      this.suspendedMusics.push({
        name,
        volume,
        loop,
      });
      return -1;
    }
    const audio = this.audios[name];
    const audioId = audio.play();
    audio.volume(volume);
    audio.loop(loop);
    this.songs[name] = audio;
    if (GameSetting.get("music") === false) {
      audio.mute(true);
    }
    return audioId;
  }

  public static isPlaying(name: string): boolean {
    return this.audios[name].playing();
  }

  public static stop(name: string, id: number): void {
    this.audios[name].stop(id);
  }

  public static muteAll(mute: boolean): void {
    Howler.mute(mute);
  }

  public static muteAllSound(mute: boolean): void {
    for (const key in this.audios) {
      if (!this.songs[key]) {
        this.muteSound(key, mute);
      }
    }
  }

  public static muteSound(name: string, mute: boolean): void {
    this.audios[name]?.mute(mute);
  }

  public static muteAllMusic(mute: boolean): void {
    for (const key in this.songs) {
      this.muteMusic(key, mute);
    }
  }

  public static muteMusic(name: string, mute: boolean): void {
    console.log("mute all music", name, mute);
    this.audios[name].mute(mute);
  }

  static find(name: string) {
    return this.audios[name];
  }
}
