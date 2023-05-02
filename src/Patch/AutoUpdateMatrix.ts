import { Object3D } from "three";
import { InstancedMeshSingle } from "../EnhancedObjects/InstancedMeshSingle";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";
import { InstancedMesh } from "../EnhancedObjects/InstancedMesh";

/** @internal */
export const autoUpdateMatrix = false;

Object3D.DEFAULT_MATRIX_AUTO_UPDATE = !autoUpdateMatrix;
Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !autoUpdateMatrix;

const object3DMatrixUpdateQueue = new DistinctTargetArray<Object3D>();
const instancedMatrixUpdateQueue = new DistinctTargetArray<InstancedMeshSingle>();

/** @internal */
export function bindAutoUpdateMatrixObject3D(target: Object3D): void {
    // target.matrixAutoUpdate readonly and only false? TODO
    // target.matrixWorldAutoUpdate  readonly and only false? TODO
    autoUpdateMatrix && target.bindEvent(["positionchange", "scalechange", "quaternionchange", "rotationchange"], () => {
        object3DMatrixUpdateQueue.push(target);
    });
}

/** @internal */
export function bindAutoUpdateMatrixInstancedMeshSingle(target: InstancedMeshSingle): void {
    autoUpdateMatrix && target.bindEvent(["positionchange", "scalechange", "quaternionchange", "rotationchange"], () => {
        instancedMatrixUpdateQueue.push(target);
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

        for (const target of instancedMatrixUpdateQueue.data) { //TODO add check profondità
            target.updateMatrix();
            (target.parent as InstancedMesh)._needsUpdate = true;
        }
        instancedMatrixUpdateQueue.clear();
    }
}
