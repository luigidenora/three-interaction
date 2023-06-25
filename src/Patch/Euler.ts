import { Object3D } from "three";

/** @internal */
export function applyEulerPatch(target: Object3D): void {
    (target as any)._onChangeCallbackBase = target.rotation._onChangeCallback;

    if (target.__scene === undefined) return;

    if (target.__scene.__smartRendering === true) {
        setSmartRenderingChangeCallback(target);
    } else {
        setDefaultChangeCallback(target);
    }
}

/** @internal */
export function setEulerSmartRendering(target: Object3D, value: boolean): void {
    if (target.__rotationPatched === true) {
        if (value === true) {
            setSmartRenderingChangeCallback(target);
        } else {
            setDefaultChangeCallback(target);
        }
    }
}

/** @internal */
export function removeEulerCallback(target: Object3D): void {
    if (target.__rotationPatched === true) {
        target.rotation._onChangeCallback = (target as any)._onChangeCallbackBase;
    }
}

function setSmartRenderingChangeCallback(target: Object3D): void {
    target.rotation._onChangeCallback = () => {
        (target as any)._onChangeCallbackBase();
        target.__scene.__needsRender = true;
        target.__eventsDispatcher.dispatchEvent("rotationchange");
    };
}

function setDefaultChangeCallback(target: Object3D): void {
    target.rotation._onChangeCallback = () => {
        (target as any)._onChangeCallbackBase();
        target.__eventsDispatcher.dispatchEvent("rotationchange");
    };
}
