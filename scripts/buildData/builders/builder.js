import path from "path";
import fs from "fs-extra";
import { cleanPath } from "../util.js";

export default class Builder {
  /**
   * @param {string} assetName "models", "materials", "fonts", "textures", ...
   * @param {string} inputAssetPath input path. e.g: "assets/textures" will have input path is "assets" and asset name is "textures"
   * @param {string} outputAssetPath output path. e.g: "dist/assets/textures" will have output path is "dist/assets" and asset name is "textures"
   * @param {"default" | "resources"} assetType
   * @param {string} distPath
  */
  constructor(assetName, inputAssetPath = "assets", outputAssetPath = "dist/assets", assetType = "default", distPath = "dist") {
    this.assetName = assetName;
    this.inputAssetPath = inputAssetPath;
    this.outputAssetPath = outputAssetPath;
    this.assetType = assetType;
    this.distPath = distPath;
    this.inputPath = path.resolve(this.inputAssetPath, assetName);
    this.outputPath = path.resolve(this.outputAssetPath, assetName);
    this.data = {};
  }

  async build() {
    if (!await fs.exists(this.inputPath)) {
      console.error(`Input path ${this.inputPath} does not exist.`);
      return;
    }

    await this.preProcess();
    await this.process();
    await this.postProcess();
    return this;
  }

  async preProcess() {
  }

  async process() {
  }

  async postProcess() {
  }

  addAssetData(assetPath, removeKeyExtension = true) {
    const fileName = path.basename(assetPath);
    var key = "";
    if (removeKeyExtension) {
      key = path.parse(assetPath).name;
    }
    else {
      key = fileName;
    }

    const forbiddenCharacters = [
      " ", "#", // Runtime
      "\\", "/", ":", "*", "?", "\"", "<", ">", "|", "+", "[", "]", // Windows
      ":", "/", "\0", "\x7F", // MacOS
      "/", "\0" // Linux
    ];
    if (forbiddenCharacters.some((char) => fileName.includes(char))) {
      throw new Error(`Invalid character in file name: ${fileName}`);
    }

    this.data[key] = cleanPath(assetPath);
  }
}
