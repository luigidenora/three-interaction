import { Object3D, Scene } from "three";
import { applyObject3DRotationPatch, applyObject3DVector3Patch } from "./Object3D";
import { setVec3ChangeCallback, setVec3ChangeCallbackSR } from "./Vector3";
import { setQuatChangeCallback, setQuatChangeCallbackSR } from "./Quaternion";
import { setEulerChangeCallback, setEulerChangeCallbackSR } from "./Euler";

/** @internal */
export function applySmartRenderingPatch(target: Object3D): void {
    if (target.scene.__smartRendering && !target.__smartRenderingPatched) {
        applyPatch(target);
    }
}

/** @internal */
export function removeSmartRenderingPatch(target: Object3D): void {
    if (target.__smartRenderingPatched) {
        setVec3ChangeCallback(target);
        setQuatChangeCallback(target);
        setEulerChangeCallback(target);
        restoreVisible(target);
        target.__smartRenderingPatched = false;
    }
}

/** @internal */
export function activeSmartRendering(scene: Scene): void {
    scene.__smartRendering = true;
    applySmartRenderingPatchRecursive(scene);
}

function overrideVisible(target: Object3D): void {
    target.__originalVisibleDescriptor = Object.getOwnPropertyDescriptor(target, "visible");
    Object.defineProperty(target, "visible", {
        get: function (this: Object3D) { return this.__visible },
        set: function (this: Object3D, value: boolean) {
            if (this.__visible !== value) {
                this.__visible = value;
                this.needsRender = true;
                this.__eventsDispatcher.dispatchDescendant("visiblechange", { value, target: this });
            }
        },
        configurable: true
    });
}

function restoreVisible(target: Object3D): void {
    Object.defineProperty(target, "visible", target.__originalVisibleDescriptor);
}

function applySmartRenderingPatchRecursive(target: Object3D): void {
    if (!target.__smartRenderingPatched) {
        applyPatch(target);
    }
    for (const child of target.children) {
        applySmartRenderingPatchRecursive(child);
    }
}

function applyPatch(target: Object3D): void {
    applyObject3DVector3Patch(target);
    applyObject3DRotationPatch(target);
    setVec3ChangeCallbackSR(target);
    setQuatChangeCallbackSR(target);
    setEulerChangeCallbackSR(target);
    overrideVisible(target);
    target.__smartRenderingPatched = true;
}
