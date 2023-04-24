import { Object3D, Vector3 } from "three";

/**
 * @internal //TODO capire
 */
export const eventChangedName = "_vec3Changed";

/**
 * @internal //TODO capire
 */
export function patchVector3(vec3: Vector3, parent: Object3D, name: string): void {
    (vec3 as any)._triggerInSetter = true;
    (vec3 as any)._changed = false;
    (vec3 as any)._rootEventName = undefined;
    (vec3 as any)._oldValue = new Vector3();

    overrideProperty(vec3, "x", parent, name);
    overrideProperty(vec3, "y", parent, name);
    overrideProperty(vec3, "z", parent, name);

    overrideMethod(vec3, "set", parent, name);
    overrideMethod(vec3, "setScalar", parent, name);
    overrideMethod(vec3, "setX", parent, name);
    overrideMethod(vec3, "setY", parent, name);
    overrideMethod(vec3, "setZ", parent, name);
    overrideMethod(vec3, "setComponent", parent, name);
    overrideMethod(vec3, "copy", parent, name);
    overrideMethod(vec3, "addScalar", parent, name);
    overrideMethod(vec3, "addVectors", parent, name);
    overrideMethod(vec3, "addScaledVector", parent, name);
    overrideMethod(vec3, "sub", parent, name);
    overrideMethod(vec3, "subScalar", parent, name);
    overrideMethod(vec3, "subVectors", parent, name);
    overrideMethod(vec3, "multiply", parent, name);
    overrideMethod(vec3, "multiplyScalar", parent, name);
    overrideMethod(vec3, "multiplyVectors", parent, name);
    overrideMethod(vec3, "applyMatrix3", parent, name);
    overrideMethod(vec3, "applyNormalMatrix", parent, name);
    overrideMethod(vec3, "applyMatrix4", parent, name);
    overrideMethod(vec3, "applyQuaternion", parent, name);
    overrideMethod(vec3, "project", parent, name);
    overrideMethod(vec3, "unproject", parent, name);
    overrideMethod(vec3, "transformDirection", parent, name);
    overrideMethod(vec3, "divide", parent, name);
    overrideMethod(vec3, "min", parent, name);
    overrideMethod(vec3, "max", parent, name);
    overrideMethod(vec3, "clamp", parent, name);
    overrideMethod(vec3, "clampScalar", parent, name);
    overrideMethod(vec3, "clampLength", parent, name);
    overrideMethod(vec3, "floor", parent, name);
    overrideMethod(vec3, "ceil", parent, name);
    overrideMethod(vec3, "round", parent, name);
    overrideMethod(vec3, "roundToZero", parent, name);
    overrideMethod(vec3, "negate", parent, name);
    overrideMethod(vec3, "setLength", parent, name);
    overrideMethod(vec3, "lerp", parent, name);
    overrideMethod(vec3, "lerpVectors", parent, name);
    overrideMethod(vec3, "crossVectors", parent, name);
    overrideMethod(vec3, "projectOnVector", parent, name);
    overrideMethod(vec3, "reflect", parent, name);
    overrideMethod(vec3, "setFromSphericalCoords", parent, name);
    overrideMethod(vec3, "setFromCylindricalCoords", parent, name);
    overrideMethod(vec3, "setFromMatrixPosition", parent, name);
    overrideMethod(vec3, "setFromMatrixScale", parent, name);
    overrideMethod(vec3, "setFromEuler", parent, name);
    overrideMethod(vec3, "setFromColor" as any, parent, name);
    overrideMethod(vec3, "fromArray", parent, name);
    overrideMethod(vec3, "fromBufferAttribute", parent, name);
    overrideMethod(vec3, "random", parent, name);
    overrideMethod(vec3, "randomDirection", parent, name);

    // overrideMethod(vec3, "applyEuler", parent, name);
    // overrideMethod(vec3, "applyAxisAngle", parent, name);
    // overrideMethod(vec3, "divideScalar", parent, name);
    // overrideMethod(vec3, "normalize", parent, name);
    // overrideMethod(vec3, "cross", parent, name);
    // overrideMethod(vec3, "projectOnPlane", parent, name);
    // overrideMethod(vec3, "setFromSpherical", parent, name);
    // overrideMethod(vec3, "setFromCylindrical", parent, name);
    // overrideMethod(vec3, "setFromMatrixColumn", parent, name);
    // overrideMethod(vec3, "setFromMatrix3Column", parent, name);
}

function overrideProperty(vec3: any, property: keyof Vector3, parent: Object3D, name: string) {
    const privateProperty = `_${property}`;
    vec3[privateProperty] = vec3[property];

    Object.defineProperty(vec3, property, {
        get: function () { return this[privateProperty] },
        set: function (value) {
            if (this[privateProperty] !== value) {
                if (this._triggerInSetter) {
                    this._oldValue.set(this._x, this._y, this._z);
                    this[privateProperty] = value;
                    parent.dispatchEvent({ type: eventChangedName, name, oldValue: this._oldValue });
                } else {
                    this[privateProperty] = value;
                    this._changed = true;
                }
            }
        }
    });
}

function overrideMethod(vec3: any, method: keyof Vector3, parent: Object3D, name: string) {
    const base = vec3[method].bind(vec3);

    vec3[method] = function () {
        if (!this._rootEventName) {
            this._rootEventName = method;
            this._triggerInSetter = false;
            this._oldValue.set(this._x, this._y, this._z);
        }

        base(...arguments);

        if (this._rootEventName === method) {
            if (this._changed) {
                parent.dispatchEvent({ type: eventChangedName, name, oldValue: this._oldValue });
                this._changed = false;
            }
            this._triggerInSetter = true;
            this._rootEventName = undefined;
        }

        return this;
    }
}
