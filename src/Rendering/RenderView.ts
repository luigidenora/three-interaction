import { Camera, Color, Scene, Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

export interface Viewport {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

export interface ViewParameters {
  scene: Scene;
  camera: Camera;
  viewport: Viewport;
  name?: string;
  enabled?: boolean;
  backgroundColor?: Color | number;
  backgroundAlpha?: number;
  composer?: EffectComposer;
}

export class RenderView implements ViewParameters {
  public scene: Scene;
  public camera: Camera;
  public viewportNormalized: Viewport;
  public viewport: Viewport = {};
  public name: string;
  public enabled: boolean;
  public backgroundColor: Color;
  public backgroundAlpha: number;
  public composer: EffectComposer;
  private _rendererSize: Vector2;

  constructor(parameters: ViewParameters, rendererSize: Vector2) {
    this._rendererSize = rendererSize;
    this.scene = parameters.scene;
    this.camera = parameters.camera;
    this.viewportNormalized = parameters.viewport;
    this.name = parameters.name;
    this.enabled = parameters.enabled ?? true;
    this.backgroundAlpha = parameters.backgroundAlpha;
    this.backgroundColor = typeof parameters.backgroundColor === "number" ? new Color(parameters.backgroundColor) : parameters.backgroundColor;

    // if (InteractionModulePresent)
    this.scene.add(this.camera); // useful to trigger camera resize event
    this.update();
  }

  public update(): void {
    this.viewport.left = Math.floor(this._rendererSize.x * this.viewportNormalized.left);
    this.viewport.top = Math.floor(this._rendererSize.y * this.viewportNormalized.top);
    this.viewport.width = Math.floor(this._rendererSize.x * this.viewportNormalized.width);
    this.viewport.height = Math.floor(this._rendererSize.y * this.viewportNormalized.height);
  }

}
