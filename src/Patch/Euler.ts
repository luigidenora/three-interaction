import { Object3D } from "three";

/** @internal */
export function applyEulerPatch(parent: Object3D): void {
    const base = parent.rotation._onChangeCallback;
    parent.rotation._onChange(() => {
        base();
        parent.__eventsDispatcher.dispatchEvent("rotationchange");
    });
}
