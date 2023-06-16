import { Camera, Clock, Scene, WebGLRenderer, WebGLRendererParameters } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { EventsManager } from "../Events/InteractionEventsManager";
import { applyWebGLRendererPatch } from "../Patch/WebGLRenderer";
import { EventsCache } from "../Events/MiscEventsManager";
import { computeAutoBinding } from "../Binding/Binding";
import { RenderManager } from "../Rendering/RenderManager";

export class Main {
    public renderer: WebGLRenderer;
    public animate: XRFrameRequestCallback;
    public stats = new Stats();
    public renderManager: RenderManager;
    public eventsManager: EventsManager;
    public scenes: Scene[];
    public activeScene: Scene;
    public activeCamera: Camera;
    private _clock = new Clock();

    constructor(fullscreen = true, parameters: WebGLRendererParameters = {}, animate?: XRFrameRequestCallback) {
        this.renderer = new WebGLRenderer(parameters);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        applyWebGLRendererPatch(this.renderer);
        this.eventsManager = new EventsManager(this.renderer);
        this.renderManager = new RenderManager(this.renderer, fullscreen);
        this.renderManager.enabled = false;

        if (parameters.canvas === undefined) {
            document.body.appendChild(this.renderer.domElement);
        }

        this.renderer.setAnimationLoop((time, frame) => {
            // this.eventsManager.update(this.activeScene, this.activeCamera); //TODO cambia
            EventsCache.dispatchEvent(this.activeScene, "animate", { delta: this._clock.getDelta(), total: this._clock.getElapsedTime() });
            computeAutoBinding(this.activeScene);
            this.animateBase(time, frame);
        });

        document.body.appendChild(this.stats.dom);
    }

    private animateBase(time: DOMHighResTimeStamp, frame: XRFrame): void {
        if (this.animate !== undefined) {
            this.animate(time, frame);
        }
        this.render();
        this.stats.update();
    }

    public render() {
        this.renderManager.render();
        // this.renderer.render(this.activeScene, this.activeCamera);
    }

    public addScene(...scene: Scene[]): void {
        this.activeScene = scene[0];
        if (this.activeScene !== undefined) {  //TODO documenta
            for (const obj of this.activeScene.children) {
                if ((obj as unknown as Camera).isCamera === true) {
                    this.activeCamera = obj as unknown as Camera;
                    break;
                }
            }
        }
    }

}
