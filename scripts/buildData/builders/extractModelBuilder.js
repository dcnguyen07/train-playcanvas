import fs from "fs-extra";
import path from "path";
import ExtractBuilder from "./extractBuilder.js";
import ExtractMaterialBuilder from "./extractMaterialBuilder.js";

export default class ExtractModelBuilder extends ExtractBuilder {
  async onExtracted() {
    await super.onExtracted();

    const files = await fs.readdir(this.extractPath);
    await Promise.all(files.map(async(file) => {
      const extractedFilePath = path.resolve(this.extractPath, file);
      const outputFilePath = path.resolve(this.outputPath, file);
      const outputFileDir = path.dirname(outputFilePath);

      if (!await fs.exists(outputFileDir)) {
        await fs.mkdir(outputFileDir, { recursive: true });
      }

      if (path.extname(file) === ".glb") {
        // move glb file to output path
        await fs.copy(extractedFilePath, outputFilePath, { overwrite: true });
      }
      else if (file.endsWith(".mapping.json")) {
        // move all material assets to their folder
        const materialPaths = await this.getMaterialPathsFrom(extractedFilePath);
        const materialBuilder = new ExtractMaterialBuilder("materials", this.inputAssetPath, this.outputAssetPath, this.assetType, this.distPath);
        await Promise.all(materialPaths.map((materialPath) => materialBuilder.updateMaterialMaps(materialPath)));

        // change material mapping path
        const mappingData = await fs.readJson(extractedFilePath);
        mappingData.mapping.forEach((mapping) => {
          if (mapping.path) {
            const filename = path.basename(mapping.path);
            mapping.path = `${this.outputAssetPath}/materials/${filename}`;
          }
        });
        await fs.writeFile(outputFilePath, JSON.stringify(mappingData), { encoding: "utf-8" });
      }
    }));
  }

  async getMaterialPathsFrom(...mappingFilePath) {
    const materialPaths = [];
    await Promise.all(mappingFilePath.map(async(mappingPath) => {
      const mappingData = await fs.readJson(mappingPath);
      mappingData.mapping.forEach((mapping) => {
        if (!mapping.path) {
          return;
        }

        var materialPath = path.resolve(path.dirname(mappingPath), mapping.path);
        if (!materialPaths.includes(materialPath)) {
          materialPaths.push(materialPath);
        }
      });
    }));

    return materialPaths;
  }
}
