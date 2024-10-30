/* eslint-disable max-params */
/* eslint-disable max-len */
/* eslint-disable max-depth */
import fs from "fs-extra";
import Builder from "./builder.js";
import path from "path";

export default class CopyBuilder extends Builder {
  /**
   * Copy asset from inputpath to output path and file paths to data
   * @param {string} assetName "models", "materials", "fonts", "textures", ...
   * @param {string, Array<string>} fileFilter only files with this extensions will be copied
   * @param {string, Array<string>} dataFileFilter only files with these extensions will be added to the data
   * @param {boolean} removeKeyExtension file extensions will be removed from the data keys
   * @param {string} inputAssetPath input path. e.g: "assets/textures" will have input path is "assets" and asset name is "textures"
   * @param {string} outputAssetPath output path. e.g: "dist/assets/textures" will have output path is "dist/assets" and asset name is "textures"
   * @param {"default" | "resources"} assetType
   */
  constructor(assetName, options = { fileFilter: "*", dataFileFilter: "*", removeKeyExtension: true }, inputAssetPath = "assets", outputAssetPath = "dist/assets", assetType = "default") {
    super(assetName, inputAssetPath, outputAssetPath, assetType);
    this.options = options;
    this.options.fileFilter = options.fileFilter || "*";
    this.options.dataFileFilter = options.dataFileFilter || "*";
    this.options.removeKeyExtension = options.removeKeyExtension === undefined ? true : options.removeKeyExtension;
  }

  async process() {
    await super.process();
    await this.copyFiles();
  }

  async copyFiles() {
    const files  = await fs.readdir(this.inputPath);
    const filter = this.options.fileFilter;
    await Promise.all(files.map((file) => {
      const extname = path.extname(file);
      if ((Array.isArray(filter) && filter.includes(extname)) || (filter === "*" || filter === extname)) {
        return this.copyFile(file);
      }
    }));
  }

  async copyFile(file) {
    const inputFilePath = path.resolve(this.inputPath, file);
    if (!await fs.exists(inputFilePath)) {
      return;
    }

    const outputFilePath = path.resolve(this.outputPath, file);
    const outputDir = path.dirname(outputFilePath);

    if (!await fs.exists(outputDir)) {
      await fs.mkdir(outputDir, { recursive: true });
    }

    await fs.copy(inputFilePath, outputFilePath, { overwrite: true });

    const extname = path.extname(file);
    const dataFileFilter = this.options.dataFileFilter;
    if ((Array.isArray(dataFileFilter) && dataFileFilter.includes(extname)) || (dataFileFilter === "*" || dataFileFilter === extname)) {
      const assetPath = path.join(this.inputAssetPath, this.assetName, file);
      this.addAssetData(assetPath, this.options.removeKeyExtension);
    }
  }
}
