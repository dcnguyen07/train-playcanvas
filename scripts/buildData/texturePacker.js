/* eslint-disable default-case */
import { hashElement } from "folder-hash";
import { packAsync } from "free-tex-packer-core";
import fs from "fs-extra";
import path from "path";
import util from "util";
import { exec as exec0 } from "child_process";
import commandExists from "command-exists";
import { URL } from "url";
import { checkFolderHash } from "./util.js";

const __dirname = new URL(".", import.meta.url).pathname;

const exec = util.promisify(exec0);
const inputDir = path.resolve("./assets/atlas");
const outputDir = path.resolve("./dist/assets/atlas");
const cacheDir = path.resolve("./.cache");

const options = {
  textureName         : "atlas",
  removeFileExtension : true,
  prependFolderName   : false,
  width               : 4096,
  height              : 4096,
  powerOfTwo          : true,
  padding             : 4,
  allowRotation       : false,
  allowTrim           : true,
  exporter            : "Pixi",
  packer              : "OptimalPacker",
  detectIdentical     : true,
  suffix              : "-",
  suffixInitialValue  : 0,
  appInfo             : {
    url     : "purusgames.com",
    version : "1.0",
  },
};

const TP_MODE = Object.freeze({
  TEXTURE_PACKER      : "TEXTURE_PACKER",
  FREE_TEXTURE_PACKER : "FREE_TEXTURE_PACKER",
});

async function prepareImages() {
  const files = await fs.readdir(inputDir);
  const images = [];
  await Promise.all(
    files.map(async(file) => {
      if (file.endsWith(".png") || file.endsWith(".jpg")) {
        let p = path.join(inputDir, file);
        let image = await fs.readFile(p);
        images.push({
          path     : file,
          contents : image,
        });
      }
    }),
  );
  return images;
}

async function texturePacker(mode) {
  if (!await fs.exists(inputDir)) {
    console.log(`${inputDir} not found`);
    return;
  }

  if (!await fs.exists(outputDir)) {
    await fs.mkdir(outputDir);
  }

  let hasChanged = true;
  let dirName = path.basename(inputDir);
  let cachePath = path.join(cacheDir, dirName);
  if (await fs.exists(cacheDir) && await fs.exists(cachePath)) {
    let jsonText = await fs.readFile(cachePath, "utf8");
    let hashData = JSON.parse(jsonText);
    hasChanged = !(await checkFolderHash(inputDir, hashData.inputAssetHash)) || !(await checkFolderHash(outputDir, hashData.outputAssetHash));
  }

  if (!hasChanged) {
    console.log(`No changes in ${inputDir}, skip packing!`);
    return;
  }

  if (await fs.exists(outputDir)) {
    await fs.rm(outputDir, { recursive: true });
  }
  await fs.mkdir(outputDir);

  let tpMode = TP_MODE.TEXTURE_PACKER;
  if (mode) {
    tpMode = mode;
  }
  else if (commandExists.sync("texturepacker")) {
    tpMode = TP_MODE.TEXTURE_PACKER;
  }

  switch (tpMode) {
  case TP_MODE.TEXTURE_PACKER:
    await buildTexturePackerTextures();
    break;
  case TP_MODE.FREE_TEXTURE_PACKER:
    await buildFreeTextures();
    break;
  }

  console.log("HERE 1")
  if (!await fs.exists(cacheDir)) {
    await fs.mkdir(cacheDir);
  }
  let hash = {
    inputAssetHash  : (await hashElement(inputDir)).hash,
    outputAssetHash : (await hashElement(outputDir)).hash,
  };
  await fs.writeFile(cachePath, JSON.stringify(hash));
}

async function buildTexturePackerTextures() {
  let outputSheetName = path.join(outputDir, `${options.textureName}-{n}.png`);
  let outputDataName = path.join(outputDir, `${options.textureName}-{n}.json`);
  let configFilePath = path.resolve(__dirname, "./texturepacker.tps");
  let isExistConfigFile = await fs.exists(configFilePath);
  let command = `texturepacker ${isExistConfigFile ? configFilePath : ""}\
  --multipack\
  --max-width ${options.width}\
  --max-height ${options.height}\
  --disable-rotation\
  --format pixijs4\
  --trim-mode None\
  --trim-sprite-names\
  --shape-padding ${options.padding}\
  --size-constraints POT\
  --texture-format png\
  --sheet ${outputSheetName}\
  --data ${outputDataName}\
  ${inputDir}`;

  console.log("Pack textures with TEXTURE_PACKER");
  let startTime = Date.now();
  const { stderr } = await exec(command);
  if (stderr) {
    console.log(stderr);
    return Promise.reject(stderr);
  }
  console.log(`Pack ${inputDir} to ${outputDir} in ${Date.now() - startTime}ms`);
}

async function buildFreeTextures() {
  console.log("Pack textures with FREE_TEXTURE_PACKER");
  let startTime = Date.now();
  const images = await prepareImages();
  if (images.length === 0) {
    console.log("[Texture Packer Free] No images to pack");
    return;
  }
  const results = await packAsync(images, options);
  await Promise.all(
    results.map(async(result) => {
      const name = result.name;
      const contents = result.buffer;
      await fs.writeFile(path.join(outputDir, name), contents);
    }),
  );
  console.log(`Packed ${images.length} images to ${results.length} atlases in ${Date.now() - startTime}ms`);
}

export { TP_MODE, texturePacker };
