import { Camera, Object3D, Scene, WebGLRenderer } from "three";
import { CursorHandler } from "./CursorManager";
import { DragManager } from "./DragManager";
import { FocusEventExt, InteractionEvents, IntersectionExt, PointerEventExt, PointerIntersectionEvent, WheelEventExt } from "./Events";
import { PointerEventsQueue } from "./InteractionEventsQueue";
import { RaycasterManager } from "./RaycasterManager";

export class EventsManager {
    public enabled = true;
    public continousPointerRaycasting = true; //for intersection event
    public disactiveWhenClickOut = false;
    public intersection: { [x: string]: IntersectionExt } = {};
    public activeObj: Object3D;
    public raycasterManager: RaycasterManager;
    private _primaryIdentifier: number;
    private _lastPointerDownExt: { [x: string]: PointerEventExt } = {};
    private _lastPointerDown: { [x: string]: PointerEvent } = {};
    private _lastPointerMove: { [x: string]: PointerEvent } = {};
    private _lastClick: PointerEventExt;
    private _lastIntersection: { [x: string]: IntersectionExt } = {};
    private _queue = new PointerEventsQueue();
    private _cursorManager: CursorHandler;
    private _dragManager = new DragManager();
    private _primaryRaycasted: boolean;
    private _mouseDetected = false;
    private _isTapping = false;

    constructor(renderer: WebGLRenderer) {
        this.registerRenderer(renderer);
        this._cursorManager = new CursorHandler(renderer.domElement);
        this.raycasterManager = new RaycasterManager(renderer);
    }

    public registerRenderer(renderer: WebGLRenderer): void {
        if (!(renderer instanceof WebGLRenderer)) {
            console.error("Renderer not supported.");
            return;
        }
        // renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault());
        renderer.domElement.addEventListener("pointermove", (e) => this._mouseDetected = e.pointerType === "mouse");
        renderer.domElement.addEventListener("pointerdown", (e) => this._isTapping = e.pointerType !== "mouse" && e.isPrimary);
        renderer.domElement.addEventListener("pointerup", (e) => this._isTapping &&= !e.isPrimary);
        //todo pointercancel or leave?
        this.bindEvents(renderer);
    }

    private bindEvents(renderer: WebGLRenderer): void {
        const domElement = renderer.domElement;
        domElement.addEventListener("pointercancel", this.enqueue.bind(this));
        domElement.addEventListener("pointerdown", this.enqueue.bind(this));
        domElement.addEventListener("pointermove", this.enqueue.bind(this));
        domElement.addEventListener("pointerup", this.enqueue.bind(this));
        domElement.addEventListener("wheel", this.enqueue.bind(this));
        domElement.addEventListener("keydown", this.enqueue.bind(this));
        domElement.addEventListener("keyup", this.enqueue.bind(this));
    }

    private enqueue(event: Event): void {
        this._queue.enqueue(event);
    }

    public update(scene: Scene, camera: Camera): void { //todo user active scene?
        //TODO check se canvas ha perso focus
        if (!this.enabled) return;
        this._primaryRaycasted = false;
        for (const event of this._queue.dequeue()) {
            this.computeQueuedEvent(event, scene, camera);
        }
        this.pointerIntersection(scene, camera);
        this._cursorManager.update(undefined, this.intersection[this._primaryIdentifier]?.object);
    }

    private raycastScene(scene: Scene, camera: Camera, event: PointerEvent): void {
        if (event.isPrimary) {
            this._primaryRaycasted = true;
            this._primaryIdentifier = event.pointerId;
        }
        this._lastIntersection[event.pointerId] = this.intersection[event.pointerId]; //todo remember delete
        const intersections = this.raycasterManager.getIntersections(scene, camera, event);
        this.intersection[event.pointerId] = intersections[0];
    }

    private triggerPointer(type: keyof InteractionEvents, event: PointerEvent, target: Object3D, relatedTarget?: Object3D): void {
        if (target) {
            const pointerEvent = new PointerEventExt(event, this.intersection[event.pointerId], this._lastIntersection[event.pointerId], relatedTarget);
            target.triggerEvent(type, pointerEvent);
        }
    }

    private triggerAncestorPointer(type: keyof InteractionEvents, event: PointerEvent, target: Object3D, relatedTarget?: Object3D, cancelable?: boolean): PointerEventExt {
        if (target) {
            const pointerEvent = new PointerEventExt(event, this.intersection[event.pointerId], this._lastIntersection[event.pointerId], relatedTarget, cancelable);
            target.triggerEventAncestor(type, pointerEvent);
            return pointerEvent;
        }
    }

    private triggerAncestorWheel(event: WheelEvent, intersection: IntersectionExt): void {
        if (intersection) {
            const wheelEvent = new WheelEventExt(event, intersection);
            intersection.object.triggerEventAncestor("wheel", wheelEvent);
        }
    }

    private computeQueuedEvent(event: Event, scene: Scene, camera: Camera): void {
        switch (event.type) {
            case "pointermove": return this.pointerMove(event as PointerEvent, scene, camera);
            case "pointerdown": return this.pointerDown(event as PointerEvent, scene, camera);
            case "pointerup": return this.pointerUp(event as PointerEvent);
            case "wheel": return this.wheel(event as WheelEvent);
            default: console.error("Error: computeEvent failed.");
        }
    }

    public isMainClick(event: PointerEvent): boolean {
        return event.isPrimary && ((event.pointerType === "mouse" && event.button === 0) || event.pointerType !== "mouse");
    }

    private pointerDown(event: PointerEvent, scene: Scene, camera: Camera): void {
        if (event.pointerType !== "mouse") { //todo controllare che non ci sia in queue anche
            this.raycastScene(scene, camera, event);
        }
        const target = this.intersection[event.pointerId]?.object;
        const pointerDownEvent = this.triggerAncestorPointer("pointerdown", event, target, undefined, true);
        this._lastPointerDown[event.pointerId] = event;
        this._lastPointerDownExt[event.pointerId] = pointerDownEvent;

        if (target) {
            //todo handle if pointer cancel
            target.clicked = this.isMainClick(event);
        }

        if (!pointerDownEvent?._defaultPrevented) {
            this.focus(event, target);
        }
    }

    private pointerMove(event: PointerEvent, scene: Scene, camera: Camera): void {
        this._lastPointerMove[event.pointerId] = event;
        this.pointerOutOver(scene, camera, event);
        const target = this.intersection[event.pointerId]?.object;
        if (!this._dragManager.performDrag(event, this.raycasterManager.raycaster, camera, target)) {
            this.triggerAncestorPointer("pointermove", event, target);
        }
    }

    private pointerIntersection(scene: Scene, camera: Camera): void {
        if (!this.continousPointerRaycasting) return;
        if (this._mouseDetected || this._isTapping) {
            if (!this._primaryRaycasted) {
                this.pointerOutOver(scene, camera, this._lastPointerMove[this._primaryIdentifier] || this._lastPointerDown[this._primaryIdentifier]);
            }
            const intersection = this.intersection[this._primaryIdentifier];
            intersection?.object.triggerEventAncestor("pointerintersection", new PointerIntersectionEvent(intersection, this._lastIntersection[this._primaryIdentifier]));
        }
    }

    private wheel(event: WheelEvent): void {
        this.triggerAncestorWheel(event, this.intersection[this._primaryIdentifier]);
    }

    private pointerOutOver(scene: Scene, camera: Camera, event: PointerEvent): void {
        this.raycastScene(scene, camera, event);
        const hoveredObj = this.intersection[event.pointerId]?.object;
        const lastHoveredObj = this._lastIntersection[event.pointerId]?.object;

        if (event.isPrimary) {
            lastHoveredObj && (lastHoveredObj.hovered = false);
            hoveredObj && (hoveredObj.hovered = true);
        }

        if (hoveredObj !== lastHoveredObj) {
            this.triggerAncestorPointer("pointerout", event, lastHoveredObj, hoveredObj);
            this.triggerPointer("pointerleave", event, lastHoveredObj, hoveredObj);
            this.triggerAncestorPointer("pointerover", event, hoveredObj, lastHoveredObj);
            this.triggerPointer("pointerenter", event, hoveredObj, lastHoveredObj);
        }
    }

    private pointerUp(event: PointerEvent): void {
        const target = this.intersection[event.pointerId]?.object;
        const lastPointerDownTarget = this._lastPointerDownExt[event.pointerId]?._target;
        let lastClick: PointerEventExt;

        if (!this._dragManager.stopDragging(event)) {
            this.triggerAncestorPointer("pointerup", event, target, lastPointerDownTarget);
            if (target && target === lastPointerDownTarget) {
                lastClick = this.triggerAncestorPointer("click", event, target);
            }
        }

        this._lastClick = this.dblClick(event, lastClick, target);

        if (lastPointerDownTarget && this.isMainClick(event)) {
            lastPointerDownTarget.clicked = false;
        }
    }

    private dblClick(event: PointerEvent, lastClick: PointerEventExt, target: Object3D): PointerEventExt {
        if (this.isMainClick(event) && lastClick) {
            const prevClick = this._lastClick;
            if (target === prevClick?._target && event.timeStamp - prevClick.timeStamp <= 300) {
                this.triggerAncestorPointer("dblclick", event, target);
                return undefined;
            }
            return lastClick;
        }
    }

    private focus(event: PointerEvent, target: Object3D): void { //TODO creare possibilità di settare focus manulamente
        if (!event.isPrimary) return;
        const activableObj = target?.activableObj;
        if (this.activeObj !== activableObj) {

            if (!this.disactiveWhenClickOut && !activableObj) return;

            const event = new FocusEventExt(activableObj);
            const oldActiveObj = this.activeObj;

            if (oldActiveObj) {
                oldActiveObj.active = false;
                oldActiveObj.triggerEventAncestor("blur", event);
                oldActiveObj.triggerEvent("focusout", event);
            }

            if (activableObj) {
                activableObj.active = true
                event.relatedTarget = oldActiveObj;
                activableObj.triggerEventAncestor("focus", event);
                activableObj.triggerEvent("focusin", event);
            }

            this.activeObj = activableObj;
        }
    }
}
