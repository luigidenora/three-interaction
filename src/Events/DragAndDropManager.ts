import { Plane, Matrix4, Vector3, Raycaster, Camera, Object3D } from "three";
import { DragEventExt, InteractionEvents, IntersectionExt } from "./Events";

//todo check multitouch
export class DragAndDropManager {
    private _plane = new Plane();
    private _offset = new Vector3();
    private _intersection = new Vector3();
    private _worldPosition = new Vector3();
    private _inverseMatrix = new Matrix4();
    private _startPosition = new Vector3();
    private _target: Object3D;
    private _findDropTarget: boolean;

    public get isDragging(): boolean { return !!this._target }
    public get findDropTarget(): boolean { return this._findDropTarget }
    public get target(): Object3D { return this._target }

    public performDrag(event: PointerEvent, raycaster: Raycaster, camera: Camera, dropTarget: IntersectionExt): void {
        this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));
        if (raycaster.ray.intersectPlane(this._plane, this._intersection)) {
            this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix);
            const dragEvent = this.triggerEvent("drag", event, true, this._intersection);
            if (!dragEvent._defaultPrevented) {
                this._target.position.copy(this._intersection);
                this._target.updateMatrixWorld(true);
            }
        }
    }

    public startDragging(event: PointerEvent, raycaster: Raycaster, camera: Camera, target: Object3D): boolean {
        if (target && target.draggable && target.clicked) {
            this._target = target;
            this._startPosition.copy(target.position);
            target.dragging = true;
            this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));
            if (raycaster.ray.intersectPlane(this._plane, this._intersection)) {
                this._inverseMatrix.copy(this._target.parent.matrixWorld).invert();
                this._offset.copy(this._intersection).sub(this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));
                const dragEvent = this.triggerEvent("dragstart", event, true);
                this._findDropTarget = dragEvent._defaultPrevented;
            }
            return true;
        }
    }

    public cancelDragging(event: PointerEvent): void {
        if (this._target) {
            this._target.dragging = false;
            this._target.position.copy(this._startPosition);
            this.triggerEvent("dragend", event); //todo gestire prevent default?
            this._target = undefined;
        }
    }

    public stopDragging(event: PointerEvent): boolean {
        if (!this._target || !event.isPrimary) return false;
        this._target.dragging = false;
        this.triggerEvent("dragend", event);
        this._target = undefined;
        return true;
    }

    private triggerEvent(type: keyof InteractionEvents, event: PointerEvent, cancelable = false, position?: Vector3): DragEventExt {
        const dragEvent = new DragEventExt(event, cancelable, position);
        this._target.triggerEventAncestor(type, dragEvent);
        return dragEvent;
    }
}
