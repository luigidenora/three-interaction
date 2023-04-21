import { Camera, Object3D, Raycaster, Renderer, Scene, Vector2 } from "three";
import { Events, IntersectionExt } from "./Events";
import { applyPatch } from "./Patch";
import { mouseEventExt } from "./EventsCreator";

applyPatch();

export class EventsManager {
    // public raycastingORGPUType;
    public intersectionSortComparer = (a: IntersectionExt, b: IntersectionExt) => { return a.distance - b.distance };
    public enabled = true;
    public intersections: IntersectionExt[];
    public intersection: IntersectionExt;
    public hoveredObj: Object3D;
    public hoveredObjMouseDown: Object3D;
    public activeObj: Object3D;
    private _continousRaycasting = false;
    private _canvasPointerPosition = new Vector2();
    private _raycaster = new Raycaster();
    private _domElement: HTMLCanvasElement;

    constructor(renderer: Renderer) {
        this._domElement = renderer.domElement;
        this._domElement.addEventListener('contextmenu', (e) => e.preventDefault());
        this.bindEvents();
    }

    private bindEvents(): void {
        const canvas = this._domElement;

        canvas.addEventListener("mousedown", this.mouseDown.bind(this));
        canvas.addEventListener("mousemove", this.mouseMove.bind(this));
        canvas.addEventListener("mouseup", this.mouseUp.bind(this));

        canvas.addEventListener("pointercancel", (e) => { });
        canvas.addEventListener("pointerdown", (e) => { });
        canvas.addEventListener("pointermove", (e) => { });
        canvas.addEventListener("pointerup", (e) => { });

        canvas.addEventListener("touchstart", (e) => { e.preventDefault() });
        canvas.addEventListener("touchcancel", (e) => { });
        canvas.addEventListener("touchend", (e) => { });
        canvas.addEventListener("touchmove", (e) => { });

        canvas.addEventListener("wheel", (e) => { });

        canvas.addEventListener("keydown", (e) => { });
        canvas.addEventListener("keyup", (e) => { });
    }

    private updateCanvasPointerPositionMouse(event: MouseEvent): void {
        this._canvasPointerPosition.x = event.offsetX / this._domElement.clientWidth * 2 - 1;
        this._canvasPointerPosition.y = event.offsetY / this._domElement.clientHeight * -2 + 1;
        this._continousRaycasting = true;
    }

    public update(scene: Scene, camera: Camera, force = false): void {
        //TODO check se canvas ha perso focus
        if (this.enabled && (this._continousRaycasting || force)) { //se touch force a true
            this._raycaster.setFromCamera(this._canvasPointerPosition, camera);
            this.intersections = this.raycastObjects(scene, []);
            this.intersections.sort(this.intersectionSortComparer);
            this.intersection = this.intersections[0];
            // this._cursorHandler.update(this.objectDragging, this.mainObjIntercepted);
        }
    }

    private raycastObjects(object: Object3D, target: IntersectionExt[]): IntersectionExt[] { //todo cercare di ottimizzare
        if (object.interceptByRaycaster && object.visible) {

            for (const obj of object.children) {
                this.raycastObjects(obj, target);
            }

            let previousCount = target.length;

            if (object.objectsToRaycast) {
                this._raycaster.intersectObjects(object.objectsToRaycast, false, target);
            } else {
                this._raycaster.intersectObject(object, false, target);
            }

            while (target.length > previousCount) {
                const intersection = target[previousCount];
                intersection.hitbox = intersection.object;
                intersection.object = object;
                previousCount++;
            }
        }

        return target;
    }

    private triggerAncestor<K extends keyof Events>(object: Object3D, type: K, event: Events[K]): void {
        while (object) {
            object.triggerEvent(type, event);
            if (event._stopPropagation) break;
            object = object.parent;
        }
    }

    private mouseDown(event: MouseEvent): void {
        this.triggerAncestor(this.hoveredObj, "mouseDown", mouseEventExt(event, "mouseDown", this.intersection, this.hoveredObj));
        this.hoveredObjMouseDown = this.hoveredObj;
    }

    private mouseMove(event: MouseEvent): void {
        const oldHoveredObj = this.hoveredObj;
        this.updateCanvasPointerPositionMouse(event);
        this.hoveredObj = this.intersection?.object;
        const areDifferentObjs = oldHoveredObj !== this.hoveredObj;

        oldHoveredObj && areDifferentObjs && this.triggerAncestor(oldHoveredObj, "mouseOut", mouseEventExt(event, "mouseOut", this.intersection, oldHoveredObj));
        this.hoveredObj && areDifferentObjs && this.triggerAncestor(this.hoveredObj, "mouseOver", mouseEventExt(event, "mouseOver", this.intersection, this.hoveredObj));
        this.hoveredObj && this.triggerAncestor(this.hoveredObj, "mouseMove", mouseEventExt(event, "mouseMove", this.intersection, this.hoveredObj));
    }

    private mouseUp(event: MouseEvent): void {
        if (this.hoveredObj) {
            this.triggerAncestor(this.hoveredObj, "mouseUp", mouseEventExt(event, "mouseUp", this.intersection, this.hoveredObj));

            if (this.hoveredObj !== this.hoveredObjMouseDown) return;
            this.triggerAncestor(this.hoveredObj, "click", mouseEventExt(event, "click", this.intersection, this.hoveredObj));
            //todo mettere evento active se non uguale a oggetto già clickato

            //TODO aggiungere dblclick
        }

        this.hoveredObjMouseDown = undefined;
    }
}
