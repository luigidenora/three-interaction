import { Camera, Color, Scene, Vector2 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

/**
 * Represents an object that defines the dimensions and position of a viewport.
 */
export interface Viewport {
  /** The left coordinate of the viewport. */
  left: number;
  /** The bottom coordinate of the viewport. */
  bottom: number;
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
  /** The camera used to view the scene (Don't use the same camera for differents scenes). */
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
  /** TODO */
  onBeforeRender?: () => void;
  /** TODO */
  onAfterRender?: () => void;
}

/**
 * Represents a render view with specific parameters.
 */
export class RenderView implements ViewParameters {
  public scene: Scene;
  public camera: Camera;
  public viewport: Viewport;
  /** The viewport defining the dimensions and position of the view. */
  public computedViewport = { left: 0, bottom: 0, width: 0, height: 0, top: 0 };
  public name: string;
  public enabled: boolean;
  public backgroundColor: Color;
  public backgroundAlpha: number;
  public composer: EffectComposer;
  private _rendererSize: Vector2;
  private _visible: boolean;
  private _onBeforeRender: () => void;
  private _onAfterRender: () => void;

  public get visible(): boolean { return this._visible }
  public set visible(value: boolean) { 
    if (this._visible === value) return;
    this._visible = value;
    this.scene.needsRender = true;
  }

  constructor(parameters: ViewParameters, rendererSize: Vector2) {
    this._rendererSize = rendererSize;
    this.scene = parameters.scene;
    this.camera = parameters.camera;
    this.viewport = parameters.viewport;
    this.name = parameters.name;
    this._visible = parameters.visible ?? true;
    this.enabled = parameters.enabled ?? true;
    this.backgroundAlpha = parameters.backgroundAlpha;
    this.backgroundColor = typeof parameters.backgroundColor === "number" ? new Color(parameters.backgroundColor) : parameters.backgroundColor;
    this.composer = parameters.composer;
    this._onBeforeRender = parameters.onBeforeRender;
    this._onAfterRender = parameters.onAfterRender;

    this.scene.add(this.camera); // useful to trigger camera resize event
    this.update();
  }

  /**
   * Updates the dimensions of the viewport based on the renderer size.
   */
  public update(): void {
    if (this.viewport !== undefined) {
      this.computedViewport.left = Math.floor(this._rendererSize.x * this.viewport.left);
      this.computedViewport.bottom = Math.floor(this._rendererSize.y * this.viewport.bottom);
      this.computedViewport.width = Math.floor(this._rendererSize.x * this.viewport.width);
      this.computedViewport.height = Math.floor(this._rendererSize.y * this.viewport.height);
      this.computedViewport.top = Math.floor(this._rendererSize.y - this.computedViewport.bottom - this.computedViewport.height);
    } else {
      this.computedViewport.width = this._rendererSize.x;
      this.computedViewport.height = this._rendererSize.y;
    }
    this.composer?.setSize(this.computedViewport.width, this.computedViewport.height);
    this.scene.needsRender = true;
  }

  public onBeforeRender(): void {
    if (this._onBeforeRender !== undefined) {
      this._onBeforeRender();
    }
  }

  public onAfterRender(): void {
    if (this._onAfterRender !== undefined) {
      this._onAfterRender();
    }
  }

}
