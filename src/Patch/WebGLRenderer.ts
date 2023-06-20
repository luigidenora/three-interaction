import { Camera, Scene, Vector4, WebGLRenderer } from "three";
import { RendererResizeEvent } from "../Events/Events";
import { EventsCache } from "../Events/MiscEventsManager";

const viewportSize = new Vector4();
const lastViewportSize = new Vector4();

export function applyWebGLRendererPatch(renderer: WebGLRenderer): void {

    const baseRender = renderer.render.bind(renderer);
    renderer.render = function (scene: Scene, camera: Camera) {
        //TODO smart rendering
        
        this.getViewport(viewportSize);
        handleRendererResize(this, scene);

        if (!this.__isGPUPicking) {
            // EventsCache.dispatchEvent(scene, "framerendering"); metterlo quando c'è multirenderer
        } else {
            this.__isGPUPicking = false;
        }
        baseRender(scene, camera);
    }
}

function handleRendererResize(renderer: WebGLRenderer, scene: Scene): void {
    if (lastViewportSize.z !== viewportSize.z || lastViewportSize.w !== viewportSize.w) {
        lastViewportSize.copy(viewportSize);
        EventsCache.dispatchEvent(scene, "rendererresize", new RendererResizeEvent(renderer, viewportSize.z, viewportSize.w));
    }
}
