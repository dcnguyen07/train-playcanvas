import * as pc from "playcanvas";
import { LayoutGroupFitter } from "../../../../template/scripts/layoutGroupFitter";
import ListViewItem from "./listviewItem";
import { waitToNFrames } from "../../../../template/helpers/util";

export type BuildItemCallback = (data: any, index?: number) => ListViewItem;

export default class ListView extends pc.Entity {
  viewport: pc.Entity;
  handle!: pc.Entity;
  verticalScrollBar!: pc.Entity;
  contentFitter!: LayoutGroupFitter;

  protected _padding: pc.Vec4;
  protected _spacing: pc.Vec2;
  protected _alignment: pc.Vec2;
  content: pc.Entity;

  items: ListViewItem[] = [];

  constructor({
    anchor = new pc.Vec4(0, 0, 1, 1),
    pivot = new pc.Vec2(0, 1),
    width = 0,
    height = 0,
    padding = new pc.Vec4(0, 10, 0, 10),
    spacing = new pc.Vec2(0, 50),
    alignment = new pc.Vec2(0, 1),
  }) {
    super("ListView");
    this._padding = padding;
    this._spacing = spacing;
    this._alignment = alignment;

    this.addComponent("element", {
      anchor,
      pivot,
      width,
      height,
      margin : new pc.Vec4(0, 0, 0, 0),
      type   : pc.ELEMENTTYPE_GROUP,
    });

    this.viewport = this._createViewport();
    this.verticalScrollBar = this._createScrollbar();
    this.content = this._createContent();

    this.addComponent("scrollview", {
      scrollMode                  : pc.SCROLL_MODE_BOUNCE,
      bounceAmount                : 0.1,
      friction                    : 0.05,
      useMouseWheel               : true,
      mouseWheelSensitivity       : new pc.Vec2(1, 1),
      viewportEntity              : this.viewport,
      contentEntity               : this.content,
      horizontal                  : false,
      vertical                    : true,
      verticalScrollbarEntity     : this.verticalScrollBar,
      verticalScrollbarVisibility : pc.SCROLLBAR_VISIBILITY_SHOW_WHEN_REQUIRED,
    });
  }

  protected _createViewport() {
    const viewport = new pc.Entity("Viewport");
    viewport.addComponent("element", {
      margin : new pc.Vec4(0, 0, 0, 0),
      anchor : new pc.Vec4(0, 0, 1, 1),
      pivot  : new pc.Vec2(0, 1),
      type   : pc.ELEMENTTYPE_IMAGE,
      mask   : true,
    });
    this.addChild(viewport);

    return viewport;
  }

  protected _createScrollbar() {
    this.handle = new pc.Entity();
    this.handle.addComponent("element", {
      type     : pc.ELEMENTTYPE_IMAGE,
      anchor   : new pc.Vec4(0.5, 1, 0.5, 1),
      pivot    : new pc.Vec2(1, 1),
      useInput : true,
      width    : 0,
    });
    this.handle.addComponent("button", {
      active     : true,
      hitPadding : new pc.Vec4(0, 0, 0, 0),
      width      : 0,
    });

    const scrollBar = new pc.Entity();
    scrollBar.addChild(this.handle);
    scrollBar.addComponent("element", {
      type   : pc.ELEMENTTYPE_IMAGE,
      anchor : new pc.Vec4(1, 0, 1, 1),
      pivot  : new pc.Vec2(1, 1),
      width  : 0,
      height : 100,
    });

    scrollBar.addComponent("scrollbar", {
      orientation  : pc.ORIENTATION_VERTICAL,
      value        : 0,
      handleEntity : this.handle,
    });
    this.addChild(scrollBar);

    return scrollBar;
  }

  protected _createContent() {
    const content = new pc.Entity("ListViewContent");
    content.addComponent("element", {
      type     : pc.ELEMENTTYPE_GROUP,
      anchor   : new pc.Vec4(0, 1, 1, 1),
      pivot    : new pc.Vec2(0, 1),
      margin   : new pc.Vec4(0, 0, 0, 0),
      useInput : true,
    });
    this.viewport.addChild(content);

    content.addComponent("layoutgroup", {
      orientation : pc.ORIENTATION_VERTICAL,
      alignment   : this._alignment,
      padding     : this._padding,
      spacing     : this._spacing,
    });

    this.contentFitter = content.addScript(LayoutGroupFitter, {
      attributes: {
        orientation : pc.ORIENTATION_VERTICAL,
        margin      : 20,
      },
    }) as LayoutGroupFitter;

    this.element?.on("resize", this.contentFitter.fit.bind(this.contentFitter));

    return content;
  }

  public addItem(item: ListViewItem, fit = true) {
    if (!item.verify()) {
      console.warn("ListViewItem is not set up correctly");
      return;
    }
    this.content.addChild(item);
    this.items.push(item);
    if (fit) {
      waitToNFrames(2).then(() => {
        this.contentFitter.fit();
      });
    }
  }

  public removeItem(item: ListViewItem, fit = true) {
    this.content.removeChild(item);
    if (fit) {
      waitToNFrames(2).then(() => {
        this.contentFitter.fit();
      });
    }
  }

  public clear() {
    this.items = [];
    for (let i = this.content.children.length - 1; i >= 0; i--) {
      this.content.children[i].destroy();
    }
    this.contentFitter.fit();
  }

  public resize() {
    this.items.forEach((item) => {
      item.resize();
    });
  }

  public static builder({
    anchor = new pc.Vec4(0, 0, 1, 1),
    pivot = new pc.Vec2(0, 1),
    width = 0,
    height = 0,
    padding = new pc.Vec4(0, 0, 0, 0),
    spacing = new pc.Vec2(0, 0),
    alignment = new pc.Vec2(0, 1),
    data = [],
    builder,
  }: {
    anchor?: pc.Vec4;
    pivot?: pc.Vec2;
    width?: number;
    height?: number;
    padding?: pc.Vec4;
    spacing?: pc.Vec2;
    alignment?: pc.Vec2;
    data?: any[];
    builder: BuildItemCallback;
  }) {
    const listView = new ListView({
      anchor,
      pivot,
      width,
      height,
      padding,
      spacing,
      alignment,
    });

    data.forEach((itemData, index) => {
      const item = builder(itemData, index);
      listView.addItem(item, false);
    });
    waitToNFrames(2).then(() => {
      listView.contentFitter.fit();
    });

    return listView;
  }
}
