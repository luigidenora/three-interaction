import { Object3D } from "three";

/** @internal */
export function applyQuaternionPatch(parent: Object3D): void {
    const base = parent.quaternion._onChangeCallback;
    parent.quaternion._onChange(() => {
        base();
        parent.needsRender(); //TODO fare solo se serve (se c'è smart rendering)
        parent.__eventsDispatcher.dispatchEvent("rotationchange");
    });
}
