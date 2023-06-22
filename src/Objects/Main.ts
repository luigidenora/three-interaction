import { Camera, Clock, Color, Scene, WebGLRenderer, WebGLRendererParameters } from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { InteractionManager } from "../Events/InteractionManager";
import { applyWebGLRendererPatch } from "../Patch/WebGLRenderer";
import { EventsCache } from "../Events/MiscEventsManager";
import { computeAutoBinding } from "../Binding/Binding";
import { RenderManager } from "../Rendering/RenderManager";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

export interface MainParameters {
    fullscreen?: boolean;
    scenes?: Scene[];
    animate?: XRFrameRequestCallback;
    showStats?: boolean;
    disableContextMenu?: boolean;
    backgroundColor?: Color | number;
    backgroundAlpha?: number;
    // fps?: number;
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
    public set showStats(value: boolean) {
        if (value === true) {
            if (this._stats === undefined) this._stats = new Stats();
            document.body.appendChild(this._stats.dom);
        } else if (this._stats !== undefined) {
            document.body.removeChild(this._stats.dom);
        }
        this._showStats = value;
    }

    public get backgroundColor(): Color | number { return this.renderManager.backgroundColor }
    public set backgroundColor(value: Color | number) { this.renderManager.backgroundColor = value }

    public get backgroundAlpha(): number { return this.renderManager.backgroundAlpha }
    public set backgroundAlpha(value: number) { this.renderManager.backgroundAlpha = value }

    constructor(parameters: MainParameters = {}, rendererParameters: WebGLRendererParameters = {}) {
        this.initRenderer(parameters.fullscreen, rendererParameters);
        this.interactionManager = new InteractionManager(this.renderManager);
        this.appendCanvas(rendererParameters);
        this.handleContextMenu(parameters.disableContextMenu);
        this.showStats = parameters.showStats ?? true;
        this.addScene(...parameters.scenes);
        this.setAnimationLoop();
        this.backgroundColor = parameters.backgroundColor ?? 0x000000;
        this.backgroundAlpha = parameters.backgroundAlpha ?? 1;
        this._animate = parameters.animate;
    }

    private initRenderer(fullscreen = true, rendererParameters: WebGLRendererParameters): void {
        this.renderer = new WebGLRenderer(rendererParameters);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        applyWebGLRendererPatch(this.renderer);
        this.renderManager = new RenderManager(this.renderer, fullscreen);
    }

    private appendCanvas(rendererParameters: WebGLRendererParameters): void {
        if (rendererParameters.canvas === undefined) {
            document.body.appendChild(this.renderer.domElement);
        }
    }

    private handleContextMenu(disableContextMenu = true): void {
        if (disableContextMenu === true) {
            this.renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault());
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

    private setAnimationLoop(): void {
        this.renderer.setAnimationLoop((time, frame) => {
            
            const visibleScenes = this.renderManager.getVisibleScenes() ?? [this.activeScene];
            for (const scene of visibleScenes) {
                computeAutoBinding(scene);
            }

            this.interactionManager.update();

            for (const scene of visibleScenes) {
                EventsCache.dispatchEvent(scene, "animate", { delta: this._clock.getDelta(), total: this._clock.getElapsedTime() });
            }

            this.animate(time, frame);
            const rendered = this.renderManager.render(this.activeScene, this.activeCamera, this.activeComposer);

            for (const scene of visibleScenes) {
                scene.__needsRender = !scene.__smartRendering;
            }

            if (this._showStats === true && rendered === true) {
                this._stats.update();
            }
        });
    }

    private animate(time: DOMHighResTimeStamp, frame: XRFrame): void {
        if (this._animate !== undefined) {
            this._animate(time, frame);
        }
    }

    /**
     * Se non ci sono view TODO
     */
    public setActiveScene(scene: Scene, camera: Camera, composer?: EffectComposer): void {
        this.renderManager.setActiveScene(scene, camera, composer);
    }

}
