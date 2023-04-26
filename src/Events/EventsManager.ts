import { Camera, Object3D, PerspectiveCamera, Raycaster, Scene, Vector2, WebGLRenderTarget, WebGLRenderer } from "three";
import { object3DList } from "../Patch/Object3D";
import { DOMEvents, FocusEventExt, IntersectionExt, MouseEventExt, PointerEventExt, PointerIntersectionEvent } from "./Events";
import { EventsQueue } from "./EventsQueue";

export class EventsManager {
    public enabled = true;
    public raycastGPU = false;
    public pickingTexture = new WebGLRenderTarget(1, 1); // todo move
    public intersectionSortComparer = (a: IntersectionExt, b: IntersectionExt) => { return a.distance === b.distance ? b.object.id - a.object.id : a.distance - b.distance };
    public continousPointerRaycasting = true; //for intersection event
    public disactiveWhenClickOut = false;
    public activeScene: Scene; //TODO remove?
    private pointer = new Vector2();
    private pointerUv = new Vector2();
    public intersections: IntersectionExt[];
    public intersection: IntersectionExt;
    public activeObj: Object3D;
    public hoveredObj: Object3D;
    private _lastHoveredObj: Object3D;
    private _lastPointerDown: PointerEventExt;
    private _lastPointerMove: PointerEvent;
    private _lastClick: PointerEventExt;
    private _lastIntersection: IntersectionExt;
    private _raycaster = new Raycaster();
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

    constructor(public renderer: WebGLRenderer, activeScene?: Scene) {
        this.registerRenderer(renderer);
        this.activeScene = activeScene;
    }

    public registerRenderer(renderer: WebGLRenderer): void {
        // TODO check se WebGLRenderer
        renderer.domElement.addEventListener("contextmenu", (e) => e.preventDefault());
        renderer.domElement.addEventListener("mousemove", () => this._mouseDetected = true); //TODO togliere l'evento dopo il primo trigger e aggiungere touch to fix surface
        this.bindEvents();
    }

    private bindEvents(): void {
        const cavas = this.renderer.domElement;
        cavas.addEventListener("pointercancel", this.enqueue.bind(this));
        cavas.addEventListener("pointerdown", this.enqueue.bind(this));
        cavas.addEventListener("pointermove", this.enqueue.bind(this));
        cavas.addEventListener("pointerup", this.enqueue.bind(this));
        cavas.addEventListener("wheel", this.enqueue.bind(this));
        cavas.addEventListener("keydown", this.enqueue.bind(this));
        cavas.addEventListener("keyup", this.enqueue.bind(this));
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

    private raycastScene(scene: Scene, camera: Camera): void {
        this._raycasted = true;
        this._lastIntersection = this.intersection;
        this._raycaster.setFromCamera(this.pointerUv, camera);

        if (this.raycastGPU) {
            this.intersections = this.raycastObjectsGPU(scene, camera as PerspectiveCamera); //todo remove cast
        } else {
            this.intersections = this.raycastObjects(scene, []);
        }

        this.intersections.sort(this.intersectionSortComparer);
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

    private raycastObjectsGPU(scene: Scene, camera: PerspectiveCamera): IntersectionExt[] {
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

    private updateCanvasPointerPosition(event: MouseEvent): void {
        this.pointerUv.x = event.offsetX / this.renderer.domElement.clientWidth * 2 - 1;
        this.pointerUv.y = event.offsetY / this.renderer.domElement.clientHeight * -2 + 1;
        this.pointer.set(event.offsetX, event.offsetY);
    }

    private triggerAncestorPointer(type: keyof DOMEvents, event: PointerEvent, target = this.hoveredObj, relatedTarget?: Object3D): PointerEventExt {
        if (target) {
            const pointerEvent = new PointerEventExt(event, this.intersection, this._lastIntersection, relatedTarget);
            target.triggerEventAncestor(type, pointerEvent);
            return pointerEvent;
        }
    }

    private triggerAncestorPointerMulti(types: (keyof DOMEvents)[], event: PointerEvent, target = this.hoveredObj, relatedTarget?: Object3D): PointerEventExt {
        if (target) {
            const isMouse = event.pointerType === "mouse";
            const isTouch = event.pointerType === "touch" || event.pointerType === "pen";
            const pointerEvent = new PointerEventExt(event, this.intersection, this._lastIntersection, relatedTarget);
            target.triggerEventAncestor(types[0], pointerEvent);
            types[1] && isMouse && target.triggerEventAncestor(types[1], new MouseEventExt(event, this.intersection, this._lastIntersection, relatedTarget));
            // types[2] && isTouch && target.triggerEventAncestor(types[2], toucheventext(types[2], event, target, this.intersection));
            return pointerEvent;
        }
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
        this.updateCanvasPointerPosition(event);
        this.pointerOutOver(scene, camera, event);
        this.triggerAncestorPointerMulti(this._pointerMoveEvents, event);
    }

    private pointerIntersection(scene: Scene, camera: Camera): void {
        if (!this.continousPointerRaycasting) return;
        if (this._mouseDetected && !this._raycasted) {
            this.pointerOutOver(scene, camera, this._lastPointerMove);
        }
        if (this.hoveredObj /* && !Utils.areVector3Equals(this.intersection.point, this._lastIntersection?.point) */) {
            this.hoveredObj.triggerEventAncestor("pointerintersection", new PointerIntersectionEvent(this.intersection, this._lastIntersection));
        }
    }

    private pointerOutOver(scene: Scene, camera: Camera, event: PointerEvent): void {
        this._lastHoveredObj = this.hoveredObj;
        this.raycastScene(scene, camera);
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
        this.triggerAncestorPointerMulti(this._pointerUpEvents, event, this.hoveredObj, this._lastPointerDown?._target);
        if (this.hoveredObj === (this._lastPointerDown?._target ?? null)) {
            const prevClick = this._lastClick;
            this._lastClick = this.triggerAncestorPointer("click", event);

            if (this.hoveredObj === prevClick?._target && event.timeStamp - prevClick.timeStamp <= 300) {
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

            if (!this.disactiveWhenClickOut && !activableObj) return;

            const event = new FocusEventExt(activableObj);
            const oldActiveObj = this.activeObj;

            if (oldActiveObj) {
                oldActiveObj.active = false;
                oldActiveObj.triggerEventAncestor("blur", event);
                oldActiveObj.triggerEvent("focusOut", event);
            }

            if (activableObj) {
                activableObj.active = true
                event.relatedTarget = oldActiveObj;
                activableObj.triggerEventAncestor("focus", event);
                activableObj.triggerEvent("focusIn", event);
            }

            this.activeObj = activableObj;
        }
    }
}
