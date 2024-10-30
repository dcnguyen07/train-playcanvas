import {
  Color,
  ELEMENTTYPE_GROUP,
  ELEMENTTYPE_IMAGE,
  Entity,
  ORIENTATION_HORIZONTAL,
  ORIENTATION_VERTICAL,
  SCROLLBAR_VISIBILITY_SHOW_WHEN_REQUIRED,
  SCROLL_MODE_BOUNCE,
  Vec2,
  Vec4,
} from "playcanvas";
import { GameConstant } from "../../../gameConstant";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { SoundManager } from "../../../template/soundManager";
import { Tween } from "../../../template/systems/tween/tween";
import { LanguageData } from "../../data/languageData";
import { AssetManager } from "../../../template/assetManager";
import { Util } from "../../../template/helpers/util";
import { ResourceLoadingScreen } from "./resourceLoadingScreen";

export class LanguagePopup extends Entity {
  static EVENT_LANGUAGE_CHANGED = "languageChanged";
  fakeBackground: Entity;
  background: Entity;
  buttonClose: Entity;
  viewport: Entity;
  content: Entity;
  scrollbarPanel: Entity;
  handle: Entity;
  languageContainer: Entity;
  resourceLoadingScreen: ResourceLoadingScreen;
  items: any[] = [];
  showTween: Tween;
  hideTween: Tween;

  constructor() {
    super("languagePopup");
    this.addComponent("element", {
      type   : ELEMENTTYPE_GROUP,
      anchor : new Vec4(0, 0, 1, 1),
      pivot  : new Vec2(0.5, 0.5),
    });
    this.create();
    LanguageData.eventEmitter.on(LanguageData.Event.LANGUAGE_CHANGED, () => {
      this.resourceLoadingScreen.hide();
    });

  }

  private create() {
    this._createBackground();
    this._createButtonClose();
    this._createScrollView();
    this._createLanguageList();
    this._initResourceLoading();
    this._initTweens();
  }

  _initResourceLoading() {
    this.resourceLoadingScreen = new ResourceLoadingScreen();
    this.resourceLoadingScreen.hide();
    this.addChild(this.resourceLoadingScreen);
  }

  private _createBackground() {
    this.fakeBackground = ObjectFactory.createEmptyImageElement({
      color    : Color.BLACK,
      useInput : true,
      opacity  : 0.6,
    });
    this.fakeBackground.element.anchor = new Vec4(0, 0, 1, 1);
    this.addChild(this.fakeBackground);

    this.background = ObjectFactory.createImageElement("spr_panel_settings", {
      width  : 700,
      height : 700,
      x      : 0,
    });
    this.addChild(this.background);
    this.background.setLocalScale(1.05, 1.05, 1.05);

    AssetManager.loadResource(GameConstant.GAME_FONT_NOTOSANS_BLACK, "font").then(() => {
      let title = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
        text         : "Language",
        fontSize     : 65,
        color        : Color.WHITE,
        outline      : 0.1,
        fontWeight   : "bold",
        outlineColor : new Color(0, 0, 0, 1),
        shadowColor  : new Color(0, 0, 0, 1),
        shadowOffset : new Vec2(0, -0.2),
        anchor       : new Vec4(0.5, 0.93, 0.5, 0.93),
        pivot        : new Vec2(0.5, 0.5),
        wrapLines    : false,
      });
      title.element.key = "language";
      this.background.addChild(title);
    });
  }

  private _createButtonClose() {
    this.buttonClose = ObjectFactory.createButtonElement("spr_btn_close_settings", {
      anchor : new Vec4(1, 1, 1, 1),
      pivot  : new Vec2(0.5, 0.5),
      scale  : 1,
      x      : -20,
      y      : -20,
    });
    this.background.addChild(this.buttonClose);

    this.buttonClose.button.on("click", () => {
      this.hideLanguagePopup();
      SoundManager.play("sfx_button");
    });
  }

  _createScrollView() {
    this.languageContainer = ObjectFactory.createGroupElement({
      width  : 690,
      height : 650,
      y      : 0,
      x      : 60,
      pivot  : new Vec2(0.5, 0.5),
    });
    this.background.addChild(this.languageContainer);

    this._createViewPort();
    this._createVerticalScrollBar();

    this.languageContainer.addComponent("scrollview", {
      scrollMode                  : SCROLL_MODE_BOUNCE,
      bounceAmount                : 0.1,
      friction                    : 0.05,
      useMouseWheel               : true,
      mouseWheelSensitivity       : new Vec2(1, 1),
      viewportEntity              : this.viewport,
      contentEntity               : this.content,
      vertical                    : false,
      horizontal                  : false,
      verticalScrollbarEntity     : this.scrollbarPanel,
      verticalScrollbarVisibility : SCROLLBAR_VISIBILITY_SHOW_WHEN_REQUIRED,
    });

    this.scrollbarPanel.scrollbar._updateHandlePositionAndSize();
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

    this.languageContainer.addChild(this.viewport);

    this.content = new Entity("content");
    this.content.addComponent("element", {
      type     : ELEMENTTYPE_GROUP,
      anchor   : new Vec4(0, 0.45, 0, 0.45),
      pivot    : new Vec2(0, 0.5),
      margin   : new Vec4(),
      height   : 700,
      useInput : true,
    });
    this.content.addComponent("layoutgroup", {
      orientation : ORIENTATION_HORIZONTAL,
      padding     : new Vec4(0, 0, 0, 0),
      alignment   : new Vec2(0.5, 0.5),
      spacing     : new Vec2(20, 20),
      wrap        : true,
    });
    this.viewport.addChild(this.content);
  }

  _createVerticalScrollBar() {
    this.handle = new Entity("handle");
    this.handle.addComponent("element", {
      type     : ELEMENTTYPE_IMAGE,
      color    : Util.createColor(102, 102, 102, 1),
      anchor   : new Vec4(0, 1, 1, 1),
      pivot    : new Vec2(1, 1),
      width    : 0,
      height   : 20,
      margin   : new Vec4(0, 0, 0, 0),
      useInput : true,
    });

    this.handle.addComponent("button", {
      active      : true,
      hoverTint   : new Color(0.9, 0.9, 0.9),
      pressedTint : new Color(0.5, 0.5, 0.5),
      imageEntity : this.handle,
    });


    this.scrollbarPanel = new Entity("scrollbar");
    this.scrollbarPanel.addComponent("element", {
      type   : ELEMENTTYPE_IMAGE,
      anchor : new Vec4(1, 0, 1, 1),
      pivot  : new Vec2(1, 1),
      width  : 7,
      margin : new Vec4(0, 0, 0, 0),
      rect   : new Vec4(0, 0, 1, 1),
      color  : Util.createColor(178, 178, 178, 1),
    });
    this.scrollbarPanel.addChild(this.handle);
    this.scrollbarPanel.addComponent("scrollbar", {
      orientation  : ORIENTATION_VERTICAL,
      value        : 0,
      handleSize   : 0.5,
      handleEntity : this.handle,
    });
    this.languageContainer.addChild(this.scrollbarPanel);
  }

  private async _createLanguageList() {
    let allLanguageData = LanguageData.getAllLanguage();
    for (let i = 0; i < allLanguageData.length; i++) {
      let language = allLanguageData[i].displayName;
      let buttonFlag = ObjectFactory.createImageElement(allLanguageData[i].flag, {
        width    : 130,
        height   : 90,
        useInput : true,
      });
      let stroke = ObjectFactory.createImageElement("spr_flag_selected", {
        width    : 130,
        height   : 100,
        useInput : true,
      });
      buttonFlag.addChild(stroke);
      stroke.enabled = false;
      // @ts-ignore
      buttonFlag.stroke = stroke;
      let code = LanguageData.getLanguageByName(allLanguageData[i].name).code;
      if (code === LanguageData.currentLanguageCode) {
        stroke.enabled = true;
      }
      buttonFlag.addComponent("button", {
        active      : true,
        hoverTint   : new Color(0.9, 0.9, 0.9),
        pressedTint : new Color(0.5, 0.5, 0.5),
        imageEntity : buttonFlag,
      });
      this.content.addChild(buttonFlag);
      this.items.push(buttonFlag);

      buttonFlag.button.on("click", (event) => {
        if (event.touch) {
          event.event.preventDefault();
        }
        SoundManager.play("sfx_button");
        this.resourceLoadingScreen.show();
        let languageData = LanguageData.getLanguageByName(allLanguageData[i].name);
        LanguageData.setLanguage(languageData);
        this.disableAllStroke();
        // @ts-ignore
        buttonFlag.stroke.enabled = true;
        this.fire(LanguagePopup.EVENT_LANGUAGE_CHANGED, language);
      });
    }

    this._reCalculateLayout();
  }

  disableAllStroke() {
    for (let i = 0; i < this.items.length; i++) {
      // @ts-ignore
      this.items[i].stroke.enabled = false;
    }
  }

  _reCalculateLayout() {
    let items = this.items;
    if (!items[0] || !items[0].element) {
      return;
    }

    let firstChild = items[0];
    let childHeight = firstChild.element.height;
    let childWidth = firstChild.element.width;
    let col = 4;
    let width = col * childWidth + (col - 1) * this.content.layoutgroup.spacing.x;
    let height = Math.ceil(items.length / col) * childHeight + (Math.ceil(items.length / col) - 1) * this.content.layoutgroup.spacing.y;
    this.content.element.width = width;
    this.content.element.height = height;
    this.scrollbarPanel.scrollbar._updateHandlePositionAndSize();
  }

  _initTweens() {
    this.showTween = Tween.createTween({ scale: 0 }, { scale: 1 }, {
      duration : 0.5,
      easing   : Tween.Easing.Back.Out,
      onUpdate : (data: any) => {
        this.background.setLocalScale(data.scale, data.scale, data.scale);
      },
    });

    this.hideTween = Tween.createTween({ scale: 1 }, { scale: 0 }, {
      duration : 0.5,
      easing   : Tween.Easing.Back.InOut,
      onUpdate : (data: any) => {
        this.background.setLocalScale(data.scale, data.scale, data.scale);
      },
      onComplete: () => {
        this.enabled = false;
      },
    });
  }

  public showLanguagePopup() {
    this.showTween.start();
  }

  public hideLanguagePopup() {
    this.hideTween.start();
  }
}
