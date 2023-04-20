import { Object3D } from "three";
import { Events } from "./Events";
import { EventsDispatcher } from "./EventsDispatcher";

export interface InteractionPrototype {
    /** TODO. Default: true. */
    interceptByRaycaster: boolean;
    bindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void;
}

Object3D.prototype.interceptByRaycaster = true;

Object3D.prototype.bindEvent = function (type, listener) {
    (this as any)._eventsDispatcher ?? ((this as any)._eventsDispatcher = new EventsDispatcher(this));
    return ((this as any)._eventHandler as EventsDispatcher).addEventListener(type, listener);
};

Object3D.prototype.hasBoundEvent = function (type, listener) {
    (this as any)._eventsDispatcher ?? ((this as any)._eventsDispatcher = new EventsDispatcher(this));
    return ((this as any)._eventHandler as EventsDispatcher).hasEventListener(type, listener);
}

Object3D.prototype.unbindEvent = function (type, listener) {
    (this as any)._eventsDispatcher ?? ((this as any)._eventsDispatcher = new EventsDispatcher(this));
    ((this as any)._eventHandler as EventsDispatcher).removeEventListener(type, listener);
}

Object3D.prototype.triggerEvent = function (type, args) {
    (this as any)._eventsDispatcher ?? ((this as any)._eventsDispatcher = new EventsDispatcher(this));
    ((this as any)._eventHandler as EventsDispatcher).dispatchEvent(type, args);
}
