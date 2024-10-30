import fs from "fs-extra";
import path from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import CopyBuilder from "./builders/copyBuilder.js";
import ModelBuilder from "./builders/modelBuilder.js";
import RegisteringBuilder from "./builders/registeringBuilder.js";
import ScriptBuilder from "./builders/scriptBuilder.js";
import { CopyResourceBuilder } from "./builders/copyResourceBuilder.js";
import { texturePacker, TP_MODE } from "./texturePacker.js";


const args = yargs(hideBin(process.argv)).argv;
const OUTPUT_ASSET_PATH = "dist/assets";
const ASSET_DATA_FILE_PATH = path.resolve(OUTPUT_ASSET_PATH, "assetData.json");

const builders = [
  // default assets
  new CopyBuilder("animations"),
  new RegisteringBuilder("atlas", { ignoreFiles: ".json" }, "dist/assets", "assets"),
  new CopyBuilder("audios"),
  new CopyBuilder("cubemaps", { fileFilter: ".json" }),
  new CopyBuilder("fonts", { dataFileFilter: ".json" }),
  new CopyBuilder("jsons", { fileFilter: ".json", removeKeyExtension: false }),
  new CopyBuilder("materials", { fileFilter: ".json" }),
  new ModelBuilder(),
  new CopyBuilder("rawModels"),
  new ScriptBuilder(),
  new CopyBuilder("texts"),
  new CopyBuilder("textures"),

  // resource assets
  new CopyResourceBuilder("animations"),
  new CopyResourceBuilder("audios"),
  new CopyResourceBuilder("cubemaps", { fileFilter: ".json" }),
  new CopyResourceBuilder("fonts", { dataFileFilter: ".json" }),
  new CopyResourceBuilder("jsons", { fileFilter: ".json", removeKeyExtension: false }),
  new CopyResourceBuilder("materials", { fileFilter: ".json" }),
  new ModelBuilder("assets/resources", "dist/assets/resources", "resources"),
  new CopyResourceBuilder("rawModels"),
  new CopyResourceBuilder("texts"),
  new CopyResourceBuilder("textures"),
];

(async function() {
  if (args.clean && await fs.exists(OUTPUT_ASSET_PATH)) {
    await fs.rm(OUTPUT_ASSET_PATH, { recursive: true });
  }
  if (!await fs.exists(OUTPUT_ASSET_PATH)) {
    await fs.mkdir(OUTPUT_ASSET_PATH, { recursive: true });
  }

  let tpMode;
  if (args.freeTexturePacker) {
    tpMode = TP_MODE.FREE_TEXTURE_PACKER;
  }

  await texturePacker(tpMode);
  await Promise.all(builders.map((builder) => builder.build()));

  const assetData = {};
  builders.forEach((builder) => {
    let data = assetData;
    if (builder.assetType !== "default") {
      if (!assetData[builder.assetType]) {
        assetData[builder.assetType] = {};
      }
      data = assetData[builder.assetType];
    }
    data[builder.assetName] = builder.data;
  });

  await fs.writeFile(ASSET_DATA_FILE_PATH, JSON.stringify(assetData));
  console.log("Built data successfully to", ASSET_DATA_FILE_PATH);
})();
