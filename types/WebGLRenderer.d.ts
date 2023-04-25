import { WebGLRenderer as WebGLRendererBase } from "three/index";
import { Scene } from "three";
import { RendererInteractionPrototype } from "../src/Patch/WebGLRenderer";

export class WebGLRenderer extends WebGLRendererBase  implements RendererInteractionPrototype {
    scenes: Scene[];
    addScene(...scene: Scene[]): void;
    removeScene(scene: Scene): void;
}
