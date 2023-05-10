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
    private _dataTransfer: { [x: string]: any };

    public get isDragging(): boolean { return !!this._target }
    public get findDropTarget(): boolean { return this._findDropTarget }
    public get target(): Object3D { return this._target }

    public performDrag(event: PointerEvent, raycaster: Raycaster, camera: Camera, dropTargetInt: IntersectionExt): void {
        this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));
        raycaster.ray.intersectPlane(this._plane, this._intersection)
        this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix);
        const dragEvent = this.triggerEvent("drag", event, this._target, true, this._intersection, dropTargetInt?.object);
        if (!dragEvent._defaultPrevented && !this._target.position.equals(this._intersection)) {
            this._target.position.copy(this._intersection);
            this._target.updateMatrixWorld(true);
        }

        if (dropTargetInt) {
            this.triggerEvent("dragover", event,  dropTargetInt.object, false, dropTargetInt.point, this._target); //todo cancel? capire
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
                const dragEvent = this.triggerEvent("dragstart", event, this._target, true);
                this._findDropTarget = dragEvent._defaultPrevented;

                if (this._findDropTarget) {
                    this._dataTransfer = {};
                }
            }

            return true;
        }
    }

    public cancelDragging(event: PointerEvent): void {
        if (this._target) {
            this._target.dragging = false;
            this._target.position.copy(this._startPosition);
            this.triggerEvent("dragend", event, this._target); //todo gestire prevent default?
            this._target = undefined;
            this._dataTransfer = undefined;
        }
    }

    public stopDragging(event: PointerEvent): boolean {
        if (!this._target || !event.isPrimary) return false;
        this._target.dragging = false;
        this.triggerEvent("dragend", event, this._target);
        this._target = undefined;
        this._dataTransfer = undefined;
        return true;
    }

    //todo remove optional params 
    private triggerEvent(type: keyof InteractionEvents, event: PointerEvent, target: Object3D, cancelable?: boolean, position?: Vector3, relatedTarget?: Object3D): DragEventExt {
        const dragEvent = new DragEventExt(event, cancelable, this._dataTransfer, position, relatedTarget);
        target.triggerEventAncestor(type, dragEvent);
        return dragEvent;
    }
}
