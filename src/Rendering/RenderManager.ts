import { Color, EventDispatcher, Vector2, WebGLRenderer } from "three";
import { RenderView, ViewParameters } from "./RenderView";

export class RenderManager extends EventDispatcher {
  public renderer: WebGLRenderer;
  public views: RenderView[] = [];
  public activeView: RenderView;
  public backgroundColor: Color; //todo getter
  public backgroundAlpha: number; //todo getter
  public fullscreen: boolean; // TODO renderlo modificabile
  private _enabled: boolean;
  private _rendererSize = new Vector2();

  public get enabled(): boolean { return this._enabled }
  public set enabled(value: boolean) {
    this.activeView = undefined;
    this.renderer.setScissorTest(value);
    this.renderer.setViewport(0, 0, this._rendererSize.x, this._rendererSize.y);
    this.renderer.setScissor(0, 0, this._rendererSize.x, this._rendererSize.y);
    this.renderer.setClearColor(this.backgroundColor, this.backgroundAlpha);
    this._enabled = value;
  }

  constructor(renderer: WebGLRenderer, fullscreen: boolean, backgroundColor: Color | number = 0x000000, backgroundAlpha = 1) {
    super();
    this.renderer = renderer;
    this.fullscreen = fullscreen;
    this.backgroundAlpha = backgroundAlpha;
    this.backgroundColor = typeof backgroundColor === "number" ? new Color(backgroundColor) : backgroundColor;
    this.enabled = true;
    window.addEventListener("resize", this.onResize.bind(this));
    this.updateRenderSize();
  }

  public add(...views: ViewParameters[]): void {
    for (const view of views) {
      this.views.push(new RenderView(view, this._rendererSize));
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
    this.activeView = this.getViewportByMouse(mouse);
  }

  public getViewportByMouse(mouse: Vector2): RenderView {
    for (const view of this.views) {
      const v = view.viewport;
      if (view.enabled === true && v.left <= mouse.x && v.left + v.width >= mouse.x && v.top <= mouse.y && v.top + v.height >= mouse.y) {
        return view;
      }
    }
  }

  public getRayOrigin(mouse: Vector2, target: Vector2): Vector2 {
    if (this._enabled === true) {
      const viewport = this.activeView.viewport;
      target.set((mouse.x - viewport.left) / viewport.width * 2 - 1, (mouse.y - viewport.top) / viewport.height * -2 + 1);
    } else {
      target.set(mouse.x / this.renderer.domElement.clientWidth * 2 - 1, mouse.y / this.renderer.domElement.clientHeight * -2 + 1);
    }
    return target;
  }

  public render(): boolean {
    let rendered = false;
    for (const view of this.views) {
      rendered = this.renderView(view) || rendered;
    }
    return rendered;
  }

  private renderView(view: RenderView): boolean {
    if (view.enabled === true) { // element.scene.needsRender
      const v = view.viewport;
      this.renderer.setViewport(v.left, v.top, v.width, v.height);
      this.renderer.setScissor(v.left, v.top, v.width, v.height);
      this.renderer.setClearColor(view.backgroundColor ?? this.backgroundColor, view.backgroundAlpha ?? this.backgroundAlpha);
      this.renderer.render(view.scene, view.camera);
      return true;
    }
    return false;
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