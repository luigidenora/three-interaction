import { Events, Target } from "../Events/Events";

export const quaternionChangedEvent = "quaternionChanged";

/** @internal */
export function applyQuaternionPatch(parent: Target, eventName: keyof Events): void {
    const base = parent.quaternion._onChangeCallback;
    parent.quaternion._onChange(() => {
        base();
        parent.__eventsDispatcher.dispatchEvent(eventName);
    });
}
