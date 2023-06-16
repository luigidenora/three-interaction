import { Scene, Color, EventDispatcher, Vector2, WebGLRenderer, Camera } from "three";
import { RenderViewport as RenderViewport, ViewParameters } from "./RenderViewport";

export class RenderManager extends EventDispatcher {
  public renderer: WebGLRenderer;
  public views: RenderViewport[] = [];
  public activeScene: Scene;
  public activeCamera: Camera;
  public activeViewport: RenderViewport;
  public backgroundColor: Color; //todo getter
  public backgroundAlpha: number; //todo getter
  public fullscreen: boolean; // TODO renderlo modificabile
  public renderScene = true;
  public renderViewports = true;
  private _rendererSize = new Vector2();

  constructor(renderer: WebGLRenderer, fullscreen: boolean, backgroundColor: Color | number = 0x000000, backgroundAlpha = 1) {
    super();
    this.renderer = renderer;
    this.fullscreen = fullscreen;
    this.backgroundAlpha = backgroundAlpha;
    this.backgroundColor = typeof backgroundColor === "number" ? new Color(backgroundColor) : backgroundColor;
    window.addEventListener("resize", this.onResize.bind(this));
    this.updateRenderSize();
  }

  public addViewport(...views: ViewParameters[]): void {
    for (const view of views) {
      this.views.push(new RenderViewport(view, this._rendererSize));
    }
  }

  public removeByName(name: string): void {
    for (let i = 0; i < this.views.length; i++) {
      if (this.views[i].name === name) {
        this.views.splice(i, 1);
        return;
      }
    }
  }

  public clear(): void {
    this.views = [];
  }

  public updateActiveView(mouse: Vector2): void {
    this.activeViewport = this.getViewportByMouse(mouse);
  }

  public getViewportByMouse(mouse: Vector2): RenderViewport {
    for (const view of this.views) {
      const v = view.viewport;
      if (view.enabled === true && v.left <= mouse.x && v.left + v.width >= mouse.x && v.top <= mouse.y && v.top + v.height >= mouse.y) {
        return view;
      }
    }
  }

  public getRayOrigin(mouse: Vector2, target: Vector2): Vector2 {
    if (this._renderViewports === true) { //check solo se enabled TODO
      const viewport = this.activeViewport.viewport;
      target.set((mouse.x - viewport.left) / viewport.width * 2 - 1, (mouse.y - viewport.top) / viewport.height * -2 + 1);
    } else {
      target.set(mouse.x / this.renderer.domElement.clientWidth * 2 - 1, mouse.y / this.renderer.domElement.clientHeight * -2 + 1);
    }
    return target;
  }

  public render(): void {
    if (this.renderScene) {
      this.renderer.setScissorTest(false);
      this.renderer.setViewport(0, 0, this._rendererSize.x, this._rendererSize.y);
      this.renderer.setScissor(0, 0, this._rendererSize.x, this._rendererSize.y);
      this.renderer.setClearColor(this.backgroundColor, this.backgroundAlpha);
      this.renderer.render(this.activeScene, this.activeCamera);
    }

    if (this.renderViewports) {
      this.renderer.setScissorTest(true);
      for (const view of this.views) {
        this.renderView(view);
      }
    }
  }

  private renderView(view: RenderViewport): void {
    if (view.enabled === true) { // element.scene.needsRender
      const v = view.viewport;
      this.renderer.setViewport(v.left, v.top, v.width, v.height);
      this.renderer.setScissor(v.left, v.top, v.width, v.height);
      this.renderer.setClearColor(view.backgroundColor ?? this.backgroundColor, view.backgroundAlpha ?? this.backgroundAlpha);
      this.renderer.render(view.scene, view.camera);
    }
  }

  private onResize(): void {
    this.updateRenderSize();
    for (const view of this.views) {
      view.update();
    }
  }

  public updateRenderSize(): void {
    if (this.fullscreen === true) {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    } else {
      const { width, height } = this.renderer.domElement.getBoundingClientRect();
      this.renderer.setSize(width, height, false);
    }
    this.renderer.getSize(this._rendererSize);
  }

}