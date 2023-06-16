import { Camera, Color, Scene, Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

/**
 * Represents an object that defines the dimensions and position of a viewport.
 */
export interface Viewport {
  /** The left coordinate of the viewport. */
  left: number;
  /** The top coordinate of the viewport. */
  top: number;
  /** The width of the viewport */
  width: number;
  /** The height of the viewport. */
  height: number;
}

/**
 * Represents a set of parameters for configuring a view.
 */
export interface ViewParameters {
  /** The scene to be rendered in the view. */
  scene: Scene;
  /** The camera used to view the scene. */
  camera: Camera;
  /** The normalized viewport defining the dimensions and position of the view (optional). Values range from 0 to 1. */
  viewport?: Viewport;
  /** The name of the view. */
  name?: string;
  /** Determines if the view is visible (optional, default: true). */
  visible?: boolean;
  /** Determines whether interaction events will be triggered for the view. (optional, default: true).  */
  enabled?: boolean;
  /** The background color of the view (optional). It can be a Color object or a numeric value representing the color. */
  backgroundColor?: Color | number;
  /** The background alpha value of the view (optional, default: 1). */
  backgroundAlpha?: number;
  /** The effect composer used for post-processing (optional). */
  composer?: EffectComposer;
}

/**
 * Represents a render view with specific parameters.
 */
export class RenderView implements ViewParameters {
  public scene: Scene;
  public camera: Camera;
  /** The normalized viewport defining the dimensions and position of the view. Values range from 0 to 1. */
  public viewportNormalized: Viewport;
  /** The viewport defining the dimensions and position of the view. */
  public viewport = { left: 0, top: 0, width: 0, height: 0 };
  public name: string;
  public visible: boolean;
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
    this.visible = parameters.visible ?? true;
    this.enabled = parameters.enabled ?? true;
    this.backgroundAlpha = parameters.backgroundAlpha;
    this.backgroundColor = typeof parameters.backgroundColor === "number" ? new Color(parameters.backgroundColor) : parameters.backgroundColor;

    // if (InteractionModulePresent) TODO
    this.scene.add(this.camera); // useful to trigger camera resize event
    this.update();
  }

  public update(): void {
    if (this.viewport !== undefined) {
      this.viewport.left = Math.floor(this._rendererSize.x * this.viewportNormalized.left);
      this.viewport.top = Math.floor(this._rendererSize.y * this.viewportNormalized.top);
      this.viewport.width = Math.floor(this._rendererSize.x * this.viewportNormalized.width);
      this.viewport.height = Math.floor(this._rendererSize.y * this.viewportNormalized.height);
    } else {
      this.viewport.width = this._rendererSize.x;
      this.viewport.height = this._rendererSize.y;
    }
  }

}
