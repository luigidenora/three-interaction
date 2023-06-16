import { Scene, Color, EventDispatcher, Vector2, WebGLRenderer, Camera } from "three";
import { RenderView as RenderView, ViewParameters } from "./RenderView";

export class RenderManager extends EventDispatcher {
  public views: RenderView[] = [];
  public activeView: RenderView;
  public backgroundColor: Color; //todo getter
  public backgroundAlpha: number; //todo getter
  public fullscreen: boolean; // TODO renderlo modificabile
  private _renderer: WebGLRenderer;
  private _rendererSize = new Vector2();

  constructor(renderer: WebGLRenderer, fullscreen: boolean, backgroundColor: Color | number = 0x000000, backgroundAlpha = 1) {
    super();
    this._renderer = renderer;
    this.fullscreen = fullscreen;
    this.backgroundAlpha = backgroundAlpha;
    this.backgroundColor = typeof backgroundColor === "number" ? new Color(backgroundColor) : backgroundColor;
    window.addEventListener("resize", this.onResize.bind(this));
    this.updateRenderSize();
    this._renderer.setClearColor(this.backgroundColor, this.backgroundAlpha);
  }

  public add(...views: ViewParameters[]): void {
    for (const view of views) {
      this.views.push(new RenderView(view, this._rendererSize));
    }
  }

  public getByName(name: string): RenderView {
    for (let i = 0; i < this.views.length; i++) {
      if (this.views[i].name === name) {
        return this.views[i];
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
    this._renderer.setScissorTest(false);
    this._renderer.setViewport(0, 0, this._rendererSize.width, this._rendererSize.height);
    this._renderer.setScissor(0, 0, this._rendererSize.width, this._rendererSize.height);
    this._renderer.setClearColor(this.backgroundColor, this.backgroundAlpha);
  }

  public updateActiveView(mouse: Vector2): void {
    this.activeView = this.getViewByMouse(mouse);
  }

  public getViewByMouse(mouse: Vector2): RenderView {
    for (let i = this.views.length - 1; i >= 0; i--) {
      const view = this.views[i];
      const v = view.viewport;
      if (view.visible === true && v.left <= mouse.x && v.left + v.width >= mouse.x && v.top <= mouse.y && v.top + v.height >= mouse.y) {
        return view;
      }
    }
  }

  public getRayOrigin(mouse: Vector2, target: Vector2): Vector2 {
    this.updateActiveView(mouse);
    if (this.activeView.enabled === true) {
      const viewport = this.activeView.viewport;
      return target.set((mouse.x - viewport.left) / viewport.width * 2 - 1, (mouse.y - viewport.top) / viewport.height * -2 + 1);
    }
  }

  public render(scene: Scene, camera: Camera): void {
    if (this.views.length > 0) {
      for (const view of this.views) {
        if (view.visible === true) { // TODO element.scene.needsRender
          const v = view.viewport;
          this._renderer.setScissorTest(view.viewportNormalized !== undefined);
          this._renderer.setViewport(v.left, v.top, v.width, v.height);
          this._renderer.setScissor(v.left, v.top, v.width, v.height);
          this._renderer.setClearColor(view.backgroundColor ?? this.backgroundColor, view.backgroundAlpha ?? this.backgroundAlpha);
          this._renderer.render(view.scene, view.camera);
        }
      }
    } else {
      this._renderer.render(scene, camera);
    }
  }

  private onResize(): void {
    this.updateRenderSize();
    for (const view of this.views) {
      view.update();
    }
  }

  private updateRenderSize(): void {
    if (this.fullscreen === true) {
      this._renderer.setSize(window.innerWidth, window.innerHeight);
    } else {
      const { width, height } = this._renderer.domElement.getBoundingClientRect();
      this._renderer.setSize(width, height, false);
    }
    this._renderer.getSize(this._rendererSize);
  }

}