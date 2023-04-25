import { Scene, WebGLRenderer } from "three";
import { EventsCache } from "../Events/EventsCache";
import { RendererResizeEvent } from "../Events/Events";

export interface RendererInteractionPrototype {
    scenes: Scene[];
    addScene(...scene: Scene[]): void;
    removeScene(scene: Scene): void;
}

/** @internal */
export function applyWebGLRendererPatch(renderer: WebGLRenderer): void {
    renderer.scenes = [];

    const base = renderer.setSize.bind(renderer);
    renderer.setSize = function (width: number, height: number, updateStyle?: boolean) {
        base(width, height, updateStyle);
        for (const scene of this.scenes) {
            EventsCache.trigger(scene, "rendererresize", new RendererResizeEvent(this, width, height));
        }
    }

    renderer.addScene = function (...scenes: Scene[]) {
        for (const scene of scenes) {
            if (this.scenes.indexOf(scene) === -1) {
                this.scenes.push(scene);
            }
        }
    }

    renderer.removeScene = function (scene: Scene) {
        const index = this.scenes.indexOf(scene)
        if (index !== -1) {
            this.scenes.splice(index, 1);
        }
    }
}
