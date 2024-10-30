import data from "../../../assets/jsons/shopData.json";

export class ShopData {
  static app: any;

  static init(app: any) {
    this.app = app;
  }

  static getData() {
    return data;
  }

  static getShopItemByName(name: string) {
    return data.find((item: any) => item.name === name);
  }

  static getAllItemNames() {
    return data.map((item: any) => item.name);
  }

  static getIconSkinByName(name: string) {
    return data.find((item: any) => item.name === name).iconSprite;
  }
}
