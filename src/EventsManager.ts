import { Camera, Object3D, Raycaster, Renderer, Scene, Vector2 } from "three";
import { DOMEvents, FocusEventExt, IntersectionExt, MouseEventExt, PointerEventExt, PointerIntersectionEvent, RendererResizeEvent } from "./Events";
import { EventsCache } from "./EventsCache";
import { EventsQueue } from "./EventsQueue";
import { Utils } from "./Utils";

export class EventsManager {
    public enabled = true;
    // public raycastingORGPUType;
    public intersectionSortComparer = (a: IntersectionExt, b: IntersectionExt) => { return a.distance - b.distance };
    public continousPointerRaycasting = false; //for intersection event
    public activeScene: Scene;
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
    private _pointerOverEvents: (keyof DOMEvents)[] = ["pointerover", "mouseover"];
    private _pointerEnterEvents: (keyof DOMEvents)[] = ["pointerenter", "mouseenter"];
    private _pointerMoveEvents: (keyof DOMEvents)[] = ["pointermove", "mousemove", "touchmove"];
    private _pointerOutEvents: (keyof DOMEvents)[] = ["pointerout", "mouseout"];
    private _pointerLeaveEvents: (keyof DOMEvents)[] = ["pointerleave", "mouseleave"];

    constructor(renderer: Renderer, activeScene?: Scene) {
        this.activeScene = activeScene;
        this._domElement = renderer.domElement;
        this._domElement.addEventListener("contextmenu", (e) => e.preventDefault());
        this._domElement.addEventListener("mousemove", () => this._mouseDetected = true); //TODO togliere l'evento dopo il primo trigger e aggiungere touch to fix surface
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

    public update(scene: Scene, camera: Camera): void { //todo user active scene?
        //TODO check se canvas ha perso focus
        if (!this.enabled) return;
        this._raycasted = false;
        for (const event of this._queue.dequeue()) {
            this.computeQueuedEvent(event, scene, camera);
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

            //TODO apply check on frustum se sono visibili

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

    private updateCanvasPointerPosition(event: MouseEvent): void {
        this._canvasPointerPosition.x = event.offsetX / this._domElement.clientWidth * 2 - 1;
        this._canvasPointerPosition.y = event.offsetY / this._domElement.clientHeight * -2 + 1;
    }

    private triggerAncestorPointer(type: keyof DOMEvents, event: PointerEvent, target = this.hoveredObj, relatedTarget?: Object3D): PointerEventExt {
        if (target) {
            const pointerEvent = this.createPointerEvent(event, type, target, relatedTarget);
            target.triggerEventAncestor(type, pointerEvent);
            return pointerEvent;
        }
    }

    private triggerAncestorPointerMulti(types: (keyof DOMEvents)[], event: PointerEvent, target = this.hoveredObj, relatedTarget?: Object3D): PointerEventExt {
        if (target) {
            const isMouse = event.pointerType === "mouse";
            const isTouch = event.pointerType === "touch" || event.pointerType === "pen";
            const pointerEvent = this.createPointerEvent(event, types[0], target, relatedTarget);
            target.triggerEventAncestor(types[0], pointerEvent);
            types[1] && isMouse && target.triggerEventAncestor(types[1], this.createMouseEvent(event, types[1], target, relatedTarget));
            // types[2] && isTouch && target.triggerEventAncestor(types[2], toucheventext(types[2], event, target, this.intersection));
            return pointerEvent;
        }
    }

    private createPointerEvent(event: PointerEvent, type: keyof DOMEvents, target: Object3D, relatedTarget: Object3D): PointerEventExt {
        return new PointerEventExt(event, type, target, this.intersection, this._lastIntersection, relatedTarget);
    }

    private createMouseEvent(event: PointerEvent, type: keyof DOMEvents, target: Object3D, relatedTarget: Object3D): MouseEventExt {
        return new MouseEventExt(event, type, target, this.intersection, this._lastIntersection, relatedTarget);
    }

    private createPointerIntersectionEvent(): PointerIntersectionEvent {
        return new PointerIntersectionEvent(this.hoveredObj, this.intersection, this._lastIntersection);
    }

    private createFocusEvent(type: keyof DOMEvents, target: Object3D, relatedTarget: Object3D): FocusEventExt {
        return new FocusEventExt(type, target, relatedTarget);
    }

    private computeQueuedEvent(event: Event, scene: Scene, camera: Camera): void {
        switch (event.type) {
            case "pointermove": return this.pointerMove(event as PointerEvent, scene, camera);
            case "pointerdown": return this.pointerDown(event as PointerEvent);
            case "pointerup": return this.pointerUp(event as PointerEvent);
            default: console.error("Error: computeEvent failed.");
        }
    }

    private pointerDown(event: PointerEvent): void {
        this._lastPointerDown = this.triggerAncestorPointerMulti(this._pointerDownEvents, event);
        this.focus();
    }

    private pointerMove(event: PointerEvent, scene: Scene, camera: Camera): void {
        this._lastPointerMove = event;
        this.pointerOutOver(scene, camera, event, true);
        this.triggerAncestorPointerMulti(this._pointerMoveEvents, event);
    }

    private pointerIntersection(scene: Scene, camera: Camera): void {
        if (!this.continousPointerRaycasting) return;
        if (this._mouseDetected && !this._raycasted) {
            this.pointerOutOver(scene, camera, this._lastPointerMove, false);
        }
        if (this.hoveredObj && !Utils.areVector3Equals(this.intersection.point, this._lastIntersection?.point)) {
            this.hoveredObj.triggerEventAncestor("pointerIntersection", this.createPointerIntersectionEvent());
        }
    }

    private pointerOutOver(scene: Scene, camera: Camera, event: PointerEvent, updateCanvasPointerPosition: boolean): void {
        this._lastHoveredObj = this.hoveredObj;
        updateCanvasPointerPosition && this.updateCanvasPointerPosition(event);
        this.raycast(scene, camera);
        this.hoveredObj && (this.hoveredObj.hovered = false);
        this.hoveredObj = this.intersection?.object;
        this.hoveredObj && (this.hoveredObj.hovered = true);

        if (this._lastHoveredObj !== this.hoveredObj) {
            this.triggerAncestorPointerMulti(this._pointerOutEvents, event, this._lastHoveredObj, this.hoveredObj);
            this.triggerAncestorPointerMulti(this._pointerLeaveEvents, event, this._lastHoveredObj, this.hoveredObj);
            this.triggerAncestorPointerMulti(this._pointerOverEvents, event, this.hoveredObj, this._lastHoveredObj);
            this.triggerAncestorPointerMulti(this._pointerEnterEvents, event, this.hoveredObj, this._lastHoveredObj);
        }
    }

    private pointerUp(event: PointerEvent): void {
        this.triggerAncestorPointerMulti(this._pointerUpEvents, event, this.hoveredObj, this._lastPointerDown?.target);
        if (this.hoveredObj === (this._lastPointerDown?.target ?? null)) {
            const prevClick = this._lastClick;
            this._lastClick = this.triggerAncestorPointer("click", event);

            if (this.hoveredObj === prevClick?.target && event.timeStamp - prevClick.timeStamp <= 300) {
                this.triggerAncestorPointer("dblclick", event);
                this._lastClick = undefined;
            }
        } else {
            this._lastClick = undefined;
        }
    }

    private focus(): void { //TODO creare possibilità di settare focus manulamente
        const activableObj = this.hoveredObj?.activableObj;
        if (this.activeObj !== activableObj) {
            activableObj && activableObj.triggerEventAncestor("focusIn", this.createFocusEvent("focusIn", activableObj, this.activeObj));
            this.activeObj && this.activeObj.triggerEventAncestor("focusOut", this.createFocusEvent("focusOut", this.activeObj, activableObj));
            activableObj && activableObj.triggerEventAncestor("focus", this.createFocusEvent("focus", activableObj, this.activeObj));
            this.activeObj && this.activeObj.triggerEventAncestor("blur", this.createFocusEvent("blur", this.activeObj, activableObj));
            this.activeObj && (this.activeObj.active = false);
            this.activeObj = activableObj;
            this.activeObj && (this.activeObj.active = true);
        }
    }
}
