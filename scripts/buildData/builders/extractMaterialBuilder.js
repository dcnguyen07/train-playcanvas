/* eslint-disable max-depth */
import fs from "fs-extra";
import path from "path";
import { cleanPath } from "../util.js";
import ExtractBuilder from "./extractBuilder.js";

export default class ExtractMaterialBuilder extends ExtractBuilder {
  async onExtracted() {
    await super.onExtracted();

    var materialPaths = await this.getMaterialPathsFrom(this.extractPath);
    await Promise.all(materialPaths.map((materialPath) => this.updateMaterialMaps(materialPath)));
  }

  async isMaterial(filePath) {
    if (path.extname(filePath) !== ".json") {
      return false;
    }

    var data = await fs.readJSON(filePath);
    return data.ambient;
  }

  async updateMaterialMaps(materialPath) {
    if (!await fs.exists(materialPath)) {
      return;
    }

    const outputMaterialAssetPath = path.join(this.outputAssetPath, this.assetName);
    if (!await fs.exists(outputMaterialAssetPath)) {
      await fs.mkdir(outputMaterialAssetPath, { recursive: true });
    }

    const materialData = await fs.readJson(materialPath);
    await Promise.all(Object.keys(materialData).map(async(key) => {
      if (key === "cubeMap") {
        const cubeMapPath = path.resolve(path.dirname(materialPath), materialData[key]);
        const cubeMapAssetPath = await this.moveCubeMapAssets(cubeMapPath);
        materialData[key] = cubeMapAssetPath;
      }
      else if (key.endsWith("Map") && materialData[key]) {
        const materialFolder = path.dirname(materialPath);
        const texturePath = path.resolve(materialFolder, materialData[key]);
        const textureAssetPath = await this.copyTextureAsset(texturePath);
        if (textureAssetPath) {
          materialData[key] = textureAssetPath;
        }
        else {
          throw new Error(`Could not move texture asset '${materialData[key]}, ${materialPath}'`);
        }
      }
    }));

    var materialOutputPath = path.resolve(outputMaterialAssetPath, path.basename(materialPath));
    await fs.writeFile(materialOutputPath, JSON.stringify(materialData), { encoding: "utf8", flag: "w+" });
  }

  async moveCubeMapAssets(cubeMapPath) {
    if (!await fs.exists(cubeMapPath)) {
      return;
    }

    const cubeMapAssetFolderPath = `${this.outputAssetPath}/cubemaps`;
    const cubeMapName = path.basename(cubeMapPath);
    const cubeMapOutputPath = path.resolve(cubeMapAssetFolderPath, cubeMapName);

    // copy all textures
    const cubeMapData = JSON.parse(await fs.readFile(cubeMapPath, "utf8"));
    await Promise.all(cubeMapData.textures.map(async(texture, index) => {
      const texturePath = path.resolve(path.dirname(cubeMapPath), texture);
      const textureAssetPath = await this.copyTextureAsset(texturePath);
      if (textureAssetPath) {
        cubeMapData.textures[index] = textureAssetPath;
      }
      else {
        throw new Error(`Could not move texture asset '${texture}, ${cubeMapPath}'`);
      }
    }));

    // write new cubemap json
    const cubeMapOutputDir = path.dirname(cubeMapOutputPath);
    if (!await fs.exists(cubeMapOutputDir)) {
      await fs.mkdir(cubeMapOutputDir, { recursive: true });
    }
    await fs.writeFile(cubeMapOutputPath, JSON.stringify(cubeMapData));
    return `${cubeMapAssetFolderPath}/${cubeMapName}`;
  }

  async getMaterialPathsFrom(dirPath) {
    const materialPaths = [];
    if (!await fs.exists(dirPath)) {
      return materialPaths;
    }

    const files = await fs.readdir(dirPath, { recursive: true });
    for (const file of files) {
      var filePath = path.resolve(dirPath, file);
      if (await this.isMaterial(filePath)) {
        materialPaths.push(filePath);
      }
    }
    return materialPaths;
  }

  async copyTextureAsset(texturePath) {
    // move texture map file to textures folder
    const textureAssetFolderPath = `${this.outputAssetPath}/textures`;
    const textureMapName = path.basename(texturePath);
    const textureMapOutputPath = path.resolve(textureAssetFolderPath, textureMapName);
    const textureMapOutputDir = path.dirname(textureMapOutputPath);

    if (!await fs.exists(texturePath)) {
      return;
    }

    if (!await fs.exists(textureMapOutputDir)) {
      await fs.mkdir(textureMapOutputDir, { recursive: true });
    }

    // use synchronous copy to avoid error when copying the same file at the same time
    fs.copySync(texturePath, textureMapOutputPath, { overwrite: true });

    const textureAssetPath = cleanPath(path.relative(this.distPath, textureMapOutputPath)).replace("../", "");
    return textureAssetPath;
  }
}
