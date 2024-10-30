declare module "playcanvas" {
  export class Entity {
    addScript<T extends ScriptType>(scriptType: new(args: any) => T, args?: any): T;

    getScript<T extends ScriptType>(scriptType: new(args: any) => T): T | null;
  }

  export class ScriptAttributes {
    constructor(script: typeof ScriptType);
    add(name: string, options?: any): void;
  }

  export class ScriptType {
    enable(): void;

    disable(): void;

    onEnable(): void;

    onDisable(): void;

    onDestroy(): void;
  }

  export class Vec2 {
    scale(scalar: number): Vec2;
  }

  export class Vec3 {
    scale(scalar: number): Vec3;
  }

  export class Vec4 {
    scale(scalar: number): Vec4;
  }

  export class ElementComponent {
    localizeParams?: {[key:string]: number|string};
    isUpperCase?: boolean;
  }
}

export {};

