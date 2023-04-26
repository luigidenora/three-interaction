import { Object3D } from "three";

/** @internal */
export function applyQuaternionPatch(quaternion: any, parent: Object3D, eventName: string): void {
    quaternion._oldValue = quaternion.clone();
    const base = parent.quaternion._onChangeCallback;

    parent.quaternion._onChange(() => {
        base();
        parent.dispatchEvent({ type: eventName, oldValue: quaternion._oldValue });
        quaternion._oldValue.copy(quaternion);
    });
}
