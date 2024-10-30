/* eslint-disable no-shadow */
/* eslint-disable max-nested-callbacks */

import fs from "fs-extra";
import Builder from "./builder.js";
import path from "path";
import yauzl from "yauzl";

/**
 * extract the zip file to the input path, so that the derived class will process the files and copy the resource to the output path
 */
export default class ExtractBuilder extends Builder {
  static get EXTRACT_DIR_NAME() {
    return ".extract";
  }

  /**
   * @param {string} assetName "models", "materials", "fonts", "textures", ...
   * @param {string} inputAssetPath input path. e.g: "assets/textures" will have input path is "assets" and asset name is "textures"
   * @param {string} outputAssetPath output path. e.g: "dist/assets/textures" will have output path is "dist/assets" and asset name is "textures"
   * @param {"default" | "resources"} assetType
   * @param {string} distPath
  */
  constructor(assetName, inputAssetPath = "asset-zips", outputAssetPath = "assets", assetType = "default", distPath = "dist") {
    super(assetName, inputAssetPath, outputAssetPath, assetType, distPath);

    if (assetType === "default") {
      this.extractPath = path.join(ExtractBuilder.EXTRACT_DIR_NAME, assetName);
    }
    else {
      this.extractPath = path.join(ExtractBuilder.EXTRACT_DIR_NAME, assetType, assetName);
    }
  }

  async process() {
    await super.process();

    const files = await fs.readdir(this.inputPath);
    if (files.length === 0) {
      return;
    }

    await fs.mkdir(this.outputPath, { recursive: true });

    await Promise.all(files.map(async(file) => {
      if (path.parse(file).ext !== ".zip") {
        console.error(`File '${file}' is not a zip file.`);
        return;
      }

      const zipFilePath = path.join(this.inputPath, file);
      // extract the zip file to the input path, so that the derived class will process the files and copy the resource to the output path
      await this.extract(zipFilePath, this.extractPath);
    }));

    if (await fs.exists(this.extractPath)) {
      await this.onExtracted();
    }
  }

  async onExtracted() {
  }

  extract(zipFilePath, outputPath) {
    return new Promise((resolve, reject) => {
      yauzl.open(zipFilePath, { autoClose: true, lazyEntries: true }, (err, zipfile) => {
        if (err) {
          console.error(`Error opening zip file '${zipFilePath}': ${err}`);
          reject(err);
          return;
        }

        zipfile.on("entry", async(entry) => {
          if ((/\/$/).test(entry.fileName)) {
            // Directory entry, create the directory if it doesn't exist
            const dirPath = path.join(outputPath, entry.fileName);
            await fs.mkdir(dirPath, { recursive: true });
            zipfile.readEntry();
          }
          else {
            // File entry, extract and write the file
            zipfile.openReadStream(entry, async(err, readStream) => {
              if (err) {
                console.error(`Error reading file entry '${entry.fileName}': ${err}`);
                return;
              }
              const outputFilePath = path.join(outputPath, entry.fileName);
              const outputFolderPath = path.dirname(outputFilePath);
              if (!await fs.exists(outputFolderPath)) {
                await fs.mkdir(outputFolderPath, { recursive: true });
              }

              var chunks = [];
              readStream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
              readStream.on("error", (err) => console.error(`Error reading file entry '${entry.fileName}': ${err}`));
              readStream.on("end", async() => {
                const buffer = Buffer.concat(chunks);
                await fs.writeFile(outputFilePath, buffer);
                zipfile.readEntry();
              });
            });
          }
        });

        zipfile.on("end", () => {
          resolve();
        });

        zipfile.readEntry();
      });
    });
  }
}
