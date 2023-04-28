import { Object3D } from "three";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";
import { InstancedMeshSingle } from "../EnhancedObjects/InstancedMeshSingle";

/** @internal */
export const autoUpdateMatrix = true;

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
    target.bindEvent(["positionchange", "scalechange", "quaternionchange", "rotationchange"], () => {
        instancedMatrixUpdateQueue.push(target);
    });
}

export function updateMatrices(): void {
    if (autoUpdateMatrix) {
        for (const target of object3DMatrixUpdateQueue.data) { //TODO add check profondità
            target.updateMatrix();
            target.updateMatrixWorld();
            // target.frustumNeedsUpdate = true; //TODO anche i child
        }
        object3DMatrixUpdateQueue.clear();
    }

    for (const target of instancedMatrixUpdateQueue.data) { //TODO add check profondità
        target.updateMatrix();
    }
    instancedMatrixUpdateQueue.clear();
}
