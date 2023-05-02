import { Object3D } from "three";
import { Events } from "../Events/Events";

export const rotationChangedEvent = "rotationChanged";

/** @internal */
export function applyEulerPatch(parent: Object3D, eventName: keyof Events): void {
    const base = parent.rotation._onChangeCallback;
    parent.rotation._onChange(() => {
        base();
        parent.__eventsDispatcher.dispatchEvent(eventName);
    });
}
