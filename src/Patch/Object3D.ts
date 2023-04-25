import { Object3D } from "three";
import { Events } from "../Events/Events";
import { applyVector3Patch } from "./Vector3";
import { EventsDispatcher } from "../Events/EventsDispatcher";
import { applyEulerPatch } from "./Euler";
import { applyQuaternionPatch } from "./Quaternion";
import { bindAutoUpdateMatrix } from "./AutoUpdateMatrix";

export interface InteractionPrototype {
    activable: boolean; // default false
    get activableObj(): Object3D; //TODO cache
    active: boolean;
    activeUntilParent: boolean; //TODO Handle
    hovered: boolean;
    enabled: boolean; //TODO Handle
    enabledUntilParent: boolean; //TODO Handle
    visibleUntilParent: boolean; //TODO Handle
    interceptByRaycaster: boolean; // default true
    objectsToRaycast: Object3D[];
    bindEvent<K extends keyof Events>(type: K | K[], listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void;
    triggerEventAncestor<K extends keyof Events>(type: K, args: Events[K]): void;
}

Object3D.prototype.activable = false;
Object3D.prototype.active = false;
Object3D.prototype.hovered = false;
Object3D.prototype.enabled = true;
Object3D.prototype.interceptByRaycaster = true;

Object.defineProperty(Object3D.prototype, "activableObj", {
    get: function (this: Object3D) {
        let obj = this;
        while (obj && !obj.activable) {
            obj = obj.parent;
        }
        return obj;
    }
});

Object3D.prototype.bindEvent = function (this: any, types, listener) {
    if (typeof (types) === "string") {
        return this._eventsDispatcher.addEventListener(types.toLowerCase(), listener);
    }
    for (const type of types) {
        this._eventsDispatcher.addEventListener(type.toLowerCase(), listener);
    }
    return listener;
};

Object3D.prototype.hasBoundEvent = function (type, listener) {
    return (this as any)._eventsDispatcher.hasEventListener(type.toLowerCase(), listener);
}

Object3D.prototype.unbindEvent = function (type, listener) {
    (this as any)._eventsDispatcher.removeEventListener(type.toLowerCase(), listener);
}

Object3D.prototype.triggerEvent = function (type, args) {
    (this as any)._eventsDispatcher.dispatchEvent(type.toLowerCase(), args);
}

Object3D.prototype.triggerEventAncestor = function (type, args) {
    (this as any)._eventsDispatcher.dispatchEventAncestor(type.toLowerCase(), args);
}

Object.defineProperty(Object3D.prototype, "userData", { // hack to inject code in constructor
    get: function () { return this._userData },
    set: function (value) {
        if (!this._patched) {
            this._eventsDispatcher = new EventsDispatcher(this);
            applyVector3Patch(this.position, this, "position");
            applyVector3Patch(this.scale, this, "scale");
            applyEulerPatch(this.rotation, this, "rotation");
            applyQuaternionPatch(this.quaternion, this, "quaternion");
            this._patched = true;
            bindAutoUpdateMatrix(this);
        }
        this._userData = value;
    }
});
