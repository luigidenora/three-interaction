import { Scene, WebGLRenderer } from "three";
import { EventsCache } from "../Events/EventsCache";
import { EventExt, RendererResizeEvent } from "../Events/Events";
import { updateMatrices } from "./AutoUpdateMatrix";

export interface RendererInteractionPrototype {
    scenes: Scene[];
    addScene(...scene: Scene[]): void;
    removeScene(scene: Scene): void;
}

export function applyWebGLRendererPatch(renderer: WebGLRenderer): void {
    renderer.scenes = [];

    const baseRender = renderer.render.bind(renderer);
    renderer.render = function (scene: Scene, camera) {
        //TODO smart rendering
        EventsCache.dispatchEvent(scene, "animate", new EventExt()); //TODO correggere
        EventsCache.dispatchEvent(scene, "framerendering", new EventExt());
        updateMatrices();
        //TODO raycasting e trigger eventi
        // updateMatrices();
        baseRender(scene, camera);
    }

    const baseSetSize = renderer.setSize.bind(renderer);
    renderer.setSize = function (width, height, updateStyle?) {
        baseSetSize(width, height, updateStyle);
        for (const scene of this.scenes) {
            EventsCache.dispatchEvent(scene, "rendererresize", new RendererResizeEvent(this, width, height));
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
