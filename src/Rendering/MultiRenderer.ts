import { Color, EventDispatcher, Vector2, WebGLRenderer } from "three";
import { View } from "./View";

export class MultiRenderer extends EventDispatcher {
  public renderer: WebGLRenderer;
  public views: View[] = [];
  private _activeView: View;
  private backgroundColor: Color;
  private backgroundAlpha: number;

  constructor(renderer: WebGLRenderer, backgroundColor: Color | number = 0x000000, backgroundAlpha = 1) {
    super();
    this.renderer = renderer;
    this.backgroundAlpha = backgroundAlpha;
    this.backgroundColor = typeof backgroundColor === "number" ? new Color(backgroundColor) : backgroundColor;
  }

  public add(...views: View[]): void {
    this.views.push(...views);
  }

  public remove(view: View): void {
    const index = this.views.indexOf(view);
    if (index !== -1) {
      this.views.splice(index, 1);
    }
  }

  public removeByName(name: string): void {
    for (const view of this.views) {
      if (view.name === name) {
        this.remove(view);
        return;
      }
    }
  }

  public updateActiveView(mouse: Vector2): void {
    this._activeView = this.getViewportByMouse(mouse);
  }

  public getViewportByMouse(mouse: Vector2): View {
    for (const view of this.views) { //todo this could be optimized
      if (view.visible === true &&
        view.viewportScreen.left <= mouse.x && view.viewportScreen.left + view.viewportScreen.width >= mouse.x &&
        view.viewportScreen.top <= mouse.y && view.viewportScreen.top + view.viewportScreen.height >= mouse.y) {
        return view;
      }
    }
  }

  public getRaycasterCoords(mouse: Vector2, target: Vector2): Vector2 {
    if (this._renderMultiViews) {
      this.getRayOrigin(mouse, this._activeView, target);
      if (Math.max(Math.abs(target.x), Math.abs(target.y)) > 1) {
        this.cursorOnViewport = false;
        target.x = Math.max(-1, Math.min(1, target.x));
        target.y = Math.max(-1, Math.min(1, target.y));
      } else {
        this.cursorOnViewport = true;
      }
    }
    else {
      target.x = (mouse.x / this._canvasContainer.clientWidth) * 2 - 1;
      target.y = -(mouse.y / this._canvasContainer.clientHeight) * 2 + 1;
    }
    return target;
  }

  public getRayOrigin(mouse: Vector2, view: View, target: Vector2): Vector2 {
    target.x = ((mouse.x - view.computedParameters.left) / view.computedParameters.width) * 2 - 1;
    target.y = -((mouse.y - view.computedParameters.topReversed) / view.computedParameters.height) * 2 + 1;
    return target;
  }

  public render(): boolean {
    let rendered = false;
    for (const view of this.views) {
      rendered = this.renderView(view) || rendered;
    }
    return rendered;
  }

  private renderView(view: View): boolean {
    if (view.visible) { // element.scene.needsRender
      const params = view.viewportScreen;
      this.renderer.setViewport(params.left, params.top, params.width, params.height);
      this.renderer.setScissor(params.left, params.top, params.width, params.height);
      this.renderer.setClearColor(view.backgroundColor ?? this.backgroundColor, view.backgroundAlpha ?? this.backgroundAlpha);
      this.renderer.render(view.scene, view.camera);
      return true;
    }
  }

}