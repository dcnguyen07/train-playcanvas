/* eslint-disable max-params */
/* eslint-disable max-len */
/* eslint-disable max-depth */
import fs from "fs-extra";
import Builder from "./builder.js";
import path from "path";

export default class RegisteringBuilder extends Builder {
  /**
   * Add files to data
   * @param {string} assetName "models", "materials", "fonts", "textures", ...
   * @param {object} options
   * @param {string | Array<string>} options.fileFilter only files with these extensions will be added to the data
   * @param {string | Array<string>} options.ignoreFiles files with these extensions will be ignored
   * @param {boolean} options.removeKeyExtension file extensions will be removed from the data keys
   * @param {string} inputAssetPath input path. e.g: "assets/textures" will have input path is "assets" and asset name is "textures"
   * @param {"default" | "resources"} assetType
   */
  constructor(assetName, options = {
    fileFilter         : "*",
    ignoreFiles        : [],
    removeKeyExtension : true
  }, inputAssetPath = "assets", registerAssetPath = "assets", assetType = "default") {
    super(assetName, inputAssetPath, undefined, assetType);
    this.registerAssetPath = registerAssetPath;
    this.options = options;
    this.options.fileFilter = options.fileFilter || "*";
    this.options.removeKeyExtension = options.removeKeyExtension === undefined ? true : options.removeKeyExtension;
  }

  async process() {
    await super.process();
    await this._registerFiles();
  }

  async _registerFiles() {
    const files = await fs.readdir(this.inputPath);
    files.map((file) => {
      const extname = path.extname(file);
      const fileFilter = this.options.fileFilter;
      const ignoreFiles = this.options.ignoreFiles;
      let isIgnored = (Array.isArray(ignoreFiles) && ignoreFiles.includes(extname))
        || (ignoreFiles === "*" || ignoreFiles === extname);
      let isFiltered = (Array.isArray(fileFilter) && fileFilter.includes(extname))
        || (fileFilter === "*" || fileFilter === extname);

      if (isFiltered && !isIgnored) {
        const assetPath = path.join(this.registerAssetPath, this.assetName, file);
        this.addAssetData(assetPath, this.options.removeKeyExtension);
      }
    });
  }
}

