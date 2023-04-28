import { Object3D } from "three";

export const rotationChangedEvent = "rotationChanged";

/** @internal */
export function applyEulerPatch(parent: Object3D, eventName: string): void {
    const base = parent.rotation._onChangeCallback;
    parent.rotation._onChange(() => {
        base();
        parent.dispatchEvent({ type: eventName });
    });
}
