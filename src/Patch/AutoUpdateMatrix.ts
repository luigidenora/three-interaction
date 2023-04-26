import { Object3D } from "three";

/** @internal */
export const autoUpdateMatrix = true;

Object3D.DEFAULT_MATRIX_AUTO_UPDATE = !autoUpdateMatrix;
Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !autoUpdateMatrix;

let matrixUpdateQueue: { [x: string]: Object3D } = {};

/** @internal */
export function bindAutoUpdateMatrix(target: Object3D): void {
    // target.matrixAutoUpdate readonly and only false? TODO
    // target.matrixWorldAutoUpdate  readonly and only false? TODO
    autoUpdateMatrix && target.bindEvent(["ownpositionchange", "ownscalechange", "ownrotationchange"], () => {
        matrixUpdateQueue[target.id] = target;
    });
}

export function updateMatrices(): void {
    if (autoUpdateMatrix) {
        for (const key in matrixUpdateQueue) { //TODO add check profondità
            const target = matrixUpdateQueue[key];
            target.updateMatrix();
            target.updateMatrixWorld();
            // target.frustumNeedsUpdate = true; //TODO anche i child
        }
        matrixUpdateQueue = {};
    }
}