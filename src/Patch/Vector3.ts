import { Object3D, Vector3 } from "three";
import { eventChangedName } from "../Events/EventsDispatcher";

const ignoredMethodsSet = new Set([
    // don't override because don't change values
    "constructor", "getComponent", "clone", "dot", "lengthSq", "length", "manhattanLength", "angleTo", "distanceTo", "distanceToSquared",
    "manhattanDistanceTo", "equals", "toArray",
    // don't override because they call a single other method already overriden (check legacy)
    "applyEuler", "applyAxisAngle", "divideScalar", "normalize", "cross", "projectOnPlane", "setFromSpherical", "setFromCylindrical", "setFromMatrixColumn", "setFromMatrix3Column"
]);

let methodToOverride: string[];

/**
 * @internal //TODO capire
 */
export function applyVector3Patch(vec3: any, parent: Object3D, name: string): void {
    vec3._triggerInSetter = true;
    vec3._changed = false;
    vec3._rootEventName = undefined;
    vec3._oldValue = vec3.clone();

    overrideProperty(vec3, "x", parent, name);
    overrideProperty(vec3, "y", parent, name);
    overrideProperty(vec3, "z", parent, name);

    for (const key of getKeysToOvveride()) {
        overrideMethod(vec3, key, parent, name);
    }
}

function getKeysToOvveride(): string[] {
    if (!methodToOverride) {
        methodToOverride = [];
        const proto = Vector3.prototype as any;
        for (const key of Object.getOwnPropertyNames(proto)) {
            if (typeof proto[key] === "function" && !ignoredMethodsSet.has(key)) {
                methodToOverride.push(key)
            }
        }
    }
    return methodToOverride;
}

function overrideProperty(vec3: any, property: keyof Vector3, parent: Object3D, name: string): void {
    const privateProperty = `_${property}`;
    vec3[privateProperty] = vec3[property];

    Object.defineProperty(vec3, property, {
        get: function () { return this[privateProperty] },
        set: function (value) {
            if (this[privateProperty] !== value) {
                if (this._triggerInSetter) {
                    this[privateProperty] = value;
                    parent.dispatchEvent({ type: eventChangedName, name, oldValue: this._oldValue });
                    this._oldValue.copy(this);
                } else {
                    this[privateProperty] = value;
                    this._changed = true;
                }
            }
        }
    });
}

function overrideMethod(vec3: any, method: string, parent: Object3D, name: string): void {
    const base = vec3[method].bind(vec3);

    vec3[method] = function () {
        if (!this._rootEventName) {
            this._rootEventName = method;
            this._triggerInSetter = false;
        }

        base(...arguments);

        if (this._rootEventName === method) {
            if (this._changed) {
                parent.dispatchEvent({ type: eventChangedName, name, oldValue: this._oldValue });
                this._oldValue.copy(this);
                this._changed = false;
            }
            this._triggerInSetter = true;
            this._rootEventName = undefined;
        }

        return this;
    }
}
