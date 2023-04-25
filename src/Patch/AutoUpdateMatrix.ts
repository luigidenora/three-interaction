import { Object3D } from "three";

Object3D.DEFAULT_MATRIX_AUTO_UPDATE = false;
Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = false;

let matrixUpdateQueue: { [x: string]: Object3D } = {};

/** @internal */
export function bindAutoUpdateMatrix(target: Object3D): void {
    // target.matrixAutoUpdate readonly and only false? TODO
    // target.matrixWorldAutoUpdate  readonly and only false? TODO

    target.bindEvent(["ownpositionchange", "ownscalechange", "ownrotationchange"], () => {
        matrixUpdateQueue[target.id] = target;
    });
}

export function updateMatrices(): void {
    for (const key in matrixUpdateQueue) {
        const target = matrixUpdateQueue[key];
        target.updateMatrix();
        target.updateMatrixWorld();
        //add TODO compute bbbox for mesh? 
    }
    matrixUpdateQueue = {};
}