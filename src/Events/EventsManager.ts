import { Camera, Object3D, PerspectiveCamera, Raycaster, Scene, Vector2, WebGLRenderer, WebGLRenderTarget } from "three";
import { object3DList } from "../Patch/Object3D";
import { DOMEvents, FocusEventExt, IntersectionExt, PointerEventExt, PointerIntersectionEvent, WheelEventExt } from "./Events";
import { PointerEventsQueue } from "./EventsQueue";

export class EventsManager {
    public enabled = true;
    public raycastGPU = false; //todo capire se ha senso
    public pickingTexture = new WebGLRenderTarget(1, 1); // todo move
    public intersectionSortComparer = (a: IntersectionExt, b: IntersectionExt) => { return a.distance === b.distance ? b.object.id - a.object.id : a.distance - b.distance };
    public continousPointerRaycasting = true; //for intersection event
    public disactiveWhenClickOut = false;
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
    private _queue = new PointerEventsQueue();
    private _raycasted: boolean;
    private _mouseDetected = false;

    constructor(public renderer: WebGLRenderer) {
        this.registerRenderer(renderer);
    }

    public registerRenderer(renderer: WebGLRenderer): void {
        if (!(renderer instanceof WebGLRenderer)) {
            console.error("Renderer not supported.");
            return;
        }
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

    private triggerAncestorPointer(type: keyof DOMEvents, event: PointerEvent, target: Object3D, relatedTarget?: Object3D, cancelable?: boolean): PointerEventExt {
        if (target) {
            const pointerEvent = new PointerEventExt(event, this.intersection, this._lastIntersection, relatedTarget, cancelable);
            target.triggerEventAncestor(type, pointerEvent);
            return pointerEvent;
        }
    }

    private triggerAncestorWheel(event: WheelEvent, target: Object3D): void {
        if (target) {
            const wheelEvent = new WheelEventExt(event, this.intersection,);
            target.triggerEventAncestor("wheel", wheelEvent);
        }
    }

    private computeQueuedEvent(event: Event, scene: Scene, camera: Camera): void {
        switch (event.type) {
            case "pointermove": return this.pointerMove(event as PointerEvent, scene, camera);
            case "pointerdown": return this.pointerDown(event as PointerEvent);
            case "pointerup": return this.pointerUp(event as PointerEvent);
            case "wheel": return this.wheel(event as WheelEvent);
            default: console.error("Error: computeEvent failed.");
        }
    }

    private pointerDown(event: PointerEvent): void {
        this._lastPointerDown = this.triggerAncestorPointer("pointerdown", event, this.hoveredObj, undefined, true);
        if (!this._lastPointerDown?._defaultPrevented) {
            this.focus(event);
        }
    }

    private pointerMove(event: PointerEvent, scene: Scene, camera: Camera): void {
        this._lastPointerMove = event;
        this.updateCanvasPointerPosition(event);
        this.pointerOutOver(scene, camera, event);
        this.triggerAncestorPointer("pointermove", event, this.hoveredObj);
    }

    private pointerIntersection(scene: Scene, camera: Camera): void {
        if (!this.continousPointerRaycasting) return;
        if (this._mouseDetected && !this._raycasted) {
            this.pointerOutOver(scene, camera, this._lastPointerMove); //TODO bug se cambio 
        }
        if (this.hoveredObj) {
            this.hoveredObj.triggerEventAncestor("pointerintersection", new PointerIntersectionEvent(this.intersection, this._lastIntersection));
        }
    }

    private wheel(event: WheelEvent): void {
        this.triggerAncestorWheel(event, this.hoveredObj);
    }

    private pointerOutOver(scene: Scene, camera: Camera, event: PointerEvent): void {
        this._lastHoveredObj = this.hoveredObj;
        this.raycastScene(scene, camera);
        this.hoveredObj && (this.hoveredObj.hovered = false);
        this.hoveredObj = this.intersection?.object;
        this.hoveredObj && (this.hoveredObj.hovered = true);

        if (this._lastHoveredObj !== this.hoveredObj) {
            this.triggerAncestorPointer("pointerout", event, this._lastHoveredObj, this.hoveredObj);
            this.triggerAncestorPointer("pointerleave", event, this._lastHoveredObj, this.hoveredObj);
            this.triggerAncestorPointer("pointerover", event, this.hoveredObj, this._lastHoveredObj);
            this.triggerAncestorPointer("pointerenter", event, this.hoveredObj, this._lastHoveredObj);
        }
    }

    private pointerUp(event: PointerEvent): void {
        this.triggerAncestorPointer("pointerup", event, this.hoveredObj, this._lastPointerDown?._target as Object3D); //todo capire cast
        if (this.hoveredObj === (this._lastPointerDown?._target ?? null)) {
            const prevClick = this._lastClick;
            this._lastClick = this.triggerAncestorPointer("click", event, this.hoveredObj);

            if (this.hoveredObj === prevClick?._target && event.timeStamp - prevClick.timeStamp <= 300) {
                this.triggerAncestorPointer("dblclick", event, this.hoveredObj);
                this._lastClick = undefined;
            }
        } else {
            this._lastClick = undefined;
        }
    }

    private focus(event: PointerEvent): void { //TODO creare possibilità di settare focus manulamente
        const activableObj = this.hoveredObj?.activableObj;
        if (!event.isPrimary) return;
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
