import { Plane, Matrix4, Vector3, Raycaster, Camera, Object3D } from "three";
import { DragEventExt, InteractionEvents } from "./Events";

//todo check multitouch
export class DragManager {
    private _plane = new Plane();
    private _offset = new Vector3();
    private _intersection = new Vector3();
    private _worldPosition = new Vector3();
    private _inverseMatrix = new Matrix4();
    private _target: Object3D;

    public get isDragging(): boolean { return !!this._target }

    //todo handle esc and drop and raycasting only su droptarget
    public performDrag(event: PointerEvent, raycaster: Raycaster, camera: Camera, target: Object3D): boolean {
        if (event.isPrimary) {
            if (this._target) {
                this.doDragging(raycaster, camera);
                return true;
            } else if (target && target.draggable && target.clicked) {
                this._target = target;
                target.dragging = true;
                this.startDragging(raycaster, camera);
                return true;
            }
        }
        return false;
    }

    private doDragging(raycaster: Raycaster, camera: Camera): void {
        this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));
        if (raycaster.ray.intersectPlane(this._plane, this._intersection)) {
            this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix);
            const event = this.triggerEvent("drag", true, this._intersection);
            if (!event._defaultPrevented) {
                this._target.position.copy(this._intersection);
                this._target.updateMatrixWorld(true);
            }
        }
    }

    private startDragging(raycaster: Raycaster, camera: Camera): void {
        this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));
        if (raycaster.ray.intersectPlane(this._plane, this._intersection)) {
            this._inverseMatrix.copy(this._target.parent.matrixWorld).invert();
            this._offset.copy(this._intersection).sub(this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));
            this.triggerEvent("dragstart");
        }
    }

    public cancelDraggin(): void {
        if (this._target) {
            this._target.dragging = false;
            this.triggerEvent("dragend");
            this._target = undefined;
        }
    }

    public stopDragging(event: PointerEvent): boolean {
        if (!this._target || !event.isPrimary) return false;
        this._target.dragging = false;
        this.triggerEvent("dragend");
        this._target = undefined;
        return true;
    }

    private triggerEvent(type: keyof InteractionEvents, cancelable = false, position?: Vector3): DragEventExt {
        const dragEvent = new DragEventExt(cancelable, position);
        this._target.triggerEventAncestor(type, dragEvent);
        return dragEvent;
    }
}
