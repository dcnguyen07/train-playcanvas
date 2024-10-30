import {
  Color,
  ELEMENTTYPE_GROUP,
  ELEMENTTYPE_IMAGE,
  Entity,
  ORIENTATION_HORIZONTAL,
  SCROLLBAR_VISIBILITY_SHOW_WHEN_REQUIRED,
  SCROLL_MODE_BOUNCE,
  Vec2,
  Vec4,
} from "playcanvas";
import { Game } from "../../../game";
import { GameConstant } from "../../../gameConstant";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { SoundManager } from "../../../template/soundManager";
import { UserData } from "../../data/userData";
import { ShopViewItem } from "./shopViewItem";

export class ShopView extends Entity {
  static readonly CLICK_ITEM = "shopView:clickItem";
  shopViewContainer: Entity;
  viewport: Entity;
  content: Entity;
  background: Entity;
  scrollbarPanel: Entity;
  items: any[];

  constructor(data: any) {
    super();
    this.items = [];

    this._createScrollView();
    this._createItemList(data);
  }

  public onResize() {
    this._onResizeLevelList();
  }

  public onActivated() {
    this.items.forEach((element) => {
      element.updateState();
      if (element._data.name === UserData.currentSkin) {
        element.active();
      }
      else {
        element.deactive();
      }
    });
    // this.updateItemsState();
  }

  private async _createItemList(data: any) {
    data.forEach((item) => {
      const shopViewItem = new ShopViewItem(item);
      this.content.addChild(shopViewItem);
      this.items.push(shopViewItem);

      if (item.name === UserData.currentSkin) {
        shopViewItem.active();
      }
      shopViewItem.element!.on("click", () => {
        SoundManager.play("sfx_button");
        this.fire(ShopView.CLICK_ITEM, shopViewItem);
        this.items.forEach((element) => {
          element.deactive();
        });
        shopViewItem.active();
      });
    });

    this._reCalculateLayout();
  }

  private _onResizeLevelList() {
    let col = 3;
    let containerHeight = 720;
    let containerPosY = -130;
    let containerScale = 0.85;

    if (Game.isPortrait) {
      containerHeight = 900;
      containerScale = 1;
      containerPosY = -180;
    }
    else {
      containerHeight = 625;
      containerScale = 0.8;
      containerPosY = -175;
    }
    this._itemColumn = col;
    this.shopViewContainer.element.height = containerHeight;
    this.shopViewContainer.setLocalPosition(0, containerPosY, 0);
    this.shopViewContainer.setLocalScale(containerScale, containerScale, containerScale);

    this._reCalculateLayout();
  }

  _createScrollView() {
    this.addComponent("element", {
      type   : ELEMENTTYPE_GROUP,
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot  : new Vec2(0.5, 0.5),
      width  : 1260,
      height : 600,
    });

    this.shopViewContainer = ObjectFactory.createGroupElement({
      type   : ELEMENTTYPE_GROUP,
      anchor : new Vec4(0.5, 0.5, 0.5, 0.5),
      width  : 1260,
      height : 600,
    });
    this.addChild(this.shopViewContainer);

    this._createViewPort();

    // Add the image element to the level container
    this.shopViewContainer.addComponent("scrollview", {
      scrollMode                  : SCROLL_MODE_BOUNCE,
      bounceAmount                : 0.1,
      friction                    : 0.05,
      useMouseWheel               : true,
      mouseWheelSensitivity       : new Vec2(1, 1),
      viewportEntity              : this.viewport,
      contentEntity               : this.content,
      vertical                    : true,
      verticalScrollbarEntity     : this.scrollbarPanel,
      verticalScrollbarVisibility : SCROLLBAR_VISIBILITY_SHOW_WHEN_REQUIRED,
    });
  }

  _createViewPort() {
    this.viewport = new Entity("viewport");
    this.viewport.addComponent("element", {
      type    : ELEMENTTYPE_IMAGE,
      anchor  : new Vec4(0, 0, 1, 1),
      pivot   : new Vec2(0.5, 0.5),
      color   : new Color(0.2, 0.2, 0.2),
      margin  : new Vec4(0, 0, 0, 0),
      padding : new Vec4(0, 0, 0, 0),
      mask    : true,
      opacity : 1,
      rect    : new Vec4(0, 0, 1, 1),
    });

    this.shopViewContainer.addChild(this.viewport);

    this.content = new Entity("content");
    this.content.addComponent("element", {
      type     : ELEMENTTYPE_GROUP,
      anchor   : new Vec4(0, 1, 0, 1),
      pivot    : new Vec2(0, 1),
      margin   : new Vec4(),
      height   : 650,
      useInput : true,
    });
    this.content.addComponent("layoutgroup", {
      orientation : ORIENTATION_HORIZONTAL,
      padding     : new Vec4(25, 25, 25, 25),
      alignment   : new Vec2(0, 1),
      spacing     : new Vec2(35, 35),
      wrap        : true,
    });
    this.viewport.addChild(this.content);
  }

  _reCalculateLayout() {
    let items = this.items;
    if (!items[0] || !items[0].element) {
      return;
    }

    let firstChild = items[0];
    let childHeight = firstChild.element.height;
    let childWidth = firstChild.element.width;
    let col = 3;
    // eslint-disable-next-line max-len
    let width = col * childWidth + (col - 1) * this.content.layoutgroup.spacing.x + this.content.layoutgroup.padding.x + this.content.layoutgroup.padding.z;
    let height = Math.ceil(items.length / col) * childHeight + (Math.ceil(items.length / col) - 1) * this.content.layoutgroup.spacing.y;
    this.content.element.width = width;
    this.content.element.height = height + 25;
    this.shopViewContainer.element.width = width + 10; // 10 is space for scrollbar
  }

  public updateItemsState() {
    return this.items.reduce((isAvailable, element) => {
      return element.updateState() || isAvailable;
    }, false);
  }

  public onTutorialItemClick() {
    const tutorialItem = this.items.find((element) => element.getItemName() === GameConstant.TUTORIAL_SKIN);
    if (tutorialItem) {
      SoundManager.play("sfx_button");
      this.fire(ShopView.CLICK_ITEM, tutorialItem);
      this.items.forEach((element) => {
        element.deactive();
      });
      tutorialItem.active();
    }
  }
}


