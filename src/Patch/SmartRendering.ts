import { Object3D } from "three";
import { applyObject3DRotationPatch, applyObject3DVector3Patch } from "./Object3D";
import { setVec3ChangeCallback, setVec3ChangeCallbackSR } from "./Vector3";
import { setQuaternionDefaultChangeCallback, setQuaternionSmartRenderingChangeCallback } from "./Quaternion";
import { setEulerDefaultChangeCallback, setEulerSmartRenderingChangeCallback } from "./Euler";

/** @internal */
export function applySmartRenderingPatch(target: Object3D): void {
    if (target.scene.__smartRendering === true && target.__smartRenderingPatched !== true) {
        applyObject3DVector3Patch(target);
        applyObject3DRotationPatch(target);

        setVec3ChangeCallbackSR(target);
        setQuaternionSmartRenderingChangeCallback(target);
        setEulerSmartRenderingChangeCallback(target);

        //if visible is bound
        const visibleDescr = Object.getOwnPropertyDescriptor(target, "visible"); //TODO check performance
        if (visibleDescr !== undefined && visibleDescr.get === undefined) {
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

        const enabledDescr = Object.getOwnPropertyDescriptor(target, "enabled");
        if (enabledDescr !== undefined && enabledDescr.get === undefined) {
            target.__enabled = target.enabled;
            Object.defineProperty(target, "enabled", {
                get: function (this: Object3D) { return this.__enabled },
                set: function (this: Object3D, value: boolean) {
                    this.__enabled = value;
                    this.needsRender = true; //TODO capire
                },
                configurable: true
            });
        }

        target.__smartRenderingPatched = true;
    }
}

/** @internal */
export function removeSmartRenderingPatch(target: Object3D): void {
    if (target.__smartRenderingPatched === true) {
        setVec3ChangeCallback(target);
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
