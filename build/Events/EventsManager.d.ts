import { Camera, Object3D, Scene, Vector2, WebGLRenderer, WebGLRenderTarget } from "three";
import { IntersectionExt } from "./Events";
export interface EventsManagerConfig {
}
export declare class EventsManager {
    renderer: WebGLRenderer;
    enabled: boolean;
    raycastGPU: boolean;
    pickingTexture: WebGLRenderTarget;
    intersectionSortComparer: (a: IntersectionExt, b: IntersectionExt) => number;
    continousPointerRaycasting: boolean;
    disactiveWhenClickOut: boolean;
    pointer: Vector2;
    pointerUv: Vector2;
    intersection: {
        [x: string]: IntersectionExt;
    };
    activeObj: Object3D;
    private _primaryIdentifier;
    private _lastPointerDown;
    private _lastPointerMove;
    private _lastClick;
    private _lastIntersection;
    private _raycaster;
    private _queue;
    private _primaryRaycasted;
    private _mouseDetected;
    private _isTapping;
    constructor(renderer: WebGLRenderer);
    registerRenderer(renderer: WebGLRenderer): void;
    private bindEvents;
    private enqueue;
    update(scene: Scene, camera: Camera): void;
    private raycastScene;
    private raycastObjects;
    private raycastObjectsGPU;
    private updateCanvasPointerPosition;
    private triggerAncestorPointer;
    private triggerAncestorWheel;
    private computeQueuedEvent;
    private pointerDown;
    private pointerMove;
    private pointerIntersection;
    private wheel;
    private pointerOutOver;
    private pointerUp;
    private focus;
}
