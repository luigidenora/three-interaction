import { Camera, Scene, WebGLRenderer as WebGLRendererBase, WebGLRendererParameters } from "three";
import { applyWebGLRendererPatch } from "../Patch/WebGLRenderer";
import { EventsManager } from "../Events/EventsManager";

export class FullScreenWebGLRenderer extends WebGLRendererBase {
    public eventsManager: EventsManager;
    public activeScene: Scene;
    public activeCamera: Camera;

    constructor(scenes: Scene[], animate: XRFrameRequestCallback, parameters: WebGLRendererParameters = {}) {
        super(parameters);
        !parameters.canvas && document.body.appendChild(this.domElement);
        applyWebGLRendererPatch(this);
        this.addScene(...scenes);
        this.activeScene = scenes[0];
        if (this.activeScene) {  //TODO documenta
            for (const obj of this.activeScene.children) {
                if ((obj as unknown as Camera).isCamera) {
                    this.activeCamera = obj as unknown as Camera;
                    break;
                }
            }
        }
        window.addEventListener("resize", () => this.setSize(window.innerWidth, window.innerHeight))
        this.setSize(window.innerWidth, window.innerHeight);
        this.setPixelRatio(window.devicePixelRatio);
        this.eventsManager = new EventsManager(this, scenes[0]);
        this.setAnimationLoop((time, frame) => {
            this.eventsManager.update(this.activeScene, this.activeCamera);
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
