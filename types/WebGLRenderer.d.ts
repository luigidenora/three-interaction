import { Scene } from "three";
import { WebGLRenderer as WebGLRendererBase } from "three/index";
import { WebGLRendererInteractionPrototype } from "../src/Patch/WebGLRenderer";

export class WebGLRenderer extends WebGLRendererBase implements WebGLRendererInteractionPrototype {
    scenes: Scene[];
    addScene(...scene: Scene[]): void;
    removeScene(scene: Scene): void;
    /** @internal */
    _isGPUPicking: boolean;
}
