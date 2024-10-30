/* eslint-disable max-params */
/* eslint-disable max-len */
/* eslint-disable max-depth */

import fs from "fs-extra";
import Builder from "./builder.js";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const args = yargs(hideBin(process.argv)).argv;
const removeWasm = args.removeWasm;

export default class ScriptBuilder extends Builder {
  /**
   * Copy asset from inputpath to output path and file paths to data
   * @param {string} assetName "models", "materials", "fonts", "textures", ...
   * @param {string} inputAssetPath input path. e.g: "assets/textures" will have input path is "assets" and asset name is "textures"
   * @param {string} outputAssetPath output path. e.g: "dist/assets/textures" will have output path is "dist/assets" and asset name is "textures"
   * @param {"default" | "resources"} assetType
   */
  constructor(inputAssetPath = "assets", outputAssetPath = "dist/assets", assetType = "default") {
    super("scripts", inputAssetPath, outputAssetPath, assetType);
  }

  async process() {
    await super.process();
    if (!await fs.exists(this.outputPath)) {
      await fs.mkdir(this.outputPath, { recursive: true });
    }

    this.scriptAssetOutputPath = `${this.inputAssetPath}/${this.assetName}`;
    let files = await fs.readdir(this.inputPath);
    await Promise.all(files.map((file) => {
      let p = path.resolve(this.inputPath, file);
      let name = path.parse(file).name;
      return this.buildScript(name, p);
    }));
  }

  async buildScript(name, folderPath) {
    let isWasm = false;
    if (fs.statSync(folderPath).isDirectory()) {
      isWasm = (await fs.readdir(folderPath)).some((file) => path.extname(file) === ".wasm");
    }

    let data = this.data;
    if (isWasm) {
      const files = (await fs.readdir(folderPath)).filter((file) => {
        let filePath = path.resolve(folderPath, file);
        return fs.statSync(filePath).isFile() && (file.includes(name) || file.includes(name.toLowerCase()));
      });
      let scriptFolder = `${this.scriptAssetOutputPath}/${name}`;
      let realFolderPath = path.resolve(path.dirname(this.outputAssetPath), scriptFolder);
      if (!await fs.exists(realFolderPath)) {
        fs.mkdir(realFolderPath, { recursive: true });
      }
      data[name] = {};
      data[name].glueUrl = removeWasm ? "" : `${scriptFolder}/${files.find((file) => file.endsWith(".wasm.js"))}`;
      data[name].wasmUrl = removeWasm ? "" : `${scriptFolder}/${files.find((file) => file.endsWith(".wasm"))}`;
      data[name].fallbackUrl = `${scriptFolder}/${files.find((file) => file !== data[name].glue && file !== data[name].wasm)}`;
      if(removeWasm){
        await Promise.all([
          fs.copyFile(path.resolve(path.dirname(this.inputAssetPath), data[name].fallbackUrl), path.resolve(path.dirname(this.outputAssetPath), data[name].fallbackUrl)),
        ]);
      } else {
        await Promise.all([
          fs.copyFile(path.resolve(path.dirname(this.inputAssetPath), data[name].glueUrl), path.resolve(path.dirname(this.outputAssetPath), data[name].glueUrl)),
          fs.copyFile(path.resolve(path.dirname(this.inputAssetPath), data[name].wasmUrl), path.resolve(path.dirname(this.outputAssetPath), data[name].wasmUrl)),
          fs.copyFile(path.resolve(path.dirname(this.inputAssetPath), data[name].fallbackUrl), path.resolve(path.dirname(this.outputAssetPath), data[name].fallbackUrl)),
        ]);
      }
    }
    else {
      data[name] = `${this.scriptAssetOutputPath}/${path.basename(folderPath)}`;
      await fs.copy(folderPath, path.resolve(path.dirname(this.outputAssetPath), data[name]));
    }
  }
}

