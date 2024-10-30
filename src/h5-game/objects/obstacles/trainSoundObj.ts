import { ResourceEntity } from "../resourceEntity";

export class TrainSoundObj extends ResourceEntity {
  override async _initComponents() {
    await Promise.all([
      super._initComponents(),
    ]);
  }
}
