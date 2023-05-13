import { Camera, Clock, Scene, WebGLRenderer as WebGLRendererBase, WebGLRendererParameters } from "three";
import { applyWebGLRendererPatch } from "../Patch/WebGLRenderer";
import { EventsManager } from "../Events/InteractionEventsManager";
import { computeAutoBinding } from "../Binding/Binding";
import { EventsCache } from "../Events/MiscEventsManager";

export class WebGLRenderer extends WebGLRendererBase {
    public eventsManager: EventsManager;
    public activeScene: Scene;
    public activeCamera: Camera;
    public fullscreen: boolean;
    private _clock = new Clock();

    constructor(scenes: Scene[], animate: XRFrameRequestCallback, fullscreen = true, parameters: WebGLRendererParameters = {}) {
        super(parameters);
        this.fullscreen = fullscreen;
        !parameters.canvas && document.body.appendChild(this.domElement);
        applyWebGLRendererPatch(this);
        this.activeScene = scenes[0];
        if (this.activeScene) {  //TODO documenta
            for (const obj of this.activeScene.children) {
                if ((obj as unknown as Camera).isCamera) {
                    this.activeCamera = obj as unknown as Camera;
                    break;
                }
            }
        }
        window.addEventListener("resize", () => this.setSizeByCanvas())
        this.setSizeByCanvas();
        this.setPixelRatio(window.devicePixelRatio);
        this.eventsManager = new EventsManager(this);
        this.setAnimationLoop((time, frame) => {
            computeAutoBinding(this.activeScene);
            this.eventsManager.update(this.activeScene, this.activeCamera);
            EventsCache.dispatchEvent(this.activeScene, "animate", { delta: this._clock.getDelta(), total: this._clock.getElapsedTime() });
            animate(time, frame);
        });
    }

    public setSizeByCanvas(): void {
        if (this.fullscreen) {
            this.setSize(window.innerWidth, window.innerHeight);
        } else {
            const { width, height } = this.domElement.getBoundingClientRect();
            this.setSize(width, height, false);
        }
    }
}
