import { Object3D } from "three";
import { Events } from "./Events";
import { EventsDispatcher } from "./EventsDispatcher";

export interface InteractionPrototype {
    /** TODO. Default: true. */
    interceptByRaycaster: boolean;
    objectsToRaycast: Object3D[];
    bindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void;
}

Object3D.prototype.interceptByRaycaster = true;

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
