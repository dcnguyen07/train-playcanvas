/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable max-nested-callbacks */
/* eslint-disable max-depth */

// @ts-nocheck
import { AssetRegistry, path } from "playcanvas";
import { standardMaterialTextureParameters } from "./standard-material-parameters";

AssetRegistry.prototype._loadModel = function(modelAsset, continuation) {
  const url = modelAsset.getFileUrl();
  const ext = path.getExtension(url);

  if (ext === ".json" || ext === ".glb") {
    const dir = path.getDirectory(url);
    const basename = path.getBasename(url);

    // PlayCanvas model format supports material mapping file
    const mappingUrl = path.join(dir, basename.replace(ext, ".mapping.json"));
    this._loader.load(mappingUrl, "json", (err, data) => {
      if (!data) {
        data = { mapping: [] };
      }
      if (err) {
        modelAsset.data = { mapping: [] };
        continuation(modelAsset);
      }
      else {
        this._loadMaterials(modelAsset, data, (e, materials) => {
          modelAsset.data = data;
          modelAsset.once("load", () => {
            for (let i = 0; i < data.mapping.length; i++) {
              if (!data.mapping[i].path) {
                continue;
              }
              var matAsset = materials.find((mat) => mat.file.url === data.mapping[i].path);
              if (matAsset) {
                modelAsset.resource.meshInstances[i].material = matAsset.resource;
              }
            }
          });
          continuation(modelAsset);
        });
      }
    });
  }
  else {
    // other model format (e.g. obj)
    continuation(modelAsset);
  }
};

AssetRegistry.prototype._loadMaterials = function(modelAsset, mapping, callback) {
  const materials = [];
  let count = mapping.mapping.filter((m) => m.path).length;

  if (count === 0) {
    callback(null, materials);
    return;
  }

  const onMaterialLoaded = (err, materialAsset) => {
    this._loadTextures(materialAsset, (err, textures) => {
      materials.push(materialAsset);
      if (materials.length === count) {
        callback(err, materials);
      }
    });
  };
  for (let i = 0; i < mapping.mapping.length; i++) {
    const path = mapping.mapping[i].path;
    if (path) {
      const url = path;
      this.loadFromUrl(url, "material", onMaterialLoaded);
    }
  }
};

AssetRegistry.prototype._loadTextures = function(materialAsset, callback) {
  const data = materialAsset.data;
  const textures = [];
  const texParams = standardMaterialTextureParameters;
  let count = texParams.filter((p) => data[p] && typeof data[p] === "string").length;
  if (data.mappingFormat !== "path") {
    callback(null, textures);
    return;
  }
  const onTextureLoaded = (err, texture) => {
    textures.push(texture);
    if (textures.length === count) {
      callback(err, textures);
    }
  };
  for (let i = 0; i < texParams.length; i++) {
    const path = data[texParams[i]];
    if (path && typeof path === "string") {
      const url = path;
      this.loadFromUrl(url, "texture", (err, texture) => {
        onTextureLoaded(err, texture);
        materialAsset.resource[texParams[i]] = texture.resource;
      });
    }
  }
  if (count === 0) {
    callback(null, textures);
  }
};
