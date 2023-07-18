import { Camera, Clock, Color, Scene, Vector2, WebGLRenderer, WebGLRendererParameters } from "three";
import { Stats } from "../Utils/Stats";
import { InteractionManager } from "../Events/InteractionManager";
import { applyWebGLRendererPatch } from "../Patch/WebGLRenderer";
import { EventsCache } from "../Events/MiscEventsManager";
import { RenderManager } from "../Rendering/RenderManager";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { Binding } from "../Binding/Binding";
import { TweenManager } from "../Tweening/TweenManager";
import { RenderView, ViewParameters } from "../Rendering/RenderView";

export interface MainParameters {
    fullscreen?: boolean;
    showStats?: boolean;
    disableContextMenu?: boolean;
    backgroundColor?: Color | number;
    backgroundAlpha?: number;
    animate?: XRFrameRequestCallback;
    renderer?: WebGLRendererParameters;
    // raycastingFrequency?: boolean;
}

export class Main {
    public static ticks = 0;
    public renderer: WebGLRenderer;
    public renderManager: RenderManager;
    private _interactionManager: InteractionManager;
    private _stats: Stats;
    private _animate: XRFrameRequestCallback;
    private _clock = new Clock();
    private _showStats: boolean;

    public get activeView(): RenderView { return this.renderManager.activeView };
    public get activeScene(): Scene { return this.renderManager.activeView?.scene };
    public get activeCamera(): Camera { return this.renderManager.activeView?.camera };
    public get activeComposer(): EffectComposer { return this.renderManager.activeView?.composer };

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

    //TODO change to ColorRepresentation
    public get backgroundColor(): Color | number { return this.renderManager.backgroundColor }
    public set backgroundColor(value: Color | number) { this.renderManager.backgroundColor = value }

    public get backgroundAlpha(): number { return this.renderManager.backgroundAlpha }
    public set backgroundAlpha(value: number) { this.renderManager.backgroundAlpha = value }

    public get mousePosition(): Vector2 { return this._interactionManager.raycasterManager.pointer }

    constructor(parameters: MainParameters = {}) {
        parameters.renderer ??= {};
        this.initRenderer(parameters.renderer, parameters.fullscreen);
        this.appendCanvas(parameters.renderer);
        this._interactionManager = new InteractionManager(this.renderManager);
        this.handleContextMenu(parameters.disableContextMenu);
        this.showStats = parameters.showStats ?? true;
        this.setAnimationLoop();
        this.backgroundColor = parameters.backgroundColor ?? 0x000000;
        this.backgroundAlpha = parameters.backgroundAlpha ?? 1;
        this._animate = parameters.animate;
        // setInterval(() => { this.interactionManager.needsUpdate = true }, 1000 / 20); //TODO in future
    }

    private initRenderer(rendererParameters: WebGLRendererParameters, fullscreen = true): void {
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

    private setAnimationLoop(): void {
        this.renderer.setAnimationLoop((time, frame) => {
            Main.ticks++;
            const delta = this._clock.getDelta();
            const total = this._clock.getElapsedTime();

            this._interactionManager.update();
            TweenManager.update(delta * 1000);

            this.animate(time, frame);

            let rendered = false;
            const visibleScenes = this.renderManager.getVisibleScenes();

            if (visibleScenes !== undefined) {
                for (const scene of visibleScenes) {
                    EventsCache.dispatchEvent(scene, "beforeanimate", { delta, total });
                    EventsCache.dispatchEvent(scene, "animate", { delta, total });
                    EventsCache.dispatchEvent(scene, "afteranimate", { delta, total });
                    Binding.compute(scene);
                }

                rendered = this.renderManager.render();

                for (const scene of visibleScenes) {
                    scene.needsRender = !scene.__smartRendering;
                }
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

    public addView(view: ViewParameters): RenderView {
        return this.renderManager.add(view);
    }

}
