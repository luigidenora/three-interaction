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
    private _animate: XRFrameRequestCallback;
    private _clock = new Clock();

    public get activeScene(): Scene { return this.renderManager.activeScene };
    public get activeCamera(): Camera { return this.renderManager.activeCamera };
    public get activeComposer(): EffectComposer { return this.renderManager.activeComposer };

    constructor(parameters: MainParameters, rendererParameters: WebGLRendererParameters = {}) {
        this.renderer = new WebGLRenderer(rendererParameters);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        applyWebGLRendererPatch(this.renderer);
        this.renderManager = new RenderManager(this.renderer, parameters.fullscreen ?? true);
        this.interactionManager = new InteractionManager(this.renderManager);
        this._animate = parameters.animate;

        if (rendererParameters.canvas === undefined) {
            document.body.appendChild(this.renderer.domElement);
        }

        document.body.appendChild(this.stats.dom);

        this.addScene(...parameters.scenes);

        this.renderer.setAnimationLoop((time, frame) => {
            this.interactionManager.update();

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
        if (this.activeScene === undefined) {  //TODO documenta
            for (const obj of scene[0].children) {
                if ((obj as unknown as Camera).isCamera === true) {
                    this.setActiveScene(scene[0], obj as unknown as Camera);
                    break;
                }
            }
        }
    }

    /**
     * Se non ci sono view TODO
     */
    public setActiveScene(scene: Scene, camera: Camera, composer?: EffectComposer): void {
        this.renderManager.setActiveScene(scene, camera, composer);
    }

}
