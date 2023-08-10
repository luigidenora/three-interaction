import { Camera, Color, ColorRepresentation, Scene, Vector2, WebGLRenderer, WebGLRendererParameters } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { applyWebGLRendererPatch } from "../Patch/WebGLRenderer";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";
import { RenderView, ViewParameters } from "./RenderView";

/**
 * The RenderManager class manages the rendering of views and provides methods for manipulating views and their parameters.
 */
export class RenderManager {
  public renderer: WebGLRenderer;
  public views: RenderView[] = [];
  public activeView: RenderView;
  public hoveredView: RenderView;
  private _visibleScenes = new DistinctTargetArray<Scene>();
  private _rendererSize = new Vector2();
  private _fullscreen: boolean; // TODO editable?
  private _backgroundColor: Color;
  private _backgroundAlpha: number;

  public get activeScene(): Scene { return this.activeView?.scene }

  public get backgroundColor(): Color { return this._backgroundColor }
  public set backgroundColor(value: ColorRepresentation) {
    this._backgroundColor = new Color(value);
    this.renderer.setClearColor(this._backgroundColor, this._backgroundAlpha);
  }

  public get backgroundAlpha(): number { return this._backgroundAlpha }
  public set backgroundAlpha(value: number) {
    this._backgroundAlpha = value;
    this.renderer.setClearColor(this._backgroundColor, this._backgroundAlpha);
  }

  constructor(parameters: WebGLRendererParameters = {}, fullscreen = true, backgroundColor: ColorRepresentation = 0x000000, backgroundAlpha = 1) {
    this.renderer = new WebGLRenderer(parameters);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    applyWebGLRendererPatch(this.renderer);
    this.appendCanvas(parameters);
    this._fullscreen = fullscreen;
    this._backgroundAlpha = backgroundAlpha;
    this._backgroundColor = new Color(backgroundColor);
    window.addEventListener("resize", this.onResize.bind(this));
    this.updateRenderSize();
    this.renderer.setClearColor(this._backgroundColor, this._backgroundAlpha);
  }

  private appendCanvas(rendererParameters: WebGLRendererParameters): void {
    if (rendererParameters.canvas === undefined) {
      document.body.appendChild(this.renderer.domElement);
    }
  }

  public create(view: ViewParameters): RenderView {
    const renderView = new RenderView(view, this._rendererSize);
    this.views.push(renderView);
    return renderView;
  }

  public add(view: RenderView): void {
    if (this.views.indexOf(view) !== -1) return;
    this.views.push(view);
  }

  public getByName(name: string): RenderView {
    for (const view of this.views) {
      if (view.name === name) {
        return view;
      }
    }
  }
  public remove(view: RenderView): void {
    const index = this.views.indexOf(view);
    if (index !== -1) {
      this.views.splice(index, 1);
    }
    if (this.views.length === 0) {
      this.setDefaultRendererParameters();
    }
  }

  public removeByName(name: string): void {
    for (let i = 0; i < this.views.length; i++) {
      if (this.views[i].name === name) {
        this.views.splice(i, 1);
        if (this.views.length === 0) {
          this.setDefaultRendererParameters();
        }
        return;
      }
    }
  }

  public clear(): void {
    this.views = [];
    this.setDefaultRendererParameters();
  }

  private setDefaultRendererParameters(): void {
    this.renderer.setScissorTest(false);
    this.renderer.setViewport(0, 0, this._rendererSize.width, this._rendererSize.height);
    this.renderer.setScissor(0, 0, this._rendererSize.width, this._rendererSize.height);
    this.renderer.setClearColor(this._backgroundColor, this._backgroundAlpha);
  }

  public getVisibleScenes(): Scene[] {
    if (this.views.length === 0) return undefined;
    this._visibleScenes.clear();
    for (const view of this.views) {
      if (view.visible === true) {
        this._visibleScenes.push(view.scene);
      }
    }
    return this._visibleScenes.data;
  }

  public updateActiveView(mouse: Vector2): void {
    this.hoveredView = this.getViewByMouse(mouse);
    if (this.hoveredView) {
      this.activeView = this.hoveredView;
    }
  }

  public getViewByMouse(mouse: Vector2): RenderView {
    for (let i = this.views.length - 1; i >= 0; i--) {
      const view = this.views[i];
      const v = view.computedViewport;
      if (view.visible === true && v.left <= mouse.x && v.left + v.width >= mouse.x && v.top <= mouse.y && v.top + v.height >= mouse.y) {
        return view;
      }
    }
  }

  private isRenderNecessary(): boolean {
    for (const view of this.views) {
      if (view.visible === true && view.scene.needsRender === true) {
        return true;
      }
    }
    return false;
  }

  public render(): boolean {
    if (!this.isRenderNecessary()) return false;
    for (const view of this.views) {
      if (view.visible === true) {
        const v = view.computedViewport;
        this.renderer.setScissorTest(view.viewport !== undefined);
        this.renderer.setViewport(v.left, v.bottom, v.width, v.height);
        this.renderer.setScissor(v.left, v.bottom, v.width, v.height);
        this.renderer.setClearColor(view.backgroundColor ?? this._backgroundColor, view.backgroundAlpha ?? this._backgroundAlpha);
        view.onBeforeRender();
        this.executeRender(view.scene, view.camera, view.composer);
        view.onAfterRender();
      }
    }
    return true;
  }

  private executeRender(scene?: Scene, camera?: Camera, composer?: EffectComposer): void {
    if (composer !== undefined) {
      composer.render();
    } else {
      this.renderer.render(scene, camera);
    }
  }

  private onResize(): void {
    this.updateRenderSize();
    for (const view of this.views) {
      view.update();
    }
  }

  private updateRenderSize(): void {
    if (this._fullscreen === true) {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    } else {
      const { width, height } = this.renderer.domElement.getBoundingClientRect();
      this.renderer.setSize(width, height, false);
    }
    this.renderer.getSize(this._rendererSize);
  }

  //TODO metodo per settare unica scena visibile

}
