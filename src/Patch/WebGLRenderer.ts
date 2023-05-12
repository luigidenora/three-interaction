import { Scene, Vector4, WebGLRenderer } from "three";
import { RendererResizeEvent } from "../Events/Events";
import { EventsCache } from "../Events/MiscEventsManager";

const viewportSize = new Vector4();

export function applyWebGLRendererPatch(renderer: WebGLRenderer): void {

    const baseRender = renderer.render.bind(renderer);
    renderer.render = function (scene: Scene, camera) {
        //TODO smart rendering
        if (!this.__isGPUPicking) {
            // EventsCache.dispatchEvent(scene, "framerendering"); metterlo quando c'è multirenderer
            
            this.getViewport(viewportSize);
            if (!camera.userData.rendererViewport) {
                camera.userData.rendererViewport = new Vector4();
            }
            if (!camera.userData.rendererViewport.equals(viewportSize)) {
                //TODO OPT in camera?
                camera.userData.rendererViewport.copy(viewportSize);
                const width = viewportSize.z - viewportSize.x;
                const height = viewportSize.w - viewportSize.y;
                EventsCache.dispatchEvent(scene, "rendererresize", new RendererResizeEvent(this, width, height));
            }

            // updateMatrices();
        } else {
            this.__isGPUPicking = false;
        }
        baseRender(scene, camera);
    }
}
