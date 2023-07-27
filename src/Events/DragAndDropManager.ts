import { Plane, Matrix4, Vector3, Raycaster, Camera, Object3D } from "three";
import { DragEventExt, InteractionEvents, IntersectionExt } from "./Events";

//todo check multitouch e isprimary
export class DragAndDropManager {
    private _plane = new Plane();
    private _offset = new Vector3(); //TODO ricalcolare se muove cam
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
        if (!event.isPrimary || !camera) return;

        this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(this._targetMatrixWorld));
        raycaster.ray.intersectPlane(this._plane, this._intersection);
        this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix);

        const dragEvent = this.trigger("drag", event, this._target, true, this._intersection, dropTargetIntersection?.object, dropTargetIntersection);

        if (!dragEvent._defaultPrevented && !this._target.position.equals(this._intersection)) {
            this._target.position.copy(this._intersection);
            this._target.updateMatrixWorld(true);
        }

        this.dropTargetEvent(event, dropTargetIntersection);
    }

    public startDragging(event: PointerEvent, raycaster: Raycaster, camera: Camera, target: Object3D): boolean {
        if (event.isPrimary && target && target.draggable && target.clicking) {
            this._target = target;
            target.dragging = true;
            this._startPosition.copy(target.position);
            const dragEvent = this.trigger("dragstart", event, target, true);

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

            const cancelEvent = this.trigger("dragcancel", event, this._target, true, undefined, this._lastDropTarget);
            if (!cancelEvent._defaultPrevented && !this._target.position.equals(this._startPosition)) {
                this._target.position.copy(this._startPosition);
            }

            if (this._lastDropTarget) {
                this.trigger("dragcancel", event, this._lastDropTarget, false, undefined, this._target);
            }

            this.dragEnd(event);
            this.clear();
        }
    }

    public stopDragging(event: PointerEvent): boolean {
        if (!this._target || !event.isPrimary) return false;
        this._target.dragging = false;

        if (this._lastDropTarget) {
            this.trigger("drop", event, this._lastDropTarget, false, undefined, this._target);
        }

        this.dragEnd(event);
        this.clear();
        return true;
    }

    private dragEnd(event: PointerEvent): void {
        const dragEvent = this.trigger("dragend", event, this._target, true, undefined, this._lastDropTarget);
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

    private trigger(type: keyof InteractionEvents, event: PointerEvent, target: Object3D, cancelable: boolean, position?: Vector3, relatedTarget?: Object3D, intersection?: IntersectionExt): DragEventExt {
        if (target) {
            const dragEvent = new DragEventExt(event, cancelable, this._dataTransfer, position, relatedTarget, intersection);
            target.triggerAncestor(type, dragEvent);
            return dragEvent;
        }
    }

    private dropTargetEvent(event: PointerEvent, dropTargetIntersection: IntersectionExt): void {
        if (this._findDropTarget) {
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
