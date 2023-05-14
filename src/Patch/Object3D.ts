import { Object3D, Scene } from "three";
import { Binding, BindingCallback } from "../Binding/Binding";
import { Cursor } from "../Events/CursorManager";
import { Events } from "../Events/Events";
import { EventsDispatcher } from "../Events/EventsDispatcher";
import { EventsCache } from "../Events/MiscEventsManager";
import { Utils } from "../Utils/Utils";
import { applyEulerPatch } from "./Euler";
import { applyMatrix4Patch } from "./Matrix4";
import { applyQuaternionPatch } from "./Quaternion";
import { applyVector3Patch } from "./Vector3";

export interface Object3DExtPrototype extends BindingPrototype, InteractionPrototype { }

export interface BindingPrototype {
    /** @internal */ __boundCallbacks: BindingCallback[];
    /** @internal */ __manualDetection: boolean;
    /**
     * If 'manual' you need to call detectChanges() manually. Used to increase performance. Default: auto.
     */
    setManualDetectionMode(): void;
    /**
     * Executes all callbacks bound to this object (children excluded). 
     */
    detectChanges(): void;
    /**
     * Bind an expression to a property.
     * @param property Property name.
     * @param getCallback Callback that returns the value to bind.
     * @param bindAfterParentAdded If true you can use 'parent' property in the getCallback, avoiding null exception. Default: true.
     */
    bindProperty<T extends keyof this>(property: T, getCallback: () => this[T], bindAfterParentAdded?: boolean): this;
    /**
     * Remove a property binding.
     * @param property Property name.
     */
    unbindProperty<T extends keyof this>(property: T): this;
}

export interface InteractionPrototype {
    /** @internal */ __eventsDispatcher: EventsDispatcher;
    draggable: boolean;
    dragging: boolean;
    clicked: boolean;
    activable: boolean; // default true
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

Object3D.prototype.activable = true;
Object3D.prototype.active = false;
Object3D.prototype.clicked = false;
Object3D.prototype.dragging = false;
Object3D.prototype.draggable = false;
Object3D.prototype.hovered = false;
Object3D.prototype.enabled = true;
Object3D.prototype.interceptByRaycaster = true;

Object.defineProperty(Object3D.prototype, "activableObj", { //todo cache?
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

Object3D.prototype.triggerEventAncestor = function (type: any, args) { //TODO Cambare nome
    this.__eventsDispatcher.dispatchDOMEventAncestor(type, args);
}

Object.defineProperty(Object3D.prototype, "userData", { // hack to inject code in constructor
    set: function (value) {
        // object3DList[this.id] = this; //TODO gestire gpu id a parte per via di instanced mesh
        this.__eventsDispatcher = new EventsDispatcher(this);
        // bindAutoUpdateMatrixObject3D(this);
        Object.defineProperty(this, "userData", { // hack to inject code in constructor
            value, writable: true
        });
    }
});

/** @Internal */
export function applyObject3DVector3Patch(target: Object3D): void {
    if (!target.__vec3Patched) {
        applyVector3Patch(target);
        applyMatrix4Patch(target);
        target.__vec3Patched = true;
    }
}

/** @Internal */
export function applyObject3DRotationPatch(target: Object3D): void {
    if (!target.__rotationPatched) {
        applyQuaternionPatch(target);
        applyEulerPatch(target);
        target.__rotationPatched = true;
    }
}

/** BINDING */

Object3D.prototype.setManualDetectionMode = function () {
    if (!this.__boundCallbacks) {
        this.__manualDetection = true;
    } else {
        console.error("Cannot change detectChangesMode if a binding is already created.");
    }
};

Object3D.prototype.detectChanges = function () {
    Binding.computeSingle(this);
};

Object3D.prototype.bindProperty = function (property, getValue, bindAfterParentAdded = true) {
    if (bindAfterParentAdded && !this.parent && !(this as unknown as Scene).isScene) {
        const event = () => {
            Binding.createProperty(property, this, getValue);
            this.removeEventListener("added", event);
        };
        this.addEventListener("added", event);
    } else {
        Binding.createProperty(property, this, getValue);
    }
    return this;
};

Object3D.prototype.unbindProperty = function (property) {
    Binding.unbindByKey(this, property);
    return this;
};

const addBase = Object3D.prototype.add;
Object3D.prototype.add = function (object: Object3D) {
    addBase.call(this, ...arguments);
    if (arguments.length == 1 && object !== this && object?.isObject3D) {
        const scene = Utils.getSceneFromObj(this);
        Binding.bindObjAndChildrenToScene(object, scene);
    }
    return this;
};

const removeBase = Object3D.prototype.remove;
Object3D.prototype.remove = function (object: Object3D) {
    if (arguments.length == 1 && this.children.indexOf(object) !== -1) {
        const scene = Utils.getSceneFromObj(this);
        Binding.unbindObjAndChildrenFromScene(object, scene);
        EventsCache.remove(object, scene);
        //remove droptarget
        //remove objlist
    }
    removeBase.call(this, ...arguments);
    return this;
};
