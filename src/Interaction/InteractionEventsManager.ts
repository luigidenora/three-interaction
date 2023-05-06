import { Camera, Object3D, OrthographicCamera, PerspectiveCamera, Raycaster, Scene, Vector2, WebGLRenderer, WebGLRenderTarget } from "three";
import { object3DList } from "../Patch/Object3D";
import { CursorHandler } from "./CursorManager";
import { InteractionEvents, FocusEventExt, IntersectionExt, PointerEventExt, PointerIntersectionEvent, WheelEventExt } from "./Events";
import { PointerEventsQueue } from "./InteractionEventsQueue";
import { DragManager } from "./DragManager";

export interface EventsManagerConfig {
    //
}

export class EventsManager {
    public enabled = true;
    public raycastGPU = false; //todo capire se ha senso
    public pickingTexture = new WebGLRenderTarget(1, 1); // todo move
    public intersectionSortComparer = (a: IntersectionExt, b: IntersectionExt) => { return a.distance === b.distance ? b.object.id - a.object.id : a.distance - b.distance };
    public continousPointerRaycasting = true; //for intersection event
    public disactiveWhenClickOut = false;
    public pointer = new Vector2();
    public pointerUv = new Vector2();
    public intersection: { [x: string]: IntersectionExt } = {};
    public activeObj: Object3D;
    private _primaryIdentifier: number;
    private _lastPointerDownExt: { [x: string]: PointerEventExt } = {};
    private _lastPointerDown: { [x: string]: PointerEvent } = {};
    private _lastPointerMove: { [x: string]: PointerEvent } = {};
    private _lastClick: { [x: string]: PointerEventExt } = {};
    private _lastIntersection: { [x: string]: IntersectionExt } = {};
    private _raycaster = new Raycaster();
    private _queue = new PointerEventsQueue();
    private _cursorHandler: CursorHandler;
    private _dragManager = new DragManager();
    private _primaryRaycasted: boolean;
    private _mouseDetected = false;
    private _isTapping = false;

    constructor(public renderer: WebGLRenderer) {
        this.registerRenderer(renderer);
        this._cursorHandler = new CursorHandler(renderer.domElement);
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
        this.bindEvents();
    }

    private bindEvents(): void {
        const canvas = this.renderer.domElement;
        canvas.addEventListener("pointercancel", this.enqueue.bind(this));
        canvas.addEventListener("pointerdown", this.enqueue.bind(this));
        canvas.addEventListener("pointermove", this.enqueue.bind(this));
        canvas.addEventListener("pointerup", this.enqueue.bind(this));
        canvas.addEventListener("wheel", this.enqueue.bind(this));
        canvas.addEventListener("keydown", this.enqueue.bind(this));
        canvas.addEventListener("keyup", this.enqueue.bind(this));
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
        this._cursorHandler.update(undefined, this.intersection[this._primaryIdentifier]?.object);
    }

    private raycastScene(scene: Scene, camera: Camera, event: PointerEvent): void {
        if (event.isPrimary) {
            this._primaryRaycasted = true;
            this._primaryIdentifier = event.pointerId;
        }
        this._lastIntersection[event.pointerId] = this.intersection[event.pointerId]; //todo remember delete
        this.updateCanvasPointerPosition(event);
        this._raycaster.setFromCamera(this.pointerUv, camera);
        const intersections = this.raycastGPU ? this.raycastObjectsGPU(scene, camera as any) : this.raycastObjects(scene, []);
        intersections.sort(this.intersectionSortComparer);
        this.intersection[event.pointerId] = intersections[0];
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

    private raycastObjectsGPU(scene: Scene, camera: PerspectiveCamera | OrthographicCamera): IntersectionExt[] {
        const width = this.renderer.domElement.width;
        const height = this.renderer.domElement.height;
        camera.setViewOffset(width, height, this.pointer.x * devicePixelRatio, this.pointer.y * devicePixelRatio, 1, 1);
        this.renderer.setRenderTarget(this.pickingTexture);
        this.renderer.render(scene, camera);
        camera.clearViewOffset();
        const pixelBuffer = new Uint8Array(4);
        this.renderer.readRenderTargetPixels(this.pickingTexture, 0, 0, 1, 1, pixelBuffer);
        const id = (pixelBuffer[0] << 16) | (pixelBuffer[1] << 8) | (pixelBuffer[2]);
        this.renderer.setRenderTarget(null);
        const object = object3DList[id];
        const target: IntersectionExt[] = [];

        if (object) {
            if (object.objectsToRaycast) {
                this._raycaster.intersectObjects(object.objectsToRaycast, false, target);
            } else {
                this._raycaster.intersectObject(object, false, target);
            }

            for (const intersection of target) {
                intersection.hitbox = intersection.object;
                intersection.object = object;
            }
        }

        return target;
    }

    private updateCanvasPointerPosition(event: PointerEvent): void {
        this.pointerUv.x = event.offsetX / this.renderer.domElement.clientWidth * 2 - 1;
        this.pointerUv.y = event.offsetY / this.renderer.domElement.clientHeight * -2 + 1;
        this.pointer.set(event.offsetX, event.offsetY);
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
