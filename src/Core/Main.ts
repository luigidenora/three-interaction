import { Camera, Clock, ColorRepresentation, Scene, Vector2, WebGLRenderer, WebGLRendererParameters } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { Binding } from "../Binding/Binding";
import { InteractionManager } from "../Events/InteractionManager";
import { EventsCache } from "../Events/MiscEventsManager";
import { RenderManager } from "../Rendering/RenderManager";
import { RenderView, ViewParameters } from "../Rendering/RenderView";
import { TweenManager } from "../Tweening/TweenManager";
import { Stats } from "../Utils/Stats";
import { RaycasterSortComparer } from "../Events/RaycasterManager";

export interface MainParameters {
    fullscreen?: boolean;
    showStats?: boolean;
    disableContextMenu?: boolean;
    backgroundColor?: ColorRepresentation;
    backgroundAlpha?: number;
    animate?: XRFrameRequestCallback;
    rendererParameters?: WebGLRendererParameters;
    enableCursor?: boolean;
}

export class Main {
    public static ticks = 0;
    public renderManager: RenderManager;
    private _interactionManager: InteractionManager;
    private _stats: Stats;
    private _animate: XRFrameRequestCallback;
    private _clock = new Clock();
    private _showStats: boolean;

    public get renderer(): WebGLRenderer { return this.renderManager.renderer }
    public get views(): RenderView[] { return this.renderManager.views }
    public get activeView(): RenderView { return this.renderManager.activeView }
    public get activeScene(): Scene { return this.renderManager.activeView?.scene }
    public get activeCamera(): Camera { return this.renderManager.activeView?.camera }
    public get activeComposer(): EffectComposer { return this.renderManager.activeView?.composer }

    public get showStats(): boolean { return this._showStats }
    public set showStats(value: boolean) {
        if (value === true) {
            if (!this._stats) this._stats = new Stats();
            document.body.appendChild(this._stats.dom);
        } else if (this._stats) {
            document.body.removeChild(this._stats.dom);
        }
        this._showStats = value;
    }

    public get enableCursor(): boolean { return this._interactionManager.cursorManager.enabled }
    public set enableCursor(value: boolean) { this._interactionManager.cursorManager.enabled = value }

    public get raycasterSortComparer(): RaycasterSortComparer { return this._interactionManager.raycasterManager.raycasterSortComparer }
    public set raycasterSortComparer(value: RaycasterSortComparer) { this._interactionManager.raycasterManager.raycasterSortComparer = value }

    public get backgroundColor(): ColorRepresentation { return this.renderManager.backgroundColor }
    public set backgroundColor(value: ColorRepresentation) { this.renderManager.backgroundColor = value }

    public get backgroundAlpha(): number { return this.renderManager.backgroundAlpha }
    public set backgroundAlpha(value: number) { this.renderManager.backgroundAlpha = value }

    public get mousePosition(): Vector2 { return this._interactionManager.raycasterManager.pointer }

    constructor(parameters: MainParameters = {}) {
        this.renderManager = new RenderManager(parameters.rendererParameters, parameters.fullscreen);
        this._interactionManager = new InteractionManager(this.renderManager);
        this.handleContextMenu(parameters.disableContextMenu);
        this.showStats = parameters.showStats ?? true;
        this.setAnimationLoop();
        this.backgroundColor = parameters.backgroundColor ?? 0x000000;
        this.backgroundAlpha = parameters.backgroundAlpha ?? 1;
        this.enableCursor = parameters.enableCursor ?? true;
        this._animate = parameters.animate;
    }

    private handleContextMenu(disableContextMenu = true): void {
        if (disableContextMenu === true) {
            this.renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault());
        }
    }

    private setAnimationLoop(): void {
        this.renderer.setAnimationLoop((time, frame) => {
            Main.ticks++;
            const currentDelta = this._clock.getDelta();

            this._interactionManager.update();
            TweenManager.update(currentDelta * 1000);

            this.animate(time, frame);

            let rendered = false;
            const visibleScenes = this.renderManager.getVisibleScenes();

            if (visibleScenes !== undefined) {
                for (const scene of visibleScenes) {
                    const delta = currentDelta * scene.timeScale;
                    const total = scene.totalTime += delta;
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

    public createView(view: ViewParameters): RenderView {
        return this.renderManager.create(view);
    }

    public addView(view: RenderView): void {
        this.renderManager.add(view);
    }

    public getViewByTag(tag: string): RenderView {
        return this.renderManager.getByTag(tag);
    }

    public removeView(view: RenderView): void {
        this.renderManager.remove(view);
    }

    public removeViewByTag(tag: string): void {
        this.renderManager.removeByTag(tag);
    }

    public clearViews(): void {
        this.renderManager.clear();
    }

    public getViewByMouse(mouse: Vector2): void {
        this.renderManager.getViewByMouse(mouse);
    }

    public setActiveViewsByTag(tag: string): void {
        this.renderManager.setActiveViewsByTag(tag);
    }
}
