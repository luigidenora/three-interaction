import { Object3D } from "three";

/** @internal */
export function applyEulerPatch(euler: any, parent: Object3D, eventName: string): void {
    euler._oldValue = euler.clone();
    const base = parent.rotation._onChangeCallback;

    parent.rotation._onChange(() => {
        base();
        parent.dispatchEvent({ type: eventName, oldValue: euler._oldValue });
        euler._oldValue.copy(euler);
    });
}
