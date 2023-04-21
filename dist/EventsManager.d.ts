import { Camera, Object3D, Renderer, Scene } from "three";
import { IntersectionExt } from "./Events";
export declare class EventsManager {
    intersectionSortComparer: (a: IntersectionExt, b: IntersectionExt) => number;
    enabled: boolean;
    intersections: IntersectionExt[];
    intersection: IntersectionExt;
    hoveredObj: Object3D;
    hoveredObjMouseDown: Object3D;
    activeObj: Object3D;
    private _continousRaycasting;
    private _canvasPointerPosition;
    private _raycaster;
    private _domElement;
    constructor(renderer: Renderer);
    private bindEvents;
    private updateCanvasPointerPositionMouse;
    update(scene: Scene, camera: Camera, force?: boolean): void;
    private raycastObjects;
    private triggerAncestor;
    private mouseDown;
    private mouseMove;
    private mouseUp;
}
