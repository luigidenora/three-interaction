import { Object3D } from "three";

/** @internal */
export function applyEulerPatch(parent: Object3D): void {
    const base = parent.rotation._onChangeCallback;
    parent.rotation._onChange(() => {
        base();
        parent.needsRender(); //TODO fare solo se serve (se c'è smart rendering)

        parent.__eventsDispatcher.dispatchEvent("rotationchange");
    });
}
