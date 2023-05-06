import { Plane, Matrix4, Vector3, Raycaster, Camera, Object3D } from "three";

export class DragManager {
    private _plane = new Plane();
    private _offset = new Vector3();
    private _intersection = new Vector3();
    private _worldPosition = new Vector3();
    private _inverseMatrix = new Matrix4();
    private _target: Object3D;

    //todo handle esc and drop and raycasting only su droptarget
    public performDrag(event: PointerEvent, raycaster: Raycaster, camera: Camera, target: Object3D): boolean {
        if (event.isPrimary) {
            if (this._target) {
                this.doDragging(raycaster, camera);
                return true;
            } else if (target && target.draggable && target.clicked) {
                this._target = target;
                this.startDragging(raycaster, camera); //todo check multitouch
                target.dragging = true;
                return true;
            }
        }
        return false;
    }

    private doDragging(raycaster: Raycaster, camera: Camera): void {
        this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));
        if (raycaster.ray.intersectPlane(this._plane, this._intersection)) {
            this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix);
            // if (!args.preventDefault) {
            this._target.position.copy(this._intersection);
            this._target.updateMatrixWorld(true);
        }
    }

    private startDragging(raycaster: Raycaster, camera: Camera): void {
        this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));
        if (raycaster.ray.intersectPlane(this._plane, this._intersection)) {
            this._inverseMatrix.copy(this._target.parent.matrixWorld).invert();
            this._offset.copy(this._intersection).sub(this._worldPosition.setFromMatrixPosition(this._target.matrixWorld));
        }
    }

    public stopDragging(event: PointerEvent): boolean {
        if (!this._target || !event.isPrimary) return false;
        this._target.dragging = false;
        this._target = undefined;
        return true;
    }
}
