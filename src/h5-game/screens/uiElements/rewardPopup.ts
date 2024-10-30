import { Easing } from "@tweenjs/tween.js";
import { Entity, ELEMENTTYPE_GROUP, Vec4, Vec2, Color } from "playcanvas";
import { GameConstant } from "../../../gameConstant";
import { AssetManager } from "../../../template/assetManager";
import { ObjectFactory } from "../../../template/objects/objectFactory";
import { SoundManager } from "../../../template/soundManager";
import { Tween } from "../../../template/systems/tween/tween";
import { ShopData } from "../../data/shopData";

export class RewardPopup extends Entity {

  public static readonly Event = {
    CLAIM_IT_BUTTON_CLICKED: "RewardPopup:ClaimItButtonClicked",
  };

  private _fakeBackground: Entity;
  private _iconItem: Entity;
  private _glowIcon: Entity;
  private _claimItButton: Entity;
  private _scaleTween: Tween;

  constructor() {
    super("rewardPopup");
    this.addComponent("element", {
      type   : ELEMENTTYPE_GROUP,
      anchor : new Vec4(0, 0, 1, 1),
      pivot  : new Vec2(0.5, 0.5),
    });
    this.create();
  }

  private create() {
    this._createFakeBackground();
    this._initFrameItem();
    this._initClaimItButton();
  }

  private _createFakeBackground() {
    this._fakeBackground = new Entity();
    this._fakeBackground.addComponent("element", {
      type   : "image",
      anchor : new Vec4(0, 0, 1, 1),
      color  : Color.BLACK,
    });
    this.addChild(this._fakeBackground);
  }

  private _initFrameItem() {
    this._glowIcon = ObjectFactory.createImageElement("spr_icon_light", {
      anchor : new Vec4(0.5, 0.65, 0.5, 0.65),
      pivot  : new Vec2(0.5, 0.5),
    });
    this.addChild(this._glowIcon);

    Tween.createRotateTween(this._glowIcon, { z: -360 }, {
      loop     : true,
      duration : 5,
    }).start();

    this._iconItem = ObjectFactory.createImageElement("spr_icon_car_6", {
      anchor : new Vec4(0.5, 0.65, 0.5, 0.65),
      pivot  : new Vec2(0.5, 0.5),
      scale  : 2.5,
    });
    this.addChild(this._iconItem);
    this._iconItem.setLocalScale(0, 0, 1);

    this._scaleTween = Tween.createTween({ scale: 0 }, { scale: 1 }, {
      duration : 0.5,
      easing   : Easing.Back.Out,
      onUpdate : (data: any) => {
        this._iconItem.setLocalScale(data.scale, data.scale, 1);
      },
    });
  }

  private _initClaimItButton() {
    this._claimItButton = ObjectFactory.createButtonElement("spr_button_green", {
      anchor : new Vec4(0.5, 0.35, 0.5, 0.35),
      scale  : 1.35,
    });
    this._claimItButton.setLocalPosition(0, -125, 0);
    this._claimItButton.button.on("click", this._onClaimItButtonClicked.bind(this));
    this.addChild(this._claimItButton);

    let claimItText = ObjectFactory.createTextElement(GameConstant.GAME_FONT_NOTOSANS_BLACK, {
      text         : "Claim",
      color        : Color.WHITE,
      anchor       : new Vec4(0.5, 0.5, 0.5, 0.5),
      pivot        : new Vec2(0.5, 0.5),
      wrapLines    : false,
      autoWidth    : false,
      autoFitWidth : true,
      minFontSize  : 30,
      maxFontSize  : 45,
      fontSize     : 35,
      width        : 300,
    });
    this._claimItButton.addChild(claimItText);
  }

  private _onClaimItButtonClicked() {
    SoundManager.play("sfx_button");
    this.fire(RewardPopup.Event.CLAIM_IT_BUTTON_CLICKED);
  }

  public setIcon(skin: string) {
    const iconName = ShopData.getIconSkinByName(skin);
    const spriteResource = AssetManager.find(iconName)?.resource;
    if (spriteResource) {
      this._iconItem.element.sprite = spriteResource;
    }
  }

  public setActive(isActive: boolean) {
    this.enabled = isActive;
    if (isActive) {
      this._scaleTween.start();
      Tween.createCountTween({
        duration   : 0.15,
        onComplete : () => {
          SoundManager.play("sfx_reward");
        },
      }).start();
    }
  }
}
