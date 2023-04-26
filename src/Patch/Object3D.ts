import { Object3D } from "three";
import { Events } from "../Events/Events";
import { EventsDispatcher } from "../Events/EventsDispatcher";
import { bindAutoUpdateMatrix } from "./AutoUpdateMatrix";
import { applyEulerPatch } from "./Euler";
import { applyQuaternionPatch } from "./Quaternion";
import { applyVector3Patch } from "./Vector3";

/** @internal */ export const positionChangedEvent = "positionChanged";
/** @internal */ export const scaleChangedEvent = "scaleChanged";
/** @internal */ export const rotationChangedEvent = "rotationChanged";
/** @internal */ export const quaternionChangedEvent = "quaternionChanged";

export interface InteractionPrototype {
    /** @internal */ _eventsDispatcher: EventsDispatcher;
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

export const object3DList: { [x: number]: Object3D } = {};

Object3D.prototype.activable = false;
Object3D.prototype.active = false;
Object3D.prototype.hovered = false;
Object3D.prototype.enabled = true;
Object3D.prototype.interceptByRaycaster = true;
// Object3D.prototype.frustumNeedsUpdate = true; //Todo

Object.defineProperty(Object3D.prototype, "activableObj", {
    get: function (this: Object3D) {
        let obj = this;
        while (obj && !obj.activable) {
            obj = obj.parent;
        }
        return obj;
    }
});

Object3D.prototype.bindEvent = function (this: Object3D, types: any, listener) {
    if (typeof (types) === "string") {
        return this._eventsDispatcher.addEventListener((types as any).toLowerCase(), listener);
    }
    for (const type of types) {
        this._eventsDispatcher.addEventListener(type.toLowerCase(), listener);
    }
    return listener;
};

Object3D.prototype.hasBoundEvent = function (type: any, listener) {
    return this._eventsDispatcher.hasEventListener(type.toLowerCase(), listener);
}

Object3D.prototype.unbindEvent = function (type: any, listener) {
    this._eventsDispatcher.removeEventListener(type.toLowerCase(), listener);
}

Object3D.prototype.triggerEvent = function (type: any, args) {
    this._eventsDispatcher.dispatchEvent(type.toLowerCase(), args);
}

Object3D.prototype.triggerEventAncestor = function (type: any, args) {
    this._eventsDispatcher.dispatchEventAncestor(type.toLowerCase(), args);
}

Object.defineProperty(Object3D.prototype, "userData", { // hack to inject code in constructor
    get: function () { return this._userData },
    set: function (value) {
        if (!this._patched) {
            object3DList[this.id] = this;
            this._eventsDispatcher = new EventsDispatcher(this);
            applyVector3Patch(this.position, this, positionChangedEvent);
            applyVector3Patch(this.scale, this, scaleChangedEvent);
            applyEulerPatch(this.rotation, this, rotationChangedEvent);
            applyQuaternionPatch(this.quaternion, this, quaternionChangedEvent);
            bindAutoUpdateMatrix(this);
            this._patched = true;
        }
        this._userData = value;
    }
});
