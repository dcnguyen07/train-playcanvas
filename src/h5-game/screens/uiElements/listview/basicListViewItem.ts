import { Game } from "../../../../game";
import { GameConstant } from "../../../../gameConstant";
import { AssetManager } from "../../../../template/assetManager";
import { Util } from "../../../../template/helpers/util";
import { ObjectFactory } from "../../../../template/objects/objectFactory";
import ListViewItem from "./listviewItem";
import * as pc from "playcanvas";

export class BasicListViewItem extends ListViewItem {
  static readonly EVENT_CLICK = "BasicListViewItem:click";
  panel!: pc.Entity;
  icon!: pc.Entity;
  title!: pc.Entity;
  description!: pc.Entity;
  iconNext!: pc.Entity;
  subTitle?: pc.Entity;
  content!: pc.Entity;
  textTitle!: string;

  age : number = 0;
  constructor(icon : string, title : string, description?: string, isEnable : boolean = true, showIconNext : boolean = true) {
    super();
    this.addComponent("element", {
      type   : pc.ELEMENTTYPE_GROUP,
      anchor : new pc.Vec4(0, 1, 1, 1),
      pivot  : new pc.Vec2(0, 1),
      height : 120,
      margin : new pc.Vec4(0, 0, 0, 0),
    });
    this._createBackground();
    this._createIcon(icon);
    this._createContent();
    this._createTitle(title);
    this._createDescription(description);
    this._createIconNext(showIconNext);
    this._onEnabled(isEnable);
    this.textTitle = title;
  }

  _createContent() {
    const content = ObjectFactory.createFittedLayoutGroupElement({
      anchor      : new pc.Vec4(0.2, 0.6, 0.22, 0.6),
      orientation : pc.ORIENTATION_VERTICAL,
      alignment   : new pc.Vec2(0, 0.5),
      padding     : new pc.Vec4(20, 0, 0, 20),
      spacing     : new pc.Vec2(0, 0),
      reverseY    : true,
    });
    this.addChild(content);
    this.content = content;
  }

  _onEnabled(isEnable : boolean) {
    if (isEnable) {
      this.icon!.element!.color = pc.Color.WHITE;
      this.title!.element!.color = new pc.Color(51 / 255, 94 / 255, 128 / 255);
      this.description!.element!.color = new pc.Color(51 / 255, 94 / 255, 128 / 255);
      this.iconNext!.element!.color = pc.Color.WHITE;
      this.panel.element!.useInput = true;
      return;
    }
    else {
      // @ts-ignore
      // eslint-disable-next-line prefer-template
      this.icon!.element!.spriteAsset = AssetManager.find(this.icon.name + "_greyscale");

      this.title!.element!.color = pc.Color.GRAY;
      this.description!.element!.color = pc.Color.GRAY;
      this.iconNext!.element!.color = pc.Color.GRAY;
      this.panel.element!.useInput = false;
    }
  }


  _createBackground() {
    this.panel = ObjectFactory.createButtonElement("spr_background_profile_panel", {
      active: false,
    });
    if (this.panel.element) {
      this.panel.element.anchor = new pc.Vec4(0, 0.5, 1, 1);
      this.panel.element.pivot = new pc.Vec2(0.5, 1);
    }
    this.addChild(this.panel);

    this.panel.button?.on("click", () => {
      this.fire(BasicListViewItem.EVENT_CLICK, this);
    });
  }

  _createIcon(icon : string) {
    this.icon = ObjectFactory.createImageElement(icon, {
      anchor : new pc.Vec4(0.05, 0.5, 0.05, 0.5),
      pivot  : new pc.Vec2(0, 0.5),
      scale  : 0.5,
    });
    this.addChild(this.icon);
  }

  _createTitle(title : string) {
    const groupTitle = new pc.Entity("groupTitle");
    groupTitle.addComponent("element", {
      type  : pc.ELEMENTTYPE_GROUP,
      pivot : new pc.Vec2(0, 0.5),
    });
    groupTitle.addComponent("layoutgroup", {
      orientation : pc.ORIENTATION_HORIZONTAL,
      alignment   : new pc.Vec2(0, 0.5),
      padding     : new pc.Vec4(0, 0, 0, 0),
      spacing     : new pc.Vec2(20, 0),
    });
    this.content.addChild(groupTitle);
    this.title = ObjectFactory.createTextElement("FiraSans-Bold", {
      text     : title,
      fontSize : 28,
      color    : new pc.Color(51 / 255, 94 / 255, 128 / 255),
      anchor   : new pc.Vec4(0.2, 0.8, 0.2, 0.8),
      pivot    : new pc.Vec2(0, 0.5),
    });
    groupTitle.addChild(this.title);

    this.subTitle = ObjectFactory.createTextElement("FiraSans-Regular", {
      text     : " ",
      fontSize : 28,
      color    : new pc.Color(51 / 255, 94 / 255, 128 / 255),
      anchor   : new pc.Vec4(0.2, 0.7, 0.2, 0.7),
      pivot    : new pc.Vec2(0, 0.5),
    });
    groupTitle.addChild(this.subTitle);

  }

  _createDescription(description? : string) {
    this.description = ObjectFactory.createTextElement("FiraSans-Regular", {
      text     : description || " ",
      fontSize : 24,
      color    : new pc.Color(51 / 255, 94 / 255, 128 / 255),
      anchor   : new pc.Vec4(0, 0.5, 0, 0.5),
      pivot    : new pc.Vec2(0, 0.5),
      x        : 150,
      y        : -20,
    });
    this.content.addChild(this.description);
    if (!description) {
      this.description.enabled = false;
    }
  }

  _createIconNext(showIconNext : boolean) {
    this.iconNext = ObjectFactory.createImageElement("spr_icon_next", {
      anchor : new pc.Vec4(1, 0.5, 1, 0.5),
      pivot  : new pc.Vec2(1, 0.5),
      x      : -20,
      scale  : 0.5,
    });
    this.addChild(this.iconNext);
    if (!showIconNext) {
      this.iconNext.enabled = false;
    }
  }

  setIcon(spriteAsset : string) {
    if (this.icon.element) {
      // @ts-ignore
      this.icon.element.spriteAsset = AssetManager.find(spriteAsset);
    }
  }

  setTitle(text : string) {
    if (this.title.element) {
      this.title.element.text = text;
    }
  }

  setDescription(text : string) {
    if (this.description.element) {
      this.description.element.text = text;
    }
  }

  setSubTitle(text : string) {
    if (this.subTitle?.element) {
      this.subTitle.element.text = `(${text})`;
      this.subTitle.enabled = true;
    }
  }

  onClick(callback : (item : BasicListViewItem) => void) {
    this.on(BasicListViewItem.EVENT_CLICK, callback);
  }
}
