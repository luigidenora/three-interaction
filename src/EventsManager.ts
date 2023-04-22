import { Camera, Object3D, Raycaster, Renderer, Scene, Vector2 } from "three";
import { DOMEvents, Events, IntersectionExt, PointerEventExt } from "./Events";
import { createEventExt } from "./EventsCreator";
import { EventsQueue } from "./EventsQueue";

export class EventsManager {
    // public raycastingORGPUType;
    public intersectionSortComparer = (a: IntersectionExt, b: IntersectionExt) => { return a.distance - b.distance };
    public continousRaycasting = true; //todo ottimizzare su mobile
    public enabled = true;
    public intersections: IntersectionExt[];
    public intersection: IntersectionExt;
    public hoveredObj: Object3D;
    public lastHoveredObj: Object3D;
    public lastPointerDown: PointerEventExt;
    public lastClick: PointerEventExt;
    public activeObj: Object3D;
    private _canvasPointerPosition = new Vector2();
    private _raycaster = new Raycaster();
    private _domElement: HTMLCanvasElement;
    private _queue = new EventsQueue();
    private _pointerDownEvents: (keyof DOMEvents)[] = ["pointerdown", "mousedown", "touchstart"];
    private _pointerUpEvents: (keyof DOMEvents)[] = ["pointerup", "mouseup", "touchend"];
    private _pointerOverEvents: (keyof DOMEvents)[] = ["pointerover", "mouseover"]
    private _pointerMoveEvents: (keyof DOMEvents)[] = ["pointermove", "mousemove", "touchmove"]
    private _pointerOutEvents: (keyof DOMEvents)[] = ["pointerout", "mouseout"]
    private _clickEvents: (keyof DOMEvents)[] = ["click"];
    private _dblClickEvents: (keyof DOMEvents)[] = ["dblclick"];

    constructor(renderer: Renderer) {
        this._domElement = renderer.domElement;
        this._domElement.addEventListener('contextmenu', (e) => e.preventDefault());
        this.bindEvents();
    }

    private enqueue(event: Event): void {
        this._queue.enqueue(event);
    }

    private bindEvents(): void {
        this._domElement.addEventListener("pointercancel", this.enqueue.bind(this));
        this._domElement.addEventListener("pointerdown", this.enqueue.bind(this));
        this._domElement.addEventListener("pointermove", this.enqueue.bind(this));
        this._domElement.addEventListener("pointerup", this.enqueue.bind(this));
        this._domElement.addEventListener("wheel", this.enqueue.bind(this));
        this._domElement.addEventListener("keydown", this.enqueue.bind(this));
        this._domElement.addEventListener("keyup", this.enqueue.bind(this));
    }

    private updateCanvasPointerPositionMouse(event: MouseEvent): void {
        this._canvasPointerPosition.x = event.offsetX / this._domElement.clientWidth * 2 - 1;
        this._canvasPointerPosition.y = event.offsetY / this._domElement.clientHeight * -2 + 1;
    }

    public update(scene: Scene, camera: Camera, force = false): void {
        //TODO check se canvas ha perso focus
        if (this.enabled && (this.continousRaycasting || force)) { //se touch force a true
            this._raycaster.setFromCamera(this._canvasPointerPosition, camera);
            this.intersections = this.raycastObjects(scene, []);
            this.intersections.sort(this.intersectionSortComparer);
            this.intersection = this.intersections[0];

            for (const event of this._queue.dequeue()) {
                this.computeEvent(event);
            }
            // this._cursorHandler.update(this.objectDragging, this.mainObjIntercepted);
        }
    }

    private raycastObjects(object: Object3D, target: IntersectionExt[]): IntersectionExt[] {
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

    private triggerAncestorDOM(types: (keyof Events)[], event: PointerEvent, target = this.hoveredObj): PointerEventExt {
        if (target) {
            const isMouse = event.pointerType === "mouse";
            const pointerEvent = createEventExt(types[0], event, target, this.intersection);
            this.triggerAncestor(target, types[0], pointerEvent);
            types[1] && isMouse && this.triggerAncestor(target, types[1], createEventExt(types[1], event, target, this.intersection));
            types[2] && !isMouse && this.triggerAncestor(target, types[2], createEventExt(types[2], event, target, this.intersection));
            return pointerEvent as PointerEventExt;
        }
    }

    private pointerDown(event: PointerEvent): void {
        this.lastPointerDown = this.triggerAncestorDOM(this._pointerDownEvents, event);
    }

    private pointerMove(event: PointerEvent): void {
        const isMouse = event.pointerType === "mouse";
        isMouse && (this.continousRaycasting = true);
        this.lastHoveredObj = this.hoveredObj;
        this.updateCanvasPointerPositionMouse(event);
        this.hoveredObj = this.intersection?.object;

        if (this.lastHoveredObj !== this.hoveredObj) {
            this.triggerAncestorDOM(this._pointerOutEvents, event, this.lastHoveredObj);
            this.triggerAncestorDOM(this._pointerOverEvents, event);
        }
        this.triggerAncestorDOM(this._pointerMoveEvents, event);
    }

    private pointerUp(event: PointerEvent): void {
        //handling focus

        this.triggerAncestorDOM(this._pointerUpEvents, event);

        if (this.hoveredObj === (this.lastPointerDown?.target ?? null)) {
            const prevClick = this.lastClick;
            this.lastClick = this.triggerAncestorDOM(this._clickEvents, event);
            if (this.hoveredObj === (prevClick?.target ?? null) && event.timeStamp - prevClick.timeStamp <= 300) {
                this.triggerAncestorDOM(this._dblClickEvents, event);
                this.lastClick = undefined;
            }
        } else {
            this.lastClick = undefined;
        }
    }

    private computeEvent(event: Event): void {
        switch (event.type) {
            case "pointerdown": return this.pointerDown(event as PointerEvent);
            case "pointermove": return this.pointerMove(event as PointerEvent);
            case "pointerup": return this.pointerUp(event as PointerEvent);
            default: console.error("Error: computeEvent failed.");
        }
    }
}
