import fs from "fs-extra";
import CopyBuilder from "./copyBuilder.js";
import path from "path";

export default class ModelBuilder extends CopyBuilder {
  constructor(inputAssetPath, outputAssetPath, assetType, distPath) {
    super("models", { fileFilter: [".glb", ".json"], dataFileFilter: ".glb" }, inputAssetPath, outputAssetPath, assetType, distPath);
  }

  async process() {
    await super.process();
    await this.addMissingGLBMappingFiles();
  }

  async addMissingGLBMappingFiles() {
    if (!await fs.exists(this.outputPath)) {
      return;
    }

    const defaultMappingData = {
      mapping : [],
      area    : 0,
    };

    const files = await fs.readdir(this.outputPath);
    await Promise.all(files.map((file) => {
      if (file.endsWith(".glb")) {
        const mappingFile = file.replace(".glb", ".mapping.json");
        if (!files.find((f) => f === mappingFile)) { // missing mapping file for glb
          return fs.writeFile(path.resolve(this.outputPath, mappingFile), JSON.stringify(defaultMappingData));
        }
      }
    }));
  }
}
