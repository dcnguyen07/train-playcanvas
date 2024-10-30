import CopyBuilder from "./copyBuilder.js";

export class CopyResourceBuilder extends CopyBuilder {
  constructor(assetName, options) {
    super(assetName, options, "assets/resources", "dist/assets/resources", "resources");
  }
}
