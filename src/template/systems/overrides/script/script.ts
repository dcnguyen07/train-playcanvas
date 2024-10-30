/* eslint-disable */
import { ScriptType, registerScript } from "playcanvas";
import * as pc from "playcanvas";
import { Game } from "../../../../game";

pc.Entity.prototype.addScript = function <T extends ScriptType>(script: new (args: any) => T, args: any = {}): T {
  if (!this.script) {
    this.addComponent("script");
  }

  if (!script) {
    throw new Error("Script must be defined");
  }

  let scriptInstance: T | ScriptType | null = null;

  // @ts-ignore
  let name = script.scriptName;
  if (!name) {
    throw new Error("Script must have a name, please override the static property 'scriptName'");
  }
  // @ts-ignore
  script.__name = name;
  if (!Game.app.scripts.has(name)) {
    let customAttributes: { [key: string]: any } = {}
      let temp = new script({
        app    : Game.app,
        entity : this,
      }) as any;
      let keys = Object.keys(temp).filter((key) => key !== "app" && key !== "entity" && !key.startsWith("_"));

      keys.forEach((key) => {
        customAttributes[key] = {
          type    : typeof temp[key],
          default : temp[key],
        };
      });

      // delete temp;
      temp = undefined;


    Object.keys(customAttributes).forEach((key) => {
      // @ts-ignore
      script.attributes.add(key, customAttributes[key]);
    });
    // @ts-ignore
    registerScript(script);
  }

  if (!args.attributes) {
    args.attributes = {};
  }
  scriptInstance = this.script?.create(name, args);

  if (!scriptInstance) {
    throw new Error("Script instance could not be created");
  }

  if (scriptInstance.onEnable) {
    scriptInstance.on("enable", scriptInstance.onEnable, scriptInstance);
  }

  if (scriptInstance.onDisable) {
    scriptInstance.on("disable", scriptInstance.onDisable, scriptInstance);
  }

  if (scriptInstance.onDestroy) {
    scriptInstance.once("destroy", scriptInstance.onDestroy, scriptInstance);
  }

  if (!scriptInstance.enable) {
    scriptInstance.enable = () => scriptInstance.enabled = true;
  }

  if (!scriptInstance.disable) {
    scriptInstance.disable = () => scriptInstance.enabled = false;
  }

  return scriptInstance as T;
};

/**
 * @param {typeof pc.ScriptType | string} type
 * @returns {pc.ScriptType | null}
 */
pc.Entity.prototype.getScript = function <T extends ScriptType>(type: (new (args: any) => T)): T | null {

  if (!this.script) {
    return null;
  }

  // @ts-ignore
  let name = type.scriptName;
  if (!name) {
    throw new Error("Script must have a name, please override the static property 'scriptName'");
  }
  // @ts-ignore
  return this.script[name];
};

let oldAdd = pc.ScriptAttributes.prototype.add;
pc.ScriptAttributes.prototype.add = function(name: string, options: any): void {
  if (!options) {
    options = {
      type : "string",
    };
  }
  if (!options.type) {
    options.type = "string";
  }
  if (!options.default) {
    options.default = "";
  }
  oldAdd.call(this, name, options);
};
