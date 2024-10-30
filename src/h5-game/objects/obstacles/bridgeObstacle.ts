import { Entity } from "playcanvas";
import { BridgeRotate } from "../../scripts/components/bridgeRotate";
import { ResourceEntity } from "../resourceEntity";

export class BridgeObstacle extends ResourceEntity {
  // eslint-disable-next-line default-param-last
  constructor(data: any, isCaching = false, parent?: Entity, options = {
    autoLoad: true,
  }) {
    super(data, isCaching, parent, options);
    if (this.loaded) {
      this.onLoaded();
    }
    else {
      this.once(ResourceEntity.Event.Loaded, this.onLoaded, this);
    }
  }

  onLoaded() {
    this.addScript(BridgeRotate, {
      attributes: {
        children    : this.children,
        angle       : 35,
        speed       : 10,
        delayStart  : 2,
        delayRevert : 1,
      },
    });
  }
}
