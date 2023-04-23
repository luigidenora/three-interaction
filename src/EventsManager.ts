import { Camera, Object3D, Raycaster, Renderer, Scene, Vector2 } from "three";
import { DOMEvents, Events, IntersectionExt, MouseEventExt, PointerEventExt, PointerIntersectionEvent } from "./Events";
import { EventsQueue } from "./EventsQueue";
import { Utils } from "./Utils";

export class EventsManager {
    // public raycastingORGPUType;
    public intersectionSortComparer = (a: IntersectionExt, b: IntersectionExt) => { return a.distance - b.distance };
    public continousMouseRaycasting = true; //for intersection event
    public enabled = true;
    public intersections: IntersectionExt[];
    public intersection: IntersectionExt;
    public activeObj: Object3D;
    public hoveredObj: Object3D;
    private _lastHoveredObj: Object3D;
    private _lastPointerDown: PointerEventExt;
    private _lastPointerMove: PointerEvent;
    private _lastClick: PointerEventExt;
    private _lastIntersection: IntersectionExt;
    private _canvasPointerPosition = new Vector2();
    private _raycaster = new Raycaster();
    private _domElement: HTMLCanvasElement;
    private _queue = new EventsQueue();
    private _raycasted: boolean;
    private _mouseDetected = false;
    private _pointerDownEvents: (keyof DOMEvents)[] = ["pointerdown", "mousedown", "touchstart"];
    private _pointerUpEvents: (keyof DOMEvents)[] = ["pointerup", "mouseup", "touchend"];
    private _pointerOverEvents: (keyof DOMEvents)[] = ["pointerover", "mouseover"]
    private _pointerMoveEvents: (keyof DOMEvents)[] = ["pointermove", "mousemove", "touchmove"]
    private _pointerOutEvents: (keyof DOMEvents)[] = ["pointerout", "mouseout"]
    private _clickEvents: (keyof DOMEvents)[] = ["click"];
    private _dblClickEvents: (keyof DOMEvents)[] = ["dblclick"];

    constructor(renderer: Renderer) {
        this._domElement = renderer.domElement;
        this._domElement.addEventListener("contextmenu", (e) => e.preventDefault());
        this._domElement.addEventListener("mousemove", () => this._mouseDetected = true);
        this.bindEvents();
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

    private enqueue(event: Event): void {
        this._queue.enqueue(event);
    }

    public update(scene: Scene, camera: Camera): void {
        //TODO check se canvas ha perso focus
        if (!this.enabled) return;
        this._raycasted = false;
        for (const event of this._queue.dequeue()) {
            this.computeEvent(event, scene, camera);
        }
        this.pointerIntersection(scene, camera);
        // this._cursorHandler.update(this.objectDragging, this.mainObjIntercepted);
    }

    private raycast(obj: Object3D, camera: Camera): void {
        this._raycasted = true;
        this._raycaster.setFromCamera(this._canvasPointerPosition, camera);
        this.intersections = this.raycastObjects(obj, []);
        this.intersections.sort(this.intersectionSortComparer);
        this._lastIntersection = this.intersection;
        this.intersection = this.intersections[0];
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

    private updateCanvasPointerPositionMouse(event: MouseEvent): void {
        this._canvasPointerPosition.x = event.offsetX / this._domElement.clientWidth * 2 - 1;
        this._canvasPointerPosition.y = event.offsetY / this._domElement.clientHeight * -2 + 1;
    }

    private triggerAncestor<K extends keyof Events>(object: Object3D, type: K, event: Events[K]): void {
        while (object) {
            object.triggerEvent(type, event);
            if (!event.bubbles) break;
            object = object.parent;
        }
    }

    private triggerAncestorDOM(types: (keyof DOMEvents)[], event: PointerEvent, target = this.hoveredObj, relatedTarget?: Object3D): PointerEventExt {
        if (target) {
            const isMouse = event.pointerType === "mouse";
            const isTouch = event.pointerType === "touch" || event.pointerType === "pen";
            const pointerEvent = this.createPointerEvent(event, types[0], target, relatedTarget);
            this.triggerAncestor(target, types[0], pointerEvent);
            types[1] && isMouse && this.triggerAncestor(target, types[1], this.createMouseEvent(event, types[1], target, relatedTarget));
            // types[2] && isTouch && this.triggerAncestor(target, types[2], toucheventext(types[2], event, target, this.intersection));
            return pointerEvent as PointerEventExt;
        }
    }

    private createPointerEvent(event: PointerEvent, type: keyof DOMEvents, target: Object3D, relatedTarget: Object3D): PointerEventExt {
        const cancelable = type === "click";
        // const bubbles = type === "pointerenter" || type === "pointerleave";
        return new PointerEventExt(event, type, target, this.intersection, this._lastIntersection, relatedTarget, cancelable);
    }

    private createMouseEvent(event: PointerEvent, type: keyof DOMEvents, target: Object3D, relatedTarget: Object3D): MouseEventExt {
        return new MouseEventExt(event, type, target, this.intersection, this._lastIntersection, relatedTarget);
    }

    private createPointerIntersectionEvent(): PointerIntersectionEvent {
        return new PointerIntersectionEvent(this.hoveredObj, this.intersection, this._lastIntersection);
    }

    private computeEvent(event: Event, scene: Scene, camera: Camera): void {
        switch (event.type) {
            case "pointermove": return this.pointerMove(event as PointerEvent, scene, camera);
            case "pointerdown": return this.pointerDown(event as PointerEvent);
            case "pointerup": return this.pointerUp(event as PointerEvent);
            default: console.error("Error: computeEvent failed.");
        }
    }

    private pointerDown(event: PointerEvent): void {
        this._lastPointerDown = this.triggerAncestorDOM(this._pointerDownEvents, event);
    }

    private pointerMove(event: PointerEvent, scene: Scene, camera: Camera): void {
        this._lastPointerMove = event;
        this._lastHoveredObj = this.hoveredObj;
        this.updateCanvasPointerPositionMouse(event);
        this.raycast(scene, camera);
        this.hoveredObj = this.intersection?.object;

        if (this._lastHoveredObj !== this.hoveredObj) {
            this.triggerAncestorDOM(this._pointerOutEvents, event, this._lastHoveredObj, this.hoveredObj);
            this.triggerAncestorDOM(this._pointerOverEvents, event, this.hoveredObj, this._lastHoveredObj);
        }
        this.triggerAncestorDOM(this._pointerMoveEvents, event);
    }

    private pointerUp(event: PointerEvent): void {
        //handling focus

        this.triggerAncestorDOM(this._pointerUpEvents, event);

        if (this.hoveredObj === (this._lastPointerDown?.target ?? null)) {
            const prevClick = this._lastClick;
            this._lastClick = this.triggerAncestorDOM(this._clickEvents, event);

            if (this.hoveredObj === prevClick?.target && event.timeStamp - prevClick.timeStamp <= 300) {
                this.triggerAncestorDOM(this._dblClickEvents, event);
                this._lastClick = undefined;
            }
        } else {
            this._lastClick = undefined;
        }
    }

    private pointerIntersection(scene: Scene, camera: Camera): void {
        if (this.continousMouseRaycasting && this._mouseDetected && !this._raycasted) {
            this._lastHoveredObj = this.hoveredObj;
            this.raycast(scene, camera);
            this.hoveredObj = this.intersection?.object;

            if (this._lastHoveredObj !== this.hoveredObj) {
                this.triggerAncestorDOM(this._pointerOutEvents, this._lastPointerMove, this._lastHoveredObj, this.hoveredObj);
                this.triggerAncestorDOM(this._pointerOverEvents, this._lastPointerMove, this.hoveredObj, this._lastHoveredObj);
            }
        }

        if (this.hoveredObj && !Utils.areVector3Equals(this.intersection.point, this._lastIntersection?.point)) {
            this.triggerAncestor(this.hoveredObj, "pointerIntersection", this.createPointerIntersectionEvent());
        }
    }
}
