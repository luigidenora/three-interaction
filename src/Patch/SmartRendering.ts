import { Object3D } from "three";
import { applyObject3DRotationPatch, applyObject3DVector3Patch } from "./Object3D";
import { setVec3ChangeCallback, setVec3ChangeCallbackSR } from "./Vector3";
import { setQuatChangeCallback, setQuatChangeCallbackSR } from "./Quaternion";
import { setEulerChangeCallback, setEulerChangeCallbackSR } from "./Euler";

/** @internal */
export function applySmartRenderingPatch(target: Object3D): void {
    if (target.scene.__smartRendering === true && target.__smartRenderingPatched !== true) {
        applyObject3DVector3Patch(target);
        applyObject3DRotationPatch(target);
        setVec3ChangeCallbackSR(target);
        setQuatChangeCallbackSR(target);
        setEulerChangeCallbackSR(target);
        overrideVisibility(target)
        target.__smartRenderingPatched = true;
    }
}

/** @internal */
export function removeSmartRenderingPatch(target: Object3D): void {
    if (target.__smartRenderingPatched === true) {
        setVec3ChangeCallback(target);
        setQuatChangeCallback(target);
        setEulerChangeCallback(target);
        restoreVisibility(target);
        target.__smartRenderingPatched = false;
    }
}

function overrideVisibility(target: Object3D): void {
    target.__visible = target.visible;
    Object.defineProperty(target, "visible", {
        get: function (this: Object3D) { return this.__visible },
        set: function (this: Object3D, value: boolean) {
            this.__visible = value;
            this.needsRender = true;
        },
        configurable: true
    });
}

function restoreVisibility(target: Object3D): void {
    Object.defineProperty(target, "visible", {
        value: target.__visible, writable: true, configurable: true
    });
    delete target.__visible;
}
