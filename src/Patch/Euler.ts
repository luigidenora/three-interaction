import { Object3D } from "three";

/** @internal */
export function applyEulerPatch(target: Object3D): void {
    (target as any).__onChangeCallbackBase = target.rotation._onChangeCallback;
    if (target.scene === undefined) return;
    if (target.scene.__smartRendering === true) {
        setEulerSmartRenderingChangeCallback(target);
    } else {
        setEulerDefaultChangeCallback(target);
    }
}

/** @internal */
export function setEulerSmartRenderingChangeCallback(target: Object3D): void {
    target.rotation._onChangeCallback = () => {
        (target as any).__onChangeCallbackBase();
        target.scene.needsRender = true;
        target.__eventsDispatcher.dispatch("rotationchange");
    };
}

/** @internal */
export function setEulerDefaultChangeCallback(target: Object3D): void {
    target.rotation._onChangeCallback = () => {
        (target as any).__onChangeCallbackBase();
        target.__eventsDispatcher.dispatch("rotationchange");
    };
}
