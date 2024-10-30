import { ElementComponent, FILTER_LINEAR, PIXELFORMAT_R8_G8_B8_A8, RenderTarget, ScriptType, Texture, Vec2 } from "playcanvas";

export default class RenderCameraToElement extends ScriptType {
  static override get scriptName() {
    return "renderCameraToElement";
  }

  private element: ElementComponent = null;
  private renderResolution: Vec2 = new Vec2(512, 512);
  private renderOnce: boolean = false;

  private _renderOnceFrameCount: number;
  private _texture: Texture = null;
  private _renderTarget: RenderTarget = null;

  override initialize() {
    this.createNewRenderTexture();
    this._renderOnceFrameCount = 0;
  }

  override update() {
    if (this.renderOnce) {
      this._renderOnceFrameCount += 1;
      if (this._renderOnceFrameCount > 4) {
        this.entity.enabled = false;
      }
    }
  }

  private createNewRenderTexture() {
    let device = this.app.graphicsDevice;

    // Make sure we clean up the old textures first and remove
    // any references
    if (this._texture && this._renderTarget) {
      let oldRenderTarget = this._renderTarget;
      let oldTexture = this._texture;

      this._renderTarget = null;
      this._texture = null;

      oldRenderTarget.destroy();
      oldTexture.destroy();
    }

    // Create a new texture based on the current width and height of
    // the screen reduced by the scale
    let colorBuffer = new Texture(device, {
      width  : this.renderResolution.x,
      height : this.renderResolution.y,
      format : PIXELFORMAT_R8_G8_B8_A8,
    });

    colorBuffer.minFilter = FILTER_LINEAR;
    colorBuffer.magFilter = FILTER_LINEAR;

    let renderTarget = new RenderTarget(device, colorBuffer, {
      depth   : true,
      flipY   : true,
      samples : 2,
    });

    this.entity.camera.renderTarget = renderTarget;

    this._texture = colorBuffer;
    this._renderTarget = renderTarget;

    this.assignTextureToElements(this.element);
  }

  assignTextureToElements(element: ElementComponent) {
    element.texture = this._texture;
  }
}
