import { Camera, Object3D, Raycaster, Renderer, Scene, Vector2 } from "three";
import { Events, IntersectionExt, PointerEventExt } from "./Events";
import { mouseEventExt, pointerEventExt } from "./EventsCreator";

export class EventsManager {
    // public raycastingORGPUType;
    public intersectionSortComparer = (a: IntersectionExt, b: IntersectionExt) => { return a.distance - b.distance };
    public enabled = true;
    public intersections: IntersectionExt[];
    public intersection: IntersectionExt;
    public hoveredObj: Object3D;
    public lastHoveredObj: Object3D;
    public lastPointerDown: PointerEventExt;
    public lastClick: PointerEventExt;
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

        canvas.addEventListener("pointercancel", (e) => { }); //TODO
        canvas.addEventListener("pointerdown", this.pointerDown.bind(this));
        canvas.addEventListener("pointermove", this.pointerMove.bind(this));
        canvas.addEventListener("pointerup", this.pointerUp.bind(this));

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
        this._continousRaycasting = true; //capire meglio sul mouse move
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

    private pointerDown(event: PointerEvent): void {
        this.triggerAncestor(this.hoveredObj, "pointerDown", this.lastPointerDown = pointerEventExt(event, "pointerDown", this.intersection));
    }

    private pointerMove(event: PointerEvent): void {
        this.lastHoveredObj = this.hoveredObj;
        this.updateCanvasPointerPositionMouse(event);
        this.hoveredObj = this.intersection?.object;

        if (this.lastHoveredObj !== this.hoveredObj) {
            this.triggerAncestor(this.lastHoveredObj, "pointerOut", pointerEventExt(event, "pointerOut", this.intersection, this.lastHoveredObj));
            this.triggerAncestor(this.hoveredObj, "pointerOver", pointerEventExt(event, "pointerOver", this.intersection));
        }
        this.triggerAncestor(this.hoveredObj, "pointerMove", pointerEventExt(event, "pointerMove", this.intersection));
    }

    private pointerUp(event: PointerEvent): void {
        //handling focus

        this.triggerAncestor(this.hoveredObj, "pointerUp", pointerEventExt(event, "pointerUp", this.intersection));

        if (this.hoveredObj !== this.lastPointerDown.target) return;
        const prevClick = this.lastClick;

        this.triggerAncestor(this.hoveredObj, "click", this.lastClick = pointerEventExt(event, "click", this.intersection));

        if (this.hoveredObj !== prevClick.target && event.timeStamp - prevClick.timeStamp <= 300) {
            this.triggerAncestor(this.hoveredObj, "dblClick", pointerEventExt(event, "dblClick", this.intersection));
            this.lastClick = undefined;
        }    
    }

    private mouseDown(event: MouseEvent): void {
        this.triggerAncestor(this.hoveredObj, "mouseDown", mouseEventExt(event, "mouseDown", this.intersection));
    }

    private mouseMove(event: MouseEvent): void {
        if (this.lastHoveredObj !== this.hoveredObj) {
            this.triggerAncestor(this.lastHoveredObj, "mouseOut", mouseEventExt(event, "mouseOut", this.intersection, this.lastHoveredObj));
            this.triggerAncestor(this.hoveredObj, "mouseOver", mouseEventExt(event, "mouseOver", this.intersection));
        }
        this.triggerAncestor(this.hoveredObj, "mouseMove", mouseEventExt(event, "mouseMove", this.intersection));
    }

    private mouseUp(event: MouseEvent): void {
        this.triggerAncestor(this.hoveredObj, "mouseUp", mouseEventExt(event, "mouseUp", this.intersection));

        if (this.hoveredObj !== this.lastPointerDown.target) return;
        const prevClick = this.lastClick;

        this.triggerAncestor(this.hoveredObj, "click", this.lastClick = mouseEventExt(event, "click", this.intersection));

        if (this.hoveredObj !== prevClick.target && event.timeStamp - prevClick.timeStamp <= 300) { //todo triggerDblClick
            this.triggerAncestor(this.hoveredObj, "dblClick", mouseEventExt(event, "dblClick", this.intersection));
            this.lastClick = undefined;
        }    
    }
}
