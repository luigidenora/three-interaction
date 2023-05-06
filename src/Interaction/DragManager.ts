import { Plane, Matrix4, Vector3, Raycaster, Camera, Object3D } from "three";

/**
 * Preso spunto da drag controls
 * */
export class DragManager {
    private _plane = new Plane();
    private _offset = new Vector3();
    private _intersection = new Vector3();
    private _worldPosition = new Vector3();
    private _inverseMatrix = new Matrix4();

    public doDragging(raycaster: Raycaster, camera: Camera, target: Object3D): Vector3 {
        if (target) {
            this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(target.matrixWorld)); //important make it always to avoid problem with camera rotation during obj dragging
            if (raycaster.ray.intersectPlane(this._plane, this._intersection)) {
                return this._intersection.sub(this._offset).applyMatrix4(this._inverseMatrix);
            }
        }
    }

    public startDragging(raycaster: Raycaster, camera: Camera, target: Object3D): void {
        this._plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(this._plane.normal), this._worldPosition.setFromMatrixPosition(target.matrixWorld));
        if (raycaster.ray.intersectPlane(this._plane, this._intersection)) {
            this._inverseMatrix.copy(target.parent.matrixWorld).invert();
            this._offset.copy(this._intersection).sub(this._worldPosition.setFromMatrixPosition(target.matrixWorld));
        }
    }
}
