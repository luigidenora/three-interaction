import { Object3D } from "three";

const autoUpdateMatrix = true;

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
        for (const key in matrixUpdateQueue) {
            const target = matrixUpdateQueue[key];
            target.updateMatrix();
            target.updateMatrixWorld();
            //TODO frustum check se camera muove su tutto altrimenti solo su quelli aggiornati
        }
        matrixUpdateQueue = {};
    }
}