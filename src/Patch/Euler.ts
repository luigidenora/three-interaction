import { Object3D } from "three";
import { eventChangedName } from "../Events/EventsDispatcher";

/** @internal */
export function applyEulerPatch(euler: any, parent: Object3D): void {
    euler._oldValue = euler.clone();
    const base = parent.rotation._onChangeCallback;
    parent.rotation._onChange(() => {
        base();
        parent.dispatchEvent({ type: eventChangedName, oldValue: euler._oldValue });
        euler._oldValue.copy(euler);
    });
}
