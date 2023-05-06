import { Clock, Scene, WebGLRenderer } from "three";
import { RendererResizeEvent } from "../Events/Events";
import { EventsCache } from "../Events/MiscEventsManager";
import { updateMatrices } from "./AutoUpdateMatrix";

export interface WebGLRendererInteractionPrototype {
    scenes: Scene[];
    addScene(...scene: Scene[]): void;
    removeScene(scene: Scene): void;
}

export function applyWebGLRendererPatch(renderer: WebGLRenderer): void {
    renderer.scenes = [];

    const clock = new Clock();
    const baseRender = renderer.render.bind(renderer);
    renderer.render = function (scene: Scene, camera) {
        //TODO smart rendering
        if (!this._isGPUPicking) {
            EventsCache.dispatchEvent(scene, "animate", { delta: clock.getDelta(), total: clock.getElapsedTime() }); //TODO correggere
            EventsCache.dispatchEvent(scene, "framerendering");
            updateMatrices();
        } else {
            this._isGPUPicking = false;
        }
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
