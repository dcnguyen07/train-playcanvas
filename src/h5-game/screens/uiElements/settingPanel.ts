import { Entity, ELEMENTTYPE_IMAGE, Vec4, Vec2, Color } from "playcanvas";
import { AssetManager } from "../../../template/assetManager";
import { Util } from "../../../template/helpers/util";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import GameSetting from "../../../gameSetting";
import { GameConstant } from "../../../gameConstant";
import { SoundManager } from "../../../template/soundManager";
import { Tween } from "../../../template/systems/tween/tween";
import { Tweener } from "../../../template/systems/tween/tweener";
import { LanguageData } from "../../data/languageData";
import { ToggleSwitch, ToggleSwitchEvent } from "../uiElements/toggleSwitch";
import { LanguagePopup } from "./languagePopup";

export const SettingPanelEvent = Object.freeze({
  Close      : "close",
  BackToHome : "backToHome",
  Replay     : "replay",
});

export class SettingPanel extends Entity {
  toggleVibrate: ToggleSwitch;
  toggleSound: ToggleSwitch;
  appearTween: Tweener;
  disappearTween: Tweener;
  replayButton: Entity;
  closeButton: Entity;
  panel: Entity;
  texVibrate: Entity;
  textSound: Entity;
  tittleText: Entity;
  homeButton: Entity;
  textLanguage: Entity;
  flag: Entity;
  languagePopup: LanguagePopup;

  constructor() {
    super();
    this.addComponent("element", {
      type     : ELEMENTTYPE_IMAGE,
      anchor   : new Vec4(0, 0, 1, 1),
      pivot    : new Vec2(0.5, 0.5),
      color    : new Color(0, 0, 0, 0.5),
      opacity  : 0.8,
      useInput : true,
    });
    this.create();
  }

  create() {
    this._initPanel();
    this._initTitle();
    this._initVibrateSetting();
    this._initSoundSetting();
    this._initLanguageSetting();
    this._initLanguagePopup();
    // this._initButtonHome();
    this._initCloseButton();
    // this._initButtonReplay();
  }

  show() {
    let isVibrate = GameSetting.get(GameConstant.GAME_SETTING_KEY.VIBRATION);
    let isSound = GameSetting.get(GameConstant.GAME_SETTING_KEY.SOUND);
    if (isVibrate) {
      this.toggleVibrate.turnOn();
    }
    else {
      this.toggleVibrate.turnOff();
    }
    if (isSound) {
      this.toggleSound.turnOn();
    }
    else {
      this.toggleSound.turnOff();
    }
    this.playAnimationAppear();
    this._selectCurrentLanguage();
  }

  playAnimationAppear() {
    this.appearTween?.stop();
    let originalPos = this.panel.getLocalPosition().clone();
    this.panel.enabled = true;
    this.enabled = true;
    this.appearTween = Tween.createTween({ y: originalPos.y + 1000 }, { y: originalPos.y }, {
      duration : 0.25,
      onUpdate : (tween: any) => {
        this.panel.setLocalPosition(originalPos.x, tween.y, originalPos.z);
      },
      onComplete: () => {
        this.panel.setLocalPosition(originalPos.x, originalPos.y, originalPos.z);
      },
    }).start();
  }

  playAnimationDisappear() {
    this.disappearTween?.stop();
    let originalPos = this.panel.getLocalPosition().clone();
    this.disappearTween = Tween.createTween({ y: originalPos.y }, { y: originalPos.y + 1000 }, {
      duration : 0.3,
      onUpdate : (tween: any) => {
        this.panel.setLocalPosition(originalPos.x, tween.y, originalPos.z);
      },
      onComplete: () => {
        this.panel.setLocalPosition(originalPos.x, originalPos.y, originalPos.z);
        this.panel.enabled = false;
        this.enabled = false;
        this.fire(SettingPanelEvent.Close);
      },
    }).start();
  }

  _initPanel() {
    this.panel = new Entity();
    this.panel.addComponent("element", {
      type        : ELEMENTTYPE_IMAGE,
      anchor      : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot       : new Vec2(0.5, 0.5),
      width       : 622,
      height      : 550,
      color       : new Color(1, 1, 1),
      spriteAsset : AssetManager.find("spr_panel_settings"),
    });
    this.addChild(this.panel);
  }

  private _selectCurrentLanguage(): void {
    let flag = LanguageData.getFlagByCode(LanguageData.currentLanguageCode);
    this.flag.element.spriteAsset = AssetManager.find(flag as string) as any;
  }

  _initLanguagePopup() {
    this.languagePopup = new LanguagePopup();
    this.languagePopup.on(LanguagePopup.EVENT_LANGUAGE_CHANGED, () => {
      this._selectCurrentLanguage();
    });
    this.languagePopup.enabled = false;
    this.addChild(this.languagePopup);
  }

  _initLanguageSetting() {
    this.textLanguage = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      anchor    : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot     : new Vec2(0.5, 0.5),
      fontSize  : 50,
      color     : new Color(1, 1, 1),
      text      : "Language",
      y         : 20,
      width     : 200,
      wrapLines : false,
      alignment : new Vec2(0, 0.5),
    });
    this.panel.addChild(this.textLanguage);
    this.textLanguage.element.key = "language";
    this.textLanguage.setLocalPosition(-145, -160, 0);

    let buttonFlag = ObjectFactory.createImageElement("spr_button_flag", {
      width    : 130,
      height   : 90,
      useInput : true,
    });
    buttonFlag.setLocalPosition(150, -165, 0);
    this.panel.addChild(buttonFlag);
    buttonFlag.addComponent("button", {
      active      : true,
      hoverTint   : new Color(0.9, 0.9, 0.9),
      pressedTint : new Color(0.5, 0.5, 0.5),
      imageEntity : buttonFlag,
    });
    buttonFlag.button.on("click", () => {
      this.languagePopup.enabled = true;
      this.languagePopup.showLanguagePopup();
      SoundManager.play("sfx_button");
    });

    this.flag = ObjectFactory.createImageElement("spr_flag_vietnam", {
      width  : 95,
      height : 60,
    });
    buttonFlag.addChild(this.flag);
  }

  _initVibrateSetting() {
    this.texVibrate = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      anchor    : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot     : new Vec2(0.5, 0.5),
      fontSize  : 50,
      color     : new Color(1, 1, 1),
      text      : "Vibrate",
      y         : 20,
      width     : 200,
      wrapLines : false,
      alignment : new Vec2(0, 0.5),
    });
    this.texVibrate.element.key = "vibrate";
    this.panel.addChild(this.texVibrate);
    this.texVibrate.setLocalPosition(-145, -45, 0);

    this.toggleVibrate = new ToggleSwitch("spr_icon_toggle_switch_on", "spr_icon_toggle_switch_off");
    this.toggleVibrate.setLocalPosition(150, -40, 0);
    this.toggleVibrate.setLocalScale(1.2, 1.2, 1.2);
    this.panel.addChild(this.toggleVibrate);

    this.registerToggleVibrateEvent();
  }

  registerToggleVibrateEvent() {
    this.toggleVibrate.on(ToggleSwitchEvent.TurnOn, () => {
      GameSetting.set(GameConstant.GAME_SETTING_KEY.VIBRATION, true);
    });
    this.toggleVibrate.on(ToggleSwitchEvent.TurnOff, () => {
      GameSetting.set(GameConstant.GAME_SETTING_KEY.VIBRATION, false);
    });
  }

  _initSoundSetting() {
    this.textSound = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      anchor    : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot     : new Vec2(0.5, 0.5),
      fontSize  : 50,
      color     : new Color(1, 1, 1),
      text      : "Sound",
      y         : 20,
      width     : 200,
      wrapLines : false,
      alignment : new Vec2(0, 0.5),
    });
    this.textSound.element.key = "sound";
    this.panel.addChild(this.textSound);
    this.textSound.setLocalPosition(-145, 75, 0);

    this.toggleSound = new ToggleSwitch("spr_icon_toggle_switch_on", "spr_icon_toggle_switch_off");
    this.toggleSound.setLocalPosition(150, 70, 0);
    this.toggleSound.setLocalScale(1.2, 1.2, 1.2);
    this.panel.addChild(this.toggleSound);

    this.registerToggleSoundEvent();
  }

  registerToggleSoundEvent() {
    this.toggleSound.on(ToggleSwitchEvent.TurnOn, () => {
      GameSetting.set(GameConstant.GAME_SETTING_KEY.SOUND, true);
    });
    this.toggleSound.on(ToggleSwitchEvent.TurnOff, () => {
      GameSetting.set(GameConstant.GAME_SETTING_KEY.SOUND, false);
    });
  }

  _initTitle() {
    this.tittleText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text             : "Setting",
      anchor           : new Vec4(0.5, 1, 0.5, 1),
      pivot            : new Vec2(0.5, 1),
      y                : -40,
      fontSize         : 60,
      color            : new Color(1, 1, 1),
      outlineThickness : 1,
      outlineColor     : Util.createColor(50, 71, 255),
    });
    this.tittleText.element.key = "setting";
    this.panel.addChild(this.tittleText);
  }

  _initButtonHome() {
    this.homeButton = ObjectFactory.createImageElement("spr_btn_home", {
      useInput : true,
      anchor   : new Vec4(0.5, 0, 0.5, 0),
      pivot    : new Vec2(0.5, 0),
      scale    : 1,
    });
    this.homeButton.setLocalPosition(100, 30, 0);
    this.homeButton.addComponent("button", {
      active      : true,
      imageEntity : this.homeButton,
      pressedTint : new Color(0.5, 0.5, 0.5, 1),
      hoverTint   : new Color(0.7, 0.7, 0.7),
    });

    this.panel.addChild(this.homeButton);

    this.homeButton.button.on("click", () => {
      this.fire(SettingPanelEvent.BackToHome);
      SoundManager.play("sfx_button");
    });
  }

  _initButtonReplay() {
    this.replayButton = ObjectFactory.createButtonElement("spr_btn_replay", {
      anchor : new Vec4(0.5, 0, 0.5, 0),
      pivot  : new Vec2(0.5, 0),
      y      : 30,
    });
    this.panel.addChild(this.replayButton);
    this.replayButton.button.on("click", () => {
      this.fire(SettingPanelEvent.Replay);
      SoundManager.play("sfx_button");
    });

    let txtReplay = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text         : "Replay",
      anchor       : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot        : new Vec2(0.5, 0.5),
      color        : Color.WHITE,
      autoWidth    : false,
      autoFitWidth : true,
      minFontSize  : 20,
      maxFontSize  : 30,
      fontSize     : 25,
      width        : 150,
      x            : 35,
    });
    txtReplay.element.key = "replay";
    this.replayButton.addChild(txtReplay);
  }

  _initCloseButton() {
    this.closeButton = ObjectFactory.createImageElement("spr_btn_close_settings", {
      useInput : true,
      anchor   : new Vec4(1, 1, 1, 1),
      pivot    : new Vec2(0.5, 0.5),
      scale    : 1,
      x        : -20,
      y        : -20,
    });
    this.closeButton.addComponent("button", {
      active      : true,
      imageEntity : this.closeButton,
      pressedTint : new Color(0.5, 0.5, 0.5, 1),
      hoverTint   : new Color(0.7, 0.7, 0.7),
    });
    this.closeButton.button.on("click", () => {
      SoundManager.play("sfx_button");
      this.playAnimationDisappear();
    });
    this.panel.addChild(this.closeButton);
  }

  public setStateReplayButton(state: boolean) {
    this.replayButton.enabled = state;
  }
}
