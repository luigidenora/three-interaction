import { Object3D } from "three";
import { eventChangedName } from "../Events/EventsDispatcher";

/** @internal */
export function applyEulerPatch(euler: any, parent: Object3D, name: string): void {
    euler._oldValue = euler.clone();
    const base = parent.rotation._onChangeCallback;
    parent.rotation._onChange(() => {
        base();
        parent.dispatchEvent({ type: eventChangedName, oldValue: euler._oldValue, name });
        euler._oldValue.copy(euler);
    });
}
