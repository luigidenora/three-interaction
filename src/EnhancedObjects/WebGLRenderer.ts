import { Scene, WebGLRenderer as WebGLRendererBase, WebGLRendererParameters } from "three";
import { applyWebGLRendererPatch } from "../Patch/WebGLRenderer";
import { EventsManager } from "../Events/EventsManager";

export class FullScreenWebGLRenderer extends WebGLRendererBase {
    public eventsManager: EventsManager;
    public activeScene: Scene;

    constructor(scenes: Scene[], animate: XRFrameRequestCallback, parameters?: WebGLRendererParameters) {
        super(parameters);
        !parameters.canvas && document.body.appendChild(this.domElement);
        applyWebGLRendererPatch(this);
        this.addScene(...scenes);
        this.activeScene = scenes[0];
        window.addEventListener("resize", () => this.setSize(window.innerWidth, window.innerHeight))
        this.setSize(window.innerWidth, window.innerHeight);
        this.setPixelRatio(window.devicePixelRatio);
        this.eventsManager = new EventsManager(this, scenes[0]);
        this.setAnimationLoop((time, frame) => {
            this.eventsManager.update(this.activeScene, this.activeScene.camera); //TODO fix camera ref
            animate(time, frame);
        });
    }
}

export class ResponsiveWebGLRenderer extends WebGLRendererBase {

    constructor(scenes: Scene[], parameters?: WebGLRendererParameters) {
        super(parameters);
        console.error("ResponsiveWebGLRenderer missing implementation.");
    }
}
