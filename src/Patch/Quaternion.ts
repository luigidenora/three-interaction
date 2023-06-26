import { Object3D } from "three";

/** @internal */
export function applyQuaternionPatch(target: Object3D): void {
    (target as any).__onChangeCallbackBase = target.quaternion._onChangeCallback;
    if (target.__scene === undefined) return;
    if (target.__scene.__smartRendering === true) {
        setQuaternionSmartRenderingChangeCallback(target);
    } else {
        setQuaternionDefaultChangeCallback(target);
    }
}

/** @internal */
export function setQuaternionSmartRenderingChangeCallback(target: Object3D): void {
    target.quaternion._onChangeCallback = () => {
        (target as any).__onChangeCallbackBase();
        target.__scene.__needsRender = true;
        target.__eventsDispatcher.dispatchEvent("rotationchange");
    };
}

/** @internal */
export function setQuaternionDefaultChangeCallback(target: Object3D): void {
    target.quaternion._onChangeCallback = () => {
        (target as any).__onChangeCallbackBase();
        target.__eventsDispatcher.dispatchEvent("rotationchange");
    };
}
