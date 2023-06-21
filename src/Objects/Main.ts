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
    showStats?: boolean; // TODO
    smartRendering?: boolean; // TODO
    fps?: number; //default 0
    backgroundColor?: number, //default 0x000000
    backgroundAlpha?: number //default 1. Alpha in webgl context parameters must be true.
    disableRightClickOnCanvas?: boolean, //default true
}

export class Main {
    public renderer: WebGLRenderer;
    public renderManager: RenderManager;
    public interactionManager: InteractionManager;
    public _stats: Stats;
    public scenes: Scene[] = [];
    private _animate: XRFrameRequestCallback;
    private _clock = new Clock();
    private _showStats: boolean;

    public get activeScene(): Scene { return this.renderManager.activeScene };
    public get activeCamera(): Camera { return this.renderManager.activeCamera };
    public get activeComposer(): EffectComposer { return this.renderManager.activeComposer };

    public get showStats(): boolean { return this._showStats }
    public set showStats(value: boolean) { this.setStats(value) }

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

        this.setStats(parameters.showStats);

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

            if (this._showStats === true) {
                this._stats.update();
            }
        });
    }

    private setStats(value: boolean) {
        if (value === true) {
            if (this._stats === undefined) {
                this._stats = new Stats();
                document.body.appendChild(this._stats.dom);
            }
            this._stats.dom.style.display = "block";
        } else if (this._stats !== undefined) {
            this._stats.dom.style.display = "none";
        }
        this._showStats = value;
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
