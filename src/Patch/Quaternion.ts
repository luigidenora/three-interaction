import { Target } from "../Events/Events";

export const quaternionChangedEvent = "quaternionChanged";

/** @internal */
export function applyQuaternionPatch(parent: Target, eventName: string): void {
    const base = parent.quaternion._onChangeCallback;
    parent.quaternion._onChange(() => {
        base();
        parent.dispatchEvent({ type: eventName });
    });
}
