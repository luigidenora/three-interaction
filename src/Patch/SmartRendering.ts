import { Object3D } from "three";
import { applyObject3DRotationPatch, applyObject3DVector3Patch } from "./Object3D";
import { setVector3DefaultChangeCallback, setVector3SmartRenderingChangeCallback } from "./Vector3";
import { setQuaternionDefaultChangeCallback, setQuaternionSmartRenderingChangeCallback } from "./Quaternion";
import { setEulerDefaultChangeCallback, setEulerSmartRenderingChangeCallback } from "./Euler";

/** @internal */
export function applySmartRenderingPatch(target: Object3D): void {
    if (target.__scene.__smartRendering === true && target.__smartRenderingPatched !== true) {
        applyObject3DVector3Patch(target);
        applyObject3DRotationPatch(target);

        setVector3SmartRenderingChangeCallback(target);
        setQuaternionSmartRenderingChangeCallback(target);
        setEulerSmartRenderingChangeCallback(target);

        target.__visible = target.visible;
        target.__enabled = target.enabled;

        Object.defineProperty(target, "visible", {
            get: function (this: Object3D) { return this.__visible },
            set: function (this: Object3D, value: boolean) {
                this.__visible = value;
                this.needsRender();
            },
            configurable: true
        });

        Object.defineProperty(target, "enabled", {
            get: function (this: Object3D) { return this.__enabled },
            set: function (this: Object3D, value: boolean) {
                this.__enabled = value;
                this.needsRender();
            },
            configurable: true
        });

        target.__smartRenderingPatched = true;
    }
}

/** @internal */
export function removeSmartRenderingPatch(target: Object3D): void {
    if (target.__smartRenderingPatched === true) {
        setVector3DefaultChangeCallback(target);
        setQuaternionDefaultChangeCallback(target);
        setEulerDefaultChangeCallback(target);

        Object.defineProperty(target, "visible", {
            value: target.__visible, writable: true, configurable: true
        });

        Object.defineProperty(target, "enabled", {
            value: target.__enabled, writable: true, configurable: true
        });

        target.__smartRenderingPatched = false;
    }
}
