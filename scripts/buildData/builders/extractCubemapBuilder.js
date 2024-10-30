/* eslint-disable max-depth */
import fs from "fs-extra";
import path from "path";
import { cleanPath } from "../util.js";
import ExtractBuilder from "./extractBuilder.js";

export default class ExtractCubeMapBuilder extends ExtractBuilder {
  async onExtracted() {
    await super.onExtracted();

    await Promise.all((await fs.readdir(this.extractPath, { recursive: true })).map(async(file) => {
      if (path.parse(file).ext !== ".json") {
        return;
      }

      // replace textures paths
      const cubeMapPath = path.resolve(this.extractPath, file);
      const cubeMapData = await fs.readJson(cubeMapPath);
      const cubeMapDir = path.dirname(cubeMapPath);

      await Promise.all(cubeMapData.textures.map(async(texture, index) => {
        const texturePath = path.resolve(cubeMapDir, texture);
        const newPath = await this.copyTextureAsset(texturePath);
        if (newPath) {
          const relativePath = cleanPath(path.relative(this.distPath, newPath)).replace("../", "");
          cubeMapData.textures[index] = relativePath;
        }
        else {
          throw new Error(`Could not move texture asset '${texture}, ${cubeMapPath}'`);
        }
      }));

      const cubeMapOutputPath = path.resolve(this.outputPath, path.basename(cubeMapPath));
      const cubeMapOutputDir = path.dirname(cubeMapOutputPath);

      if (!await fs.exists(cubeMapOutputDir)) {
        await fs.mkdir(cubeMapOutputDir, { recursive: true });
      }
      await fs.writeFile(cubeMapOutputPath, JSON.stringify(cubeMapData));
    }));
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

    return textureMapOutputPath;
  }
}
