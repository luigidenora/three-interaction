import { Camera, Color, Scene, Vector2, WebGLRenderer } from "three";
import { RenderView, ViewParameters } from "./RenderView";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { DistinctTargetArray } from "../index";

/**
 * The RenderManager class manages the rendering of views and provides methods for manipulating views and their parameters.
 */
export class RenderManager {
  public renderer: WebGLRenderer;
  public views: RenderView[] = [];
  public activeView: RenderView;
  private _visibleScenes = new DistinctTargetArray<Scene>();
  private _rendererSize = new Vector2();
  private _fullscreen: boolean; // TODO editable?
  private _activeScene: Scene;
  private _activeCamera: Camera;
  private _activeComposer: EffectComposer;
  private _backgroundColor: Color;
  private _backgroundAlpha: number;

  /** todo */
  public get activeScene(): Scene { return this.activeView?.scene ?? this._activeScene };

  /** todo */
  public get activeCamera(): Camera { return this.activeView?.camera ?? this._activeCamera };

  /** todo */
  public get activeComposer(): EffectComposer { return this.activeView?.composer ?? this._activeComposer };

  /** todo */
  public get backgroundColor(): Color { return this._backgroundColor };
  public set backgroundColor(value: Color | number) {
    this._backgroundColor = typeof value === "number" ? new Color(value) : value;
    this.renderer.setClearColor(this._backgroundColor, this._backgroundAlpha);
  };

  /** todo */
  public get backgroundAlpha(): number { return this._backgroundAlpha };
  public set backgroundAlpha(value: number) {
    this._backgroundAlpha = value;
    this.renderer.setClearColor(this._backgroundColor, this._backgroundAlpha);
  };

  /**
   * @param renderer - The WebGL renderer used for rendering.
   * @param fullscreen - Flag indicating whether fullscreen rendering is enabled.
   * @param backgroundColor - The background color for rendering. Default is 0x000000 (black).
   * @param backgroundAlpha - The background alpha value for rendering. Default is 1 (fully opaque).
   */
  constructor(renderer: WebGLRenderer, fullscreen: boolean, backgroundColor: Color | number = 0x000000, backgroundAlpha = 1) {
    this.renderer = renderer;
    this._fullscreen = fullscreen;
    this._backgroundAlpha = backgroundAlpha;
    this._backgroundColor = typeof backgroundColor === "number" ? new Color(backgroundColor) : backgroundColor;
    window.addEventListener("resize", this.onResize.bind(this));
    this.updateRenderSize();
    this.renderer.setClearColor(this._backgroundColor, this._backgroundAlpha);
  }

  /** 
   * Adds a view.
   */
  public add(view: ViewParameters): RenderView {
    const renderView = new RenderView(view, this._rendererSize);
    this.views.push(renderView);
    return renderView;
  }

  /**
   * Retrieves a view by its name.
   */
  public getByName(name: string): RenderView {
    for (let i = 0; i < this.views.length; i++) {
      if (this.views[i].name === name) {
        return this.views[i];
      }
    }
  }

  /**
   * Removes a view.
   */
  public remove(view: RenderView): void {
    const index = this.views.indexOf(view);
    if (index !== -1) {
      this.views.splice(index, 1);
    }
    if (this.views.length === 0) {
      this.setDefaultRendererParameters();
    }
  }

  /**
   * Removes a view by its name.
   */
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

  /**
   * Removes all views.
   */
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

  /**
   * Returns an array of visible scenes.
   */
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

  /**
   * Updates the active view based on the mouse position.
   */
  public updateActiveView(mouse: Vector2): void {
    this.activeView = this.getViewByMouse(mouse);
  }

  /**
   * Retrieves the view based on the mouse position.
   */
  public getViewByMouse(mouse: Vector2): RenderView {
    for (let i = this.views.length - 1; i >= 0; i--) {
      const view = this.views[i];
      const v = view.viewport;
      if (view.visible === true && v.left <= mouse.x && v.left + v.width >= mouse.x && v.bottom <= mouse.y && v.bottom + v.height >= mouse.y) {
        return view;
      }
    }
  }

  /**
   * Retrieves the ray origin based on the mouse position.
   */
  public getNormalizedMouse(mouse: Vector2, target: Vector2): Vector2 {
    this.updateActiveView(mouse);
    if (this.activeView !== undefined) {
      const viewport = this.activeView.viewport;
      return target.set((mouse.x - viewport.left) / viewport.width * 2 - 1, (mouse.y - viewport.bottom) / viewport.height * -2 + 1);
    } else {
      return target.set(mouse.x / this.renderer.domElement.clientWidth * 2 - 1, mouse.y / this.renderer.domElement.clientHeight * -2 + 1);
    }
  }

  /**
   * Performs rendering.
   * If there are active views, each view is rendered individually.
   * If there are no active views, the scene is rendered using the provided scene and camera.
   */
  public render(scene?: Scene, camera?: Camera, composer?: EffectComposer): void {
    if (this.views.length > 0) {
      for (const view of this.views) {
        if (view.visible === true) { // TODO element.scene.needsRender
          const v = view.viewport;
          this.renderer.setScissorTest(view.viewportNormalized !== undefined);
          this.renderer.setViewport(v.left, v.bottom, v.width, v.height);
          this.renderer.setScissor(v.left, v.bottom, v.width, v.height);
          this.renderer.setClearColor(view.backgroundColor ?? this._backgroundColor, view.backgroundAlpha ?? this._backgroundAlpha);
          view.onBeforeRender();
          this.executeRender(view.scene, view.camera, view.composer);
          view.onAfterRender();
        }
      }
    } else {
      this.executeRender(scene, camera, composer);
    }
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

  public setActiveScene(scene: Scene, camera: Camera, composer?: EffectComposer) {
    this._activeScene = scene;
    this._activeCamera = camera;
    this._activeComposer = composer;
  }

}
