import { Object3D, Vector3 } from "three";
import { Events } from "../Events";
import { EventsDispatcher } from "../EventsDispatcher";
import { patchVector3 } from "./Vector3";

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
    bindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void;
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

Object3D.prototype.bindEvent = function (type, listener) {
    (this as any)._eventsDispatcher ?? ((this as any)._eventsDispatcher = new EventsDispatcher(this));
    return (this as any)._eventsDispatcher.addEventListener(type.toLowerCase(), listener);
};

Object3D.prototype.hasBoundEvent = function (type, listener) {
    (this as any)._eventsDispatcher ?? ((this as any)._eventsDispatcher = new EventsDispatcher(this));
    return (this as any)._eventsDispatcher.hasEventListener(type.toLowerCase(), listener);
}

Object3D.prototype.unbindEvent = function (type, listener) {
    (this as any)._eventsDispatcher ?? ((this as any)._eventsDispatcher = new EventsDispatcher(this));
    (this as any)._eventsDispatcher.removeEventListener(type.toLowerCase(), listener);
}

Object3D.prototype.triggerEvent = function (type, args) {
    (this as any)._eventsDispatcher ?? ((this as any)._eventsDispatcher = new EventsDispatcher(this));
    (this as any)._eventsDispatcher.dispatchEvent(type.toLowerCase(), args);
}

Object3D.prototype.triggerEventAncestor = function (type, args) {
    (this as any)._eventsDispatcher ?? ((this as any)._eventsDispatcher = new EventsDispatcher(this));
    (this as any)._eventsDispatcher.dispatchEventAncestor(type.toLowerCase(), args);
}

Object.defineProperty(Object3D.prototype, "userData", { //hack to inject code in constructor
    get: function () { return this._userData },
    set: function (value) {
        if (!this._patched) {
            this.addEventListener();
            patchVector3(this.position, this, "position");
            patchVector3(this.scale, this, "scale");
            // patchEuler(this.position, this, "position");
            this._patched = true;
        }
        this._userData = value;
    }
});
