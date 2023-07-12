import { Camera, Scene, Vector4, WebGLRenderer } from "three";
import { RendererResizeEvent } from "../Events/Events";
import { EventsCache } from "../Events/MiscEventsManager";

const viewportSize = new Vector4();
const lastViewportSizes: { [x: number]: Vector4 } = {};

export function applyWebGLRendererPatch(renderer: WebGLRenderer): void {
    const baseRender = renderer.render.bind(renderer);
    renderer.render = function (scene: Scene, camera: Camera) {
        this.getViewport(viewportSize);
        handleRendererResize(this, scene, camera);
        baseRender(scene, camera);
    }
}

function handleRendererResize(renderer: WebGLRenderer, scene: Scene, camera: Camera): void {
    let event: RendererResizeEvent;

    if (!lastViewportSizes[scene.id]) {
        lastViewportSizes[scene.id] = new Vector4(-1);
    }

    const lastSceneSize = lastViewportSizes[scene.id];
    if (lastSceneSize.z !== viewportSize.z || lastSceneSize.w !== viewportSize.w) {
        lastSceneSize.copy(viewportSize);
        event = new RendererResizeEvent(renderer, camera, viewportSize.z, viewportSize.w);
        EventsCache.dispatchEventExcludeCameras(scene, "rendererresize", event);
    }

    if (!lastViewportSizes[camera.id]) {
        lastViewportSizes[camera.id] = new Vector4(-1);
    }

    const lastCameraSize = lastViewportSizes[camera.id];
    if (lastCameraSize.z !== viewportSize.z || lastCameraSize.w !== viewportSize.w) {
        lastCameraSize.copy(viewportSize);
        camera.__eventsDispatcher.dispatchEvent("rendererresize", event ?? new RendererResizeEvent(renderer, camera, viewportSize.z, viewportSize.w));
    }
}
