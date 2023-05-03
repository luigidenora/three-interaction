import { Scene, WebGLRenderer } from "three";
export interface WebGLRendererInteractionPrototype {
    scenes: Scene[];
    addScene(...scene: Scene[]): void;
    removeScene(scene: Scene): void;
}
export declare function applyWebGLRendererPatch(renderer: WebGLRenderer): void;
