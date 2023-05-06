import { Camera, Object3D, Scene, WebGLRenderer } from "three";
import { CursorHandler } from "./CursorManager";
import { DragManager } from "./DragManager";
import { FocusEventExt, InteractionEvents, IntersectionExt, PointerEventExt, PointerIntersectionEvent, WheelEventExt } from "./Events";
import { PointerEventsQueue } from "./InteractionEventsQueue";
import { RaycasterManager } from "./RaycasterManager";

export interface EventsManagerConfig {
    //
}

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
    private _lastClick: { [x: string]: PointerEventExt } = {};
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

    private triggerAncestorPointer(type: keyof InteractionEvents, event: PointerEvent, target: Object3D, relatedTarget?: Object3D, cancelable?: boolean): PointerEventExt {
        if (target) {
            const pointerEvent = new PointerEventExt(event, this.intersection[event.pointerId], this._lastIntersection[event.pointerId], relatedTarget, cancelable);
            target.triggerEventAncestor(type, pointerEvent);
            return pointerEvent;
        }
    }

    private triggerAncestorWheel(event: WheelEvent, target: Object3D): void {
        if (target) {
            const wheelEvent = new WheelEventExt(event, this.intersection[this._primaryIdentifier]);
            target.triggerEventAncestor("wheel", wheelEvent);
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

    private pointerDown(event: PointerEvent, scene: Scene, camera: Camera): void {
        if (event.pointerType !== "mouse") { //todo controllare che non ci sia in queue anche
            this.raycastScene(scene, camera, event);
        }
        const pointerDownEvent = this.triggerAncestorPointer("pointerdown", event, this.intersection[event.pointerId]?.object, undefined, true);
        this._lastPointerDown[event.pointerId] = event;
        this._lastPointerDownExt[event.pointerId] = pointerDownEvent;
        if (!pointerDownEvent?._defaultPrevented) {
            this.focus(event);
        }
    }

    private pointerMove(event: PointerEvent, scene: Scene, camera: Camera): void {
        this._lastPointerMove[event.pointerId] = event;
        this.pointerOutOver(scene, camera, event);
        this.triggerAncestorPointer("pointermove", event, this.intersection[event.pointerId]?.object);
    }

    private pointerIntersection(scene: Scene, camera: Camera): void {
        if (!this.continousPointerRaycasting) return;
        if ((this._mouseDetected || this._isTapping) && !this._primaryRaycasted) {
            this.pointerOutOver(scene, camera, this._lastPointerMove[this._primaryIdentifier] || this._lastPointerDown[this._primaryIdentifier]);
        }
        const intersection = this.intersection[this._primaryIdentifier];
        intersection?.object.triggerEventAncestor("pointerintersection", new PointerIntersectionEvent(intersection, this._lastIntersection[this._primaryIdentifier]));
    }

    private wheel(event: WheelEvent): void {
        this.triggerAncestorWheel(event, this.intersection[this._primaryIdentifier].object);
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
            this.triggerAncestorPointer("pointerleave", event, lastHoveredObj, hoveredObj);
            this.triggerAncestorPointer("pointerover", event, hoveredObj, lastHoveredObj);
            this.triggerAncestorPointer("pointerenter", event, hoveredObj, lastHoveredObj);
        }
    }

    private pointerUp(event: PointerEvent): void {
        const hoveredObj = this.intersection[event.pointerId]?.object;
        const lastPointerDown = this._lastPointerDownExt[event.pointerId]

        this.triggerAncestorPointer("pointerup", event, hoveredObj, lastPointerDown?._target as Object3D); //todo capire cast
        if (hoveredObj === (lastPointerDown?._target ?? null)) {
            const prevClick = this._lastClick[event.pointerId];
            this._lastClick[event.pointerId] = this.triggerAncestorPointer("click", event, hoveredObj);

            if (hoveredObj === prevClick?._target && event.timeStamp - prevClick.timeStamp <= 300) {
                this.triggerAncestorPointer("dblclick", event, hoveredObj);
                this._lastClick[event.pointerId] = undefined;
            }
        } else {
            this._lastClick[event.pointerId] = undefined;
        }
    }

    private focus(event: PointerEvent): void { //TODO creare possibilità di settare focus manulamente
        if (!event.isPrimary) return;
        const activableObj = this.intersection[event.pointerId]?.object.activableObj;
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