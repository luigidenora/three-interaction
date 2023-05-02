import { Object3D } from "three";
import { InstancedMeshSingle } from "../EnhancedObjects/InstancedMeshSingle";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";

/** @internal */
export const autoUpdateMatrix = false;

Object3D.DEFAULT_MATRIX_AUTO_UPDATE = !autoUpdateMatrix;
Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !autoUpdateMatrix;

const object3DMatrixUpdateQueue = new DistinctTargetArray<Object3D>();

/** @internal */
export function bindAutoUpdateMatrixObject3D(target: Object3D): void {
    // target.matrixAutoUpdate readonly and only false? TODO
    // target.matrixWorldAutoUpdate  readonly and only false? TODO
    autoUpdateMatrix && target.bindEvent(["positionchange", "scalechange", "quaternionchange", "rotationchange"], () => {
        object3DMatrixUpdateQueue.push(target);
    });
}

export function updateMatrices(): void { //todo solo su scena renderizzata
    if (autoUpdateMatrix) {
        for (const target of object3DMatrixUpdateQueue.data) { //TODO add check profondità
            target.updateMatrix();
            target.updateMatrixWorld();
            // target.frustumNeedsUpdate = true; //TODO anche i child
        }
        object3DMatrixUpdateQueue.clear();
    }
}
