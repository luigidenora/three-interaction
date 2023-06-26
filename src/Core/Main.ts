import { Camera, Clock, Color, Scene, WebGLRenderer, WebGLRendererParameters } from "three";
import { Stats } from "../Utils/Stats";
import { InteractionManager } from "../Events/InteractionManager";
import { applyWebGLRendererPatch } from "../Patch/WebGLRenderer";
import { EventsCache } from "../Events/MiscEventsManager";
import { RenderManager } from "../Rendering/RenderManager";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { Binding } from "../Binding/Binding";

export interface MainParameters {
    fullscreen?: boolean;
    scenes?: Scene[];
    animate?: XRFrameRequestCallback;
    showStats?: boolean;
    disableContextMenu?: boolean;
    backgroundColor?: Color | number;
    backgroundAlpha?: number;
    // raycasting frequency
    // fps?: number;
}

export class Main {
    public static ticks = 0;
    public renderer: WebGLRenderer;
    public renderManager: RenderManager;
    public interactionManager: InteractionManager;
    public _stats: Stats;
    public scenes: Scene[] = [];
    private _animate: XRFrameRequestCallback;
    private _clock = new Clock();
    private _showStats: boolean;

    public get activeScene(): Scene { return this.renderManager.activeView.scene };
    public get activeCamera(): Camera { return this.renderManager.activeView.camera };
    public get activeComposer(): EffectComposer { return this.renderManager.activeView.composer };

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
        if (this.renderManager.views.length === 0 && this.renderManager.__defaultView === undefined) {  //TODO documenta
            for (const obj of scene[0].children) {
                if ((obj as unknown as Camera).isCamera === true) {
                    this.createDefaultRenderView(scene[0], obj as unknown as Camera);
                    break;
                }
            }
        }
    }

    private setAnimationLoop(): void {
        this.renderer.setAnimationLoop((time, frame) => {
            Main.ticks++;

            this.interactionManager.update();

            this.animate(time, frame);

            const visibleScenes = this.renderManager.getVisibleScenes() ?? [this.activeScene];
            for (const scene of visibleScenes) {
                EventsCache.dispatchEvent(scene, "animate", { delta: this._clock.getDelta(), total: this._clock.getElapsedTime() });
                Binding.compute(scene);
            }

            const rendered = this.renderManager.render();

            for (const scene of visibleScenes) {
                scene.__needsRender = !scene.__smartRendering;
            }

            if (this._showStats === true) {
                this._stats.update(rendered);
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
    public createDefaultRenderView(scene: Scene, camera: Camera, composer?: EffectComposer): void {
        this.renderManager.createDefaultRenderView(scene, camera, composer);
    }

}
