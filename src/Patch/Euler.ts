import { Object3D } from "three";

/** @internal */
export function applyEulerPatch(parent: Object3D): void {
    (parent as any)._onChangeCallbackBase = parent.rotation._onChangeCallback;

    if (parent.__scene?.__smartRendering === true) {
        setSmartRenderingChangeCallback(parent);
    } else {
        setDefaultChangeCallback(parent);
    }
}

function setSmartRenderingChangeCallback(target: Object3D): void {
    target.rotation._onChange(() => {
        (target as any)._onChangeCallbackBase();
        target.needsRender(); //TODO fare solo se serve (se c'è smart rendering)
        target.__eventsDispatcher.dispatchEvent("rotationchange");
    });
}

function setDefaultChangeCallback(target: Object3D): void {
    target.rotation._onChange(() => {
        (target as any)._onChangeCallbackBase();
        target.__eventsDispatcher.dispatchEvent("rotationchange");
    });
}
