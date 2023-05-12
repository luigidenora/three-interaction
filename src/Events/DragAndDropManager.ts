import { Plane, Matrix4, Vector3, Raycaster, Camera, Object3D } from "three";
import { DragEventExt, InteractionEvents, IntersectionExt } from "./Events";

//todo check multitouch e isprimary
export class DragAndDropManager {
    private _plane = new Plane();
    private _offset = new Vector3();
    private _intersection = new Vector3();
    private _worldPosition = new Vector3();
    private _inverseMatrix = new Matrix4();
    private _startPosition = new Vector3();
    private _target: Object3D;
    private _targetMatrixWorld = new Matrix4();
    private _findDropTarget = false;
    private _dataTransfer: { [x: string]: any };
    private _lastDropTarget: Object3D;

    public get isDragging(): boolean { return !!this._target }
    public get findDropTarget(): boolean { return this._findDropTarget }
    public get target(): Object3D { return this._target }

    public performDrag(event: PointerEvent, raycaster: Raycaster, camera: Camera, dropTargetIntersection: IntersectionExt): void {
        this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(this._targetMatrixWorld));
        raycaster.ray.intersectPlane(this._plane, this._intersection)
        this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix);

        const dragEvent = this.triggerEvent("drag", event, this._target, true, this._intersection, dropTargetIntersection?.object, dropTargetIntersection);

        if (!dragEvent._defaultPrevented && !this._target.position.equals(this._intersection)) {
            this._target.position.copy(this._intersection);
            this._target.updateMatrixWorld(true);
        }

        this.dropTargetEvent(event, dropTargetIntersection);
    }

    public startDragging(event: PointerEvent, raycaster: Raycaster, camera: Camera, target: Object3D): boolean {
        if (target && target.draggable && target.clicked) {
            this._target = target;
            target.dragging = true;
            this._startPosition.copy(target.position);
            const dragEvent = this.triggerEvent("dragstart", event, target, true);

            target.updateMatrixWorld(); //if transform target in dragstart event
            this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));
            raycaster.ray.intersectPlane(this._plane, this._intersection);
            this._targetMatrixWorld.copy(this._target.matrixWorld);
            this._inverseMatrix.copy(this._target.parent.matrixWorld).invert();
            this._offset.copy(this._intersection).sub(this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));
            this._findDropTarget = dragEvent._defaultPrevented;

            if (this._findDropTarget) {
                this._dataTransfer = {};
            }

            return true;
        }
    }

    public cancelDragging(event: PointerEvent): void {
        if (this._target) {
            this._target.dragging = false;

            const cancelEvent = this.triggerEvent("dragcancel", event, this._target, true, undefined, this._lastDropTarget);
            if (!cancelEvent._defaultPrevented && !this._target.position.equals(this._startPosition)) {
                this._target.position.copy(this._startPosition);
            }

            if (this._lastDropTarget) {
                this.triggerEvent("dragcancel", event, this._lastDropTarget, false, undefined, this._target);
            }

            this.dragEnd(event);
            this.clear();
        }
    }

    public stopDragging(event: PointerEvent): boolean {
        if (!this._target || !event.isPrimary) return false;
        this._target.dragging = false;

        if (this._lastDropTarget) {
            this.triggerEvent("drop", event, this._lastDropTarget, false, undefined, this._target);
        }

        this.dragEnd(event);
        this.clear();
        return true;
    }

    private dragEnd(event: PointerEvent): void {
        const dragEvent = this.triggerEvent("dragend", event, this._target, true, undefined, this._lastDropTarget);
        if (dragEvent._defaultPrevented) {
            this._target.position.copy(this._startPosition);
        }
    }

    private clear(): void {
        this._target = undefined;
        this._dataTransfer = undefined;
        this._lastDropTarget = undefined;
        this._findDropTarget = false;
    }

    private triggerEvent(type: keyof InteractionEvents, event: PointerEvent, target: Object3D, cancelable: boolean, position?: Vector3, relatedTarget?: Object3D, intersection?: IntersectionExt): DragEventExt {
        if (target) {
            const dragEvent = new DragEventExt(event, cancelable, this._dataTransfer, position, relatedTarget, intersection);
            target.triggerEventAncestor(type, dragEvent);
            return dragEvent;
        }
    }

    private dropTargetEvent(event: PointerEvent, dropTargetIntersection: IntersectionExt): void {
        if (this._findDropTarget) {

            const dropTarget = dropTargetIntersection?.object;
            const lastDropTarget = this._lastDropTarget;
            this._lastDropTarget = dropTarget;

            // // if (event.isPrimary) {
            // lastDropTarget && (lastDropTarget.hovered = false);
            // dropTarget && (dropTarget.hovered = true);
            // // }

            if (dropTarget !== lastDropTarget) { //documenta che il related target è sempre l'oggetto che stai draggando
                this.triggerEvent("dragleave", event, lastDropTarget, false, dropTargetIntersection?.point, this._target, dropTargetIntersection);
                this.triggerEvent("dragenter", event, dropTarget, false, dropTargetIntersection?.point, this._target, dropTargetIntersection);
            }

            if (dropTarget) {
                this.triggerEvent("dragover", event, dropTargetIntersection.object, false, dropTargetIntersection.point, this._target, dropTargetIntersection);
            }
        }
    }
}
