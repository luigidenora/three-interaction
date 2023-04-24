import { Object3D, Vector3 } from "three";

/**
 * @internal //TODO capire
 */
export const eventChangedName = "_vec3Changed";

const ignoredMethodsSet = new Set([
    // don't override because don't change values
    "constructor", "getComponent", "clone", "dot", "lengthSq", "length", "manhattanLength", "angleTo", "distanceTo", "distanceToSquared",
    "manhattanDistanceTo", "equals", "toArray",
    // don't override because they call a single other method already overriden (check legacy)
    "applyEuler", "applyAxisAngle", "divideScalar", "normalize", "cross", "projectOnPlane", "setFromSpherical", "setFromCylindrical", "setFromMatrixColumn", "setFromMatrix3Column"
]);

/**
 * @internal //TODO capire
 */
export function patchVector3(vec3: any, parent: Object3D, name: string): void {
    vec3._triggerInSetter = true;
    vec3._changed = false;
    vec3._rootEventName = undefined;
    vec3._oldValue = new Vector3();

    overrideProperty(vec3, "x", parent, name);
    overrideProperty(vec3, "y", parent, name);
    overrideProperty(vec3, "z", parent, name);

    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(vec3))) { //todo check performance for in
        if (typeof vec3[key] === "function" && !ignoredMethodsSet.has(key)) {
            overrideMethod(vec3, key, parent, name);
        }
    }
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

function overrideMethod(vec3: any, method: string, parent: Object3D, name: string) {
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
