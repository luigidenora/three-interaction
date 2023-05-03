import { Camera, Object3D, Scene, WebGLRenderer, WebGLRenderTarget } from "three";
import { IntersectionExt } from "./Events";
export declare class EventsManager {
    renderer: WebGLRenderer;
    enabled: boolean;
    raycastGPU: boolean;
    pickingTexture: WebGLRenderTarget;
    intersectionSortComparer: (a: IntersectionExt, b: IntersectionExt) => number;
    continousPointerRaycasting: boolean;
    disactiveWhenClickOut: boolean;
    private pointer;
    private pointerUv;
    intersections: IntersectionExt[];
    intersection: IntersectionExt;
    activeObj: Object3D;
    hoveredObj: Object3D;
    private _lastHoveredObj;
    private _lastPointerDown;
    private _lastPointerMove;
    private _lastClick;
    private _lastIntersection;
    private _raycaster;
    private _queue;
    private _raycasted;
    private _mouseDetected;
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
