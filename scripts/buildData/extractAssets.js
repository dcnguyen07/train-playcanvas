import fs from "fs-extra";
import ExtractCubeMapBuilder from "./builders/extractCubemapBuilder.js";
import ExtractMaterialBuilder from "./builders/extractMaterialBuilder.js";
import ExtractModelBuilder from "./builders/extractModelBuilder.js";
import ExtractBuilder from "./builders/extractBuilder.js";

const builders = [
  // default assets
  new ExtractModelBuilder("models"),
  new ExtractMaterialBuilder("materials"),
  new ExtractCubeMapBuilder("cubemaps"),

  // resource assets
  new ExtractModelBuilder("models", "asset-zips/resources", "assets/resources", "resources"),
  new ExtractMaterialBuilder("materials", "asset-zips/resources", "assets/resources", "resources"),
  new ExtractCubeMapBuilder("cubemaps", "asset-zips/resources", "assets/resources", "resources"),
];

(async function() {
  await fs.rm(ExtractBuilder.EXTRACT_DIR_NAME, { recursive: true, force: true }).catch((error) => {
    console.log("Could not remove .extract dir", error);
  });

  await Promise.all(builders.map((builder) => builder.build()));

  console.log("Extract assets successfully!");
  console.log("==================================");
})();
