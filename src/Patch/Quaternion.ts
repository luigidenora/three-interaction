import { Object3D } from "three";
import { eventChangedName } from "../Events/EventsDispatcher";

/** @internal */
export function applyQuaternionPatch(quaternion: any, parent: Object3D, name: string): void {
    quaternion._oldValue = quaternion.clone();
    const base = parent.quaternion._onChangeCallback;
    parent.quaternion._onChange(() => {
        base();
        parent.dispatchEvent({ type: eventChangedName, oldValue: quaternion._oldValue, name });
        quaternion._oldValue.copy(quaternion);
    });
}
