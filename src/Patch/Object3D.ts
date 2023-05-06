import { Object3D } from "three";
import { Events } from "../Events/Events";
import { EventsDispatcher } from "../Events/EventsDispatcher";
import { bindAutoUpdateMatrixObject3D } from "./AutoUpdateMatrix";
import { applyVector3Patch } from "./Vector3";
import { applyQuaternionPatch } from "./Quaternion";
import { applyEulerPatch } from "./Euler";
import { applyMatrix4Patch } from "./Matrix4";
import { Cursor } from "../Events/CursorManager";

export interface InteractionPrototype {
    /** @internal */ __eventsDispatcher: EventsDispatcher;
    draggable: boolean;
    dragging: boolean;
    clicked: boolean;
    activable: boolean; // default false
    get activableObj(): Object3D; //TODO cache
    active: boolean;
    activeUntilParent: boolean; //TODO Handle
    hovered: boolean;
    enabled: boolean; //TODO Handle
    enabledUntilParent: boolean; //TODO Handle
    visibleUntilParent: boolean; //TODO Handle
    cursorOnHover: Cursor;
    cursorOnDrag: Cursor;
    interceptByRaycaster?: boolean; // default true
    objectsToRaycast?: Object3D[];
    bindEvent<K extends keyof Events>(type: K | K[], listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void;
    triggerEventAncestor<K extends keyof Events>(type: K, args: Events[K]): void;
}

export const object3DList: { [x: number]: Object3D } = {};

Object3D.prototype.activable = false;
Object3D.prototype.active = false;
Object3D.prototype.clicked = false;
Object3D.prototype.dragging = false;
Object3D.prototype.draggable = false;
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

Object3D.prototype.bindEvent = function (this: Object3D, types: any, listener) {
    if (typeof (types) === "string") {
        return this.__eventsDispatcher.addEventListener(types as any, listener);
    }
    for (const type of types) {
        this.__eventsDispatcher.addEventListener(type, listener);
    }
    return listener;
};

Object3D.prototype.hasBoundEvent = function (type: any, listener) {
    return this.__eventsDispatcher.hasEventListener(type, listener);
}

Object3D.prototype.unbindEvent = function (type: any, listener) {
    this.__eventsDispatcher.removeEventListener(type, listener);
}

Object3D.prototype.triggerEvent = function (type: any, args) {
    this.__eventsDispatcher.dispatchDOMEvent(type, args);
}

Object3D.prototype.triggerEventAncestor = function (type: any, args) {
    this.__eventsDispatcher.dispatchDOMEventAncestor(type, args);
}

Object.defineProperty(Object3D.prototype, "userData", { // hack to inject code in constructor
    set: function (value) {
        if (!this._patched) {
            object3DList[this.id] = this; //TODO gestire gpu id a parte per via di instanced mesh
            this.__eventsDispatcher = new EventsDispatcher(this);
            bindAutoUpdateMatrixObject3D(this);
            this._patched = true;
        }
        Object.defineProperty(this, "userData", { // hack to inject code in constructor
            value, writable: true
        });
    }
});

/** @Internal */
export function applyObject3DPatch(target: Object3D): void {
    if (!target.__patched) { //todo opt
        applyVector3Patch(target);
        applyQuaternionPatch(target);
        applyEulerPatch(target);
        applyMatrix4Patch(target);
        target.__patched = true;
    }
} 
