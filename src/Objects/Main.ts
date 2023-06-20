import { Camera, Clock, Scene, WebGLRenderer, WebGLRendererParameters } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { InteractionManager } from "../Events/InteractionManager";
import { applyWebGLRendererPatch } from "../Patch/WebGLRenderer";
import { EventsCache } from "../Events/MiscEventsManager";
import { computeAutoBinding } from "../Binding/Binding";
import { RenderManager } from "../Rendering/RenderManager";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

export interface MainParameters {
    animate?: XRFrameRequestCallback;
    fullscreen?: boolean;
    scenes: Scene[];
    showStats: boolean; // TODO
    smartRendering: boolean; // TODO
}

export class Main {
    public renderer: WebGLRenderer;
    public renderManager: RenderManager;
    public interactionManager: InteractionManager;
    public stats = new Stats();
    public scenes: Scene[] = [];
    public activeScene: Scene; //TODO autoupdate if multiview
    public activeCamera: Camera; //TODO autoupdate if multiview
    public activeComposer: EffectComposer;
    private _animate: XRFrameRequestCallback;
    private _clock = new Clock();

    constructor(parameters: MainParameters, rendererParameters: WebGLRendererParameters = {}) {
        this.renderer = new WebGLRenderer(rendererParameters);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        applyWebGLRendererPatch(this.renderer);
        this.interactionManager = new InteractionManager(this.renderer);
        this.renderManager = new RenderManager(this.renderer, parameters.fullscreen ?? true);
        this._animate = parameters.animate;

        if (rendererParameters.canvas === undefined) {
            document.body.appendChild(this.renderer.domElement);
        }

        document.body.appendChild(this.stats.dom);

        this.addScene(...parameters.scenes);

        this.renderer.setAnimationLoop((time, frame) => {
            this.interactionManager.update(this.activeScene, this.activeCamera);

            const visibleScenes = this.renderManager.getVisibleScenes() ?? [this.activeScene];
            for (const scene of visibleScenes) {
                EventsCache.dispatchEvent(scene, "animate", { delta: this._clock.getDelta(), total: this._clock.getElapsedTime() });
                computeAutoBinding(scene);
            }

            this.animate(time, frame);
            this.renderManager.render(this.activeScene, this.activeCamera, this.activeComposer);
            this.stats.update();
        });
    }

    private animate(time: DOMHighResTimeStamp, frame: XRFrame): void {
        if (this._animate !== undefined) {
            this._animate(time, frame);
        }
    }

    public addScene(...scene: Scene[]): void {
        this.scenes.push(...scene);
        if (this.activeScene !== undefined) {  //TODO documenta
            this.activeScene = scene[0];
            for (const obj of this.activeScene.children) {
                if ((obj as unknown as Camera).isCamera === true) {
                    this.activeCamera = obj as unknown as Camera;
                    break;
                }
            }
        }
    }

    public setActiveScene(scene?: Scene, camera?: Camera, composer?: EffectComposer) {
        this.activeScene = scene;
        this.activeCamera = camera;
        this.activeComposer = composer;
    }

}
