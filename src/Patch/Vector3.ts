import { Vector3 } from "three";
import { Events, Target } from "../Events/Events";

export const positionChangedEvent = "positionChanged";
export const scaleChangedEvent = "scaleChanged";

/** @internal */
export function applyVector3Patch(vec3: any, parent: Target, eventName: keyof Events): void { //todo fix d.ts
    vec3.parent = parent;
    overrideProperty(vec3, "x", parent, eventName);
    overrideProperty(vec3, "y", parent, eventName);
    overrideProperty(vec3, "z", parent, eventName);

    const proto = Vector3.prototype as any;
    for (const key of Object.getOwnPropertyNames(proto)) {
        if (typeof proto[key] === "function" && key !== "constructor") {
            overrideMethod(vec3, key, eventName);
        }
    }
}

function overrideProperty(vec3: any, property: keyof Vector3, parent: Target, eventName: keyof Events): void {
    const privateProperty = `_${property}`;
    vec3[privateProperty] = vec3[property];

    Object.defineProperty(vec3, property, {
        get: function () { return this[privateProperty] },
        set: function (value) {
            this[privateProperty] = value;
            parent.__eventsDispatcher.dispatchEvent(eventName);
        }
    });
}

const cachedMethods: { [x: string]: Function } = {};

function overrideMethod(vec3: any, method: string, eventName: keyof Events): void {
    if (!cachedMethods[method]) {
        const functionToOverride = vec3[method].toString();
        const startArgsIndex = functionToOverride.indexOf("(");
        const endArgsIndex = functionToOverride.indexOf(")");
        const startFunctionIndex = functionToOverride.indexOf("{");
        const args = functionToOverride.slice(startArgsIndex + 1, endArgsIndex).split(",");
    
        const overridenFunction = functionToOverride
            .slice(startFunctionIndex + 1, functionToOverride.length - 1)
            .replace("this.x", "this._x")
            .replace("this.y", "this._y")
            .replace("this.z", "this._z")
            .replace("return this", `this.parent.__eventsDispatcher.dispatchEvent("${eventName}"); return this`);

        cachedMethods[method] = new Function(...args, overridenFunction);
        console.log("calcolo " + method);
    }

    vec3[method] = cachedMethods[method].bind(vec3)
}
