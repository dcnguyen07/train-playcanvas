export class AnimationConfig {

  public name: string;
  public speed?: number = 1;
  public loop?: boolean = false;
  public blendTime?: number = 0;
  public keyEvents?: AnimationKeyEvent[];

  constructor() {
    this.name = "";
    this.speed = 1;
    this.loop = false;
    this.blendTime = 0;
    /** @type {Array<AnimationKeyEvent>} */
    this.keyEvents = [];
  }
}

export class AnimationKeyEvent {

  public key: number;
  public called?: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  public event: Function;

  // eslint-disable-next-line @typescript-eslint/ban-types
  constructor(key: number, event: Function, scope: any) {
    this.key = key;
    this.called = false;
    scope = scope || this;
    this.event = event.bind(scope);
  }
}
