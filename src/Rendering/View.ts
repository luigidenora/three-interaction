import { Camera, Color, Scene } from "three";
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
  visible?: boolean;
  backgroundColor?: Color | number;
  backgroundAlpha?: number;
  composer?: EffectComposer;
}

export class View {
  public scene: Scene;
  public camera: Camera;
  public viewport: Viewport;
  public name: string;
  public visible: boolean;
  public backgroundColor: Color;
  public backgroundAlpha: number;
  public viewportScreen: Viewport = {};

  constructor(parameters: ViewParameters, domElement: HTMLCanvasElement) {
    this.scene = parameters.scene;
    this.camera = parameters.camera;
    this.viewport = parameters.viewport;
    this.name = parameters.name;
    this.visible = parameters.visible ?? true;
    this.backgroundAlpha = parameters.backgroundAlpha;
    this.backgroundColor = typeof parameters.backgroundColor === "number" ? new Color(parameters.backgroundColor) : parameters.backgroundColor;

    this.scene.add(this.camera);
    this.update(domElement);
  }

  public update(domElement: HTMLCanvasElement): void {
    const width = domElement.clientWidth;
    const height = domElement.clientHeight;
    this.viewportScreen.left = Math.floor(width * this.viewport.left);
    this.viewportScreen.top = Math.floor(height * this.viewport.top);
    this.viewportScreen.width = Math.floor(width * this.viewport.width);
    this.viewportScreen.height = Math.floor(height * this.viewport.height);
  }
  
}
