import { BUTTON_TRANSITION_MODE_SPRITE_CHANGE, BUTTON_TRANSITION_MODE_TINT, ELEMENTTYPE_GROUP, ELEMENTTYPE_IMAGE,
  ELEMENTTYPE_TEXT, ORIENTATION_VERTICAL, Color, Entity, Vec2, Vec4, SCROLL_MODE_BOUNCE, SCROLLBAR_VISIBILITY_SHOW_WHEN_REQUIRED } from "playcanvas";
import { DropdownItem } from "./dropdownItem";
import { LayoutGroupFitter } from "../../../scripts/layoutGroupFitter";
import { waitToNFrames } from "../../../helpers/util";
import { AssetManager } from "../../../assetManager";
import { HandleClickOutsideOfElement } from "../../scripts/handleClickOutsideOfElement";

export class Dropdown<ItemType extends DropdownItem> extends Entity {
  static EVENT_ITEM_SELECTED = "Dropdown:ItemSelected";
  static EVENT_ITEM_DESELECTED = "Dropdown:ItemDeselected";

  btnTrigger!: Entity;
  selectedContent!: Entity;
  content!: Entity;
  contentGroup!: Entity;
  contentBackground!: Entity;
  contentViewport!: Entity;
  contentScrollbar!: Entity;
  contentScrollBarHandle!: Entity;
  contentFitter!: LayoutGroupFitter;
  private _clickOutsideHandler!: HandleClickOutsideOfElement;

  items: ItemType[] = [];

  // auto select first item
  autoSelect: boolean = true;

  protected isScrollable: boolean = false;
  protected _scrollHeight: number = 0;
  get scrollHeight() {
    return this._scrollHeight;
  }

  private _selectedItem!: ItemType;
  get selectedItem() {
    return this._selectedItem;
  }

  get value() {
    return this.selectedItem.value;
  }

  protected _isContentShown: boolean = false;
  get isContentShown() {
    return this._isContentShown;
  }

  /**
   * @param data - data for element component
   */
  constructor(data: any = {}) {
    super("DropDownElement");

    data.type = ELEMENTTYPE_GROUP;
    data.margin = data.margin || new Vec4();
    this.addComponent("element", data);

    this.btnTrigger = new Entity("TriggerButton");
    this.addChild(this.btnTrigger);

    this.btnTrigger.addComponent("element", {
      type     : ELEMENTTYPE_IMAGE,
      anchor   : new Vec4(0, 0, 1, 1),
      margin   : new Vec4(),
      useInput : true,
    });

    this.btnTrigger.addComponent("button", {
      imageEntity: this.btnTrigger,
    });
    this.btnTrigger.button!.on("click", this.onButtonTriggerClicked, this);

    this.selectedContent = new Entity("SelectedContent");
    this.btnTrigger.addChild(this.selectedContent);
    this.selectedContent.addComponent("element", {
      type         : ELEMENTTYPE_TEXT,
      fontAsset    : AssetManager.find("FiraSans-Regular"),
      fontSize     : 30,
      maxFontSize  : 30,
      color        : new Color(),
      anchor       : new Vec4(0, 0.5, 1, 0.5),
      pivot        : new Vec2(0.5, 0.5),
      alignment    : new Vec2(0, 0.5),
      margin       : new Vec4(0, 0, 0, 0),
      autoWidth    : false,
      autoFitWidth : true,
    });

    this._clickOutsideHandler = this.addScript(HandleClickOutsideOfElement, {
      attributes: {
        element: this.element,
      },
    }) as HandleClickOutsideOfElement;
    this._clickOutsideHandler.on(HandleClickOutsideOfElement.EVENT_INVOKED, this.onClickedOutsideContentGroup, this);

    this._initContent();
    this.hideContent();
  }

  private _initContent() {
    this.contentGroup = new Entity("DropdownContentGroup");
    this.addChild(this.contentGroup);
    this.contentGroup.addComponent("element", {
      type   : ELEMENTTYPE_GROUP,
      anchor : new Vec4(0, 0, 1, 0),
      pivot  : new Vec2(0, 1),
      margin : new Vec4(),
    });

    this.contentBackground = new Entity("DropdownContentBackground");
    this.contentGroup.addChild(this.contentBackground);

    this.contentBackground.addComponent("element", {
      type   : ELEMENTTYPE_IMAGE,
      anchor : new Vec4(0, 0, 1, 1),
      margin : new Vec4(),
    });

    this.contentViewport = new Entity("DropdownContentViewport");
    this.contentGroup.addChild(this.contentViewport);
    this.contentViewport.addComponent("element", {
      type   : ELEMENTTYPE_IMAGE,
      anchor : new Vec4(0, 0, 1, 1),
      margin : new Vec4(),
      mask   : true,
    });

    this.content = new Entity("DropdownContent");
    this.contentViewport.addChild(this.content);

    this.content.addComponent("element", {
      type     : ELEMENTTYPE_GROUP,
      anchor   : new Vec4(0, 1, 1, 1),
      pivot    : new Vec2(0, 1),
      margin   : new Vec4(),
      useInput : true,
    });

    this.content.addComponent("layoutgroup", {
      orientation: ORIENTATION_VERTICAL,
    });

    this.contentFitter = this.content.addScript(LayoutGroupFitter, {
      attributes: {
        orientation: ORIENTATION_VERTICAL,
      },
    }) as LayoutGroupFitter;

    this.contentScrollbar = new Entity("DropdownContentScrollbar");
    this.contentGroup.addChild(this.contentScrollbar);
    this.contentScrollbar.addComponent("element", {
      type   : ELEMENTTYPE_IMAGE,
      anchor : new Vec4(1, 0, 1, 1),
      pivot  : new Vec2(1, 1),
      margin : new Vec4(),
      color  : new Color(0.7, 0.7, 0.7),
      width  : 20,
    });
    this.contentScrollBarHandle = new Entity("DropdownContentScrollBarHandle");
    this.contentScrollbar.addChild(this.contentScrollBarHandle);
    this.contentScrollBarHandle.addComponent("element", {
      type   : ELEMENTTYPE_IMAGE,
      anchor : new Vec4(0, 1, 1, 1),
      pivot  : new Vec2(1, 1),
      margin : new Vec4(),
      color  : new Color(0.3, 0.3, 0.3),
    });

    this.contentScrollBarHandle.addComponent("button", {
      imageEntity: this.contentScrollBarHandle,
    });

    this.contentScrollbar.addComponent("scrollbar", {
      orientation  : ORIENTATION_VERTICAL,
      handleEntity : this.contentScrollBarHandle,
    });

    this.contentGroup.addComponent("scrollview", {
      scrollMode                  : SCROLL_MODE_BOUNCE,
      bounceAmount                : 0.1,
      friction                    : 0.05,
      useMouseWheel               : true,
      mouseWheelSensitivity       : new Vec2(1, 1),
      viewportEntity              : this.contentViewport,
      contentEntity               : this.content,
      horizontal                  : false,
      vertical                    : true,
      verticalScrollbarEntity     : this.contentScrollbar,
      verticalScrollbarVisibility : SCROLLBAR_VISIBILITY_SHOW_WHEN_REQUIRED,
    });
  }

  protected onButtonTriggerClicked() {
    if (this.isContentShown) {
      this.hideContent();
    }
    else {
      this.showContent();
    }
  }

  protected onClickedOutsideContentGroup() {
    if (this.isContentShown) {
      this.hideContent();
    }
  }

  protected showContent() {
    this._isContentShown = true;
    this.contentGroup.enabled = true;

    // disable trigger button transition
    this.btnTrigger.button!.transitionMode = BUTTON_TRANSITION_MODE_SPRITE_CHANGE;
  }

  protected hideContent() {
    this._isContentShown = false;
    if (this.contentGroup.enabled) {
      this.contentGroup.enabled = false;
    }
    else { // only disable content group after first frame to fix scrollbar handle not displayed
      waitToNFrames().then(() => {
        this.contentGroup.enabled = false;
      });
    }

    // enable trigger button transition
    this.btnTrigger.button!.transitionMode = BUTTON_TRANSITION_MODE_TINT;
  }

  add(...items: ItemType[]) {
    if (items.length === 0) {
      return;
    }

    items.forEach((item) => {
      this.content.addChild(item);
      item.button!.on("click", () => this.selectItem(item));
    });

    this.items.push(...items);

    if (!this.selectedItem && this.autoSelect) {
      this.selectItem(items[0]);
    }

    waitToNFrames().then(() => {
      this.fitContent();
    });
  }

  public enableScrolling(height: number) {
    this.isScrollable = true;
    this._scrollHeight = height;
    this.updateScrollingLayout();
  }

  public disableScrolling() {
    this.isScrollable = false;
    this.updateScrollingLayout();
  }

  protected fitContent() {
    this.contentFitter.fit();
    this.updateScrollingLayout();
  }

  protected updateScrollingLayout() {
    if (this.isScrollable) {
      this.contentGroup.element!.height = this.scrollHeight;
    }
    else {
      this.contentGroup.element!.height = this.content.element!.height;
    }
  }

  clear() {
    this.items.forEach((item) => {
      this.content.removeChild(item);
    });
    this.items = [];
  }

  setItems(items: ItemType[]) {
    this.clear();
    this.add(...items);
  }

  public selectItem(item: ItemType | number) {
    if (this._selectedItem) {
      this.onItemDeselected(this._selectedItem);
    }
    if (typeof item === "number") {
      item = this.items[item];
    }

    this._selectedItem = item;
    this.onItemSelected(item);
    this.hideContent();
  }

  protected onItemSelected(item: ItemType) {
    this.selectedContent.element!.text = item.txtLabel.element!.text;
    item.onSelected();
    const index = this.items.indexOf(item);
    this.fire(Dropdown.EVENT_ITEM_SELECTED, item, index);
  }

  protected onItemDeselected(item: ItemType) {
    item.onDeselected();
    const index = this.items.indexOf(item);
    this.fire(Dropdown.EVENT_ITEM_DESELECTED, item, index);
  }

}
