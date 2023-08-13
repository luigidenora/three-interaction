import { Plane, Matrix4, Vector3, Raycaster, Camera, Object3D } from "three";
import { DragEventExt, InteractionEvents, IntersectionExt } from "./Events";

export class DragAndDropManager {
    public isDragging = false;
    private _plane = new Plane();
    private _offset = new Vector3(); //TODO recalculates if scale/rotation changes
    private _intersection = new Vector3();
    private _worldPosition = new Vector3();
    private _inverseMatrix = new Matrix4();
    private _startPosition = new Vector3();
    private _target: Object3D;
    private _targetMatrixWorld = new Matrix4();
    private _dataTransfer: { [x: string]: any };
    private _lastDropTarget: Object3D;
    private _raycaster: Raycaster;

    public get target(): Object3D { return this._target }

    constructor(raycaster: Raycaster) {
        this._raycaster = raycaster;
    }

    public needsDrag(event: PointerEvent, camera: Camera): boolean {
        if (this.isDragging) return true;
        if (this._target) {
            this.startDragging(event, camera);
            return true;
        }
        return false;
    }

    public performDrag(event: PointerEvent, camera: Camera, dropTargetIntersection: IntersectionExt): void {
        if (!event.isPrimary) return;

        this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(this._targetMatrixWorld));
        this._raycaster.ray.intersectPlane(this._plane, this._intersection);
        this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix);

        const dragEvent = this.trigger("drag", event, this._target, true, this._intersection, dropTargetIntersection?.object, dropTargetIntersection);

        if (!dragEvent._defaultPrevented && !this._target.position.equals(this._intersection)) {
            this._target.position.copy(this._intersection);
            this._target.updateMatrixWorld(true);
        }

        this.dropTargetEvent(event, dropTargetIntersection);
    }

    public initDrag(event: PointerEvent, target: Object3D): void {
        if (event.isPrimary && target?.draggable) {
            this._target = target;
        }
    }

    public startDragging(event: PointerEvent, camera: Camera): void {
        this._target.dragging = true;
        this.isDragging = true;
        this._startPosition.copy(this._target.position);
        this.trigger("dragstart", event, this._target, false);

        this._target.updateMatrixWorld(); //if transform target in dragstart event
        this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));
        this._raycaster.ray.intersectPlane(this._plane, this._intersection);
        this._targetMatrixWorld.copy(this._target.matrixWorld);
        this._inverseMatrix.copy(this._target.parent.matrixWorld).invert();
        this._offset.copy(this._intersection).sub(this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));

        if (this._target.findDropTarget) {
            this._dataTransfer = {};
        }
    }

    public cancelDragging(event: PointerEvent): boolean {
        if (this._target) {
            const cancelEvent = this.trigger("dragcancel", event, this._target, true, undefined, this._lastDropTarget);
            if (cancelEvent._defaultPrevented) return false;

            if (!this._target.position.equals(this._startPosition)) {
                this._target.position.copy(this._startPosition);
            }

            if (this._lastDropTarget) {
                this.trigger("dragcancel", event, this._lastDropTarget, false, undefined, this._target);
            }

            this.dragEnd(event);
            this.clear();
        }
        return true;
    }

    public stopDragging(event: PointerEvent): boolean {
        if (!event.isPrimary) return false;
        if (!this.isDragging) {
            this._target = undefined;
            return false;
        }

        if (this._lastDropTarget) {
            this.trigger("drop", event, this._lastDropTarget, false, undefined, this._target);
        }

        this.dragEnd(event);
        this.clear();
        return true;
    }

    private dragEnd(event: PointerEvent): void {
        this.trigger("dragend", event, this._target, false, undefined, this._lastDropTarget);
    }

    private clear(): void {
        this.isDragging = false;
        this._target.dragging = false;
        this._target = undefined;
        this._dataTransfer = undefined;
        this._lastDropTarget = undefined;
    }

    private trigger(type: keyof InteractionEvents, event: PointerEvent, target: Object3D, cancelable: boolean, position?: Vector3, relatedTarget?: Object3D, intersection?: IntersectionExt): DragEventExt {
        if (target) {
            const dragEvent = new DragEventExt(event, cancelable, this._dataTransfer, position, relatedTarget, intersection);
            target.triggerAncestor(type, dragEvent);
            return dragEvent;
        }
    }

    public dropTargetEvent(event: PointerEvent, dropTargetIntersection: IntersectionExt): void {
        if (this._target.findDropTarget) {
            const dropTarget = dropTargetIntersection?.object;
            const lastDropTarget = this._lastDropTarget;
            this._lastDropTarget = dropTarget;

            if (dropTarget !== lastDropTarget) { //documenta che il related target è sempre l'oggetto che stai draggando
                this.trigger("dragleave", event, lastDropTarget, false, dropTargetIntersection?.point, this._target, dropTargetIntersection);
                this.trigger("dragenter", event, dropTarget, false, dropTargetIntersection?.point, this._target, dropTargetIntersection);
            }

            if (dropTarget) {
                this.trigger("dragover", event, dropTargetIntersection.object, false, dropTargetIntersection.point, this._target, dropTargetIntersection);
            }
        }
    }
    
}
