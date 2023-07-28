import { Object3D, Scene } from "three";
import { Binding } from "../Binding/Binding";
import { Cursor } from "../Events/CursorManager";
import { Events } from "../Events/Events";
import { EventsDispatcher } from "../Events/EventsDispatcher";
import { applyEulerPatch } from "./Euler";
import { applyMatrix4Patch } from "./Matrix4";
import { applyQuaternionPatch } from "./Quaternion";
import { removeSceneReference, setSceneReference } from "./Scene";
import { applyVector3Patch } from "./Vector3";

export interface Object3DExtPrototype {
    enabled: boolean; //TODO Handle default true
    enabledUntilParent: boolean; //TODO Handle
    interceptByRaycaster: boolean; // default true
    objectsToRaycast: Object3D[]; //TODO handle hitbox
    focusable: boolean; // default true
    draggable: boolean; // default false
    hovered: boolean;
    focused: boolean;
    clicking: boolean;
    dragging: boolean;
    cursor: Cursor;
    cursorOnDrag: Cursor;
    findDropTarget: boolean;
    scene: Scene;
    needsRender: boolean;
    get firstFocusable(): Object3D;
    applyFocus(): void;
    applyBlur(): void;
    on<K extends keyof Events>(type: K | K[], listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    off<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    trigger<K extends keyof Events>(type: K, args: Events[K]): void;
    triggerAncestor<K extends keyof Events>(type: K, args: Events[K]): void;
    setManualDetectionMode(): void;
    detectChanges(recursive?: boolean): void;
    bindProperty<T extends keyof this>(property: T, getCallback: () => this[T], renderOnChange?: boolean): this;
    unbindProperty<T extends keyof this>(property: T): this;
}

Object3D.prototype.focusable = true;
Object3D.prototype.focused = false;
Object3D.prototype.clicking = false;
Object3D.prototype.dragging = false;
Object3D.prototype.draggable = false;
Object3D.prototype.hovered = false;
Object3D.prototype.interceptByRaycaster = true;
Object3D.prototype.enabled = true;
Object3D.prototype.findDropTarget = false;
Object3D.prototype.__manualDetection = false;

Object.defineProperty(Object3D.prototype, "firstFocusable", {
    get: function (this: Object3D) {
        let obj = this;
        while (obj && !obj.focusable) {
            obj = obj.parent;
        }
        return obj;
    },
    configurable: true
});

Object.defineProperty(Object3D.prototype, "needsRender", {
    get: function (this: Object3D) {
        return this.scene?.needsRender;
    },
    set: function (this: Object3D, value: boolean) {
        if (this.scene !== undefined) {
            this.scene.needsRender = value;
        }
    },
    configurable: true
});

Object3D.prototype.on = function (this: Object3D, types: any, listener) {
    if (typeof (types) === "string") {
        return this.__eventsDispatcher.addEventListener(types as any, listener);
    }
    for (const type of types) {
        this.__eventsDispatcher.addEventListener(type, listener);
    }
    return listener;
};

Object3D.prototype.hasEvent = function (type: any, listener) {
    return this.__eventsDispatcher.hasEventListener(type, listener);
}

Object3D.prototype.off = function (type: any, listener) {
    this.__eventsDispatcher.removeEventListener(type, listener);
}

Object3D.prototype.trigger = function (type: any, args) {
    this.__eventsDispatcher.dispatchDOMEvent(type, args);
}

Object3D.prototype.triggerAncestor = function (type: any, args) { //TODO Cambare nome
    this.__eventsDispatcher.dispatchDOMEventAncestor(type, args);
}

Object.defineProperty(Object3D.prototype, "userData", { // hack to inject code in constructor
    set: function (value) {
        this.__eventsDispatcher = new EventsDispatcher(this);
        Object.defineProperty(this, "userData", { // hack to inject code in constructor
            value, writable: true, configurable: true
        });
    },
    configurable: true
});

/** @Internal */
export function applyObject3DVector3Patch(target: Object3D): void {
    if (target.__vec3Patched !== true) {
        applyVector3Patch(target);
        applyMatrix4Patch(target);
        target.__vec3Patched = true;
    }
}

/** @Internal */
export function applyObject3DRotationPatch(target: Object3D): void {
    if (target.__rotationPatched !== true) {
        applyQuaternionPatch(target);
        applyEulerPatch(target);
        target.__rotationPatched = true;
    }
}

Object3D.prototype.applyFocus = function () {
    this.scene.focus(this);
};

Object3D.prototype.applyFocus = function () {
    this.scene.focus();
};

Object3D.prototype.setManualDetectionMode = function () {
    Binding.setManualDetectionMode(this);
};

Object3D.prototype.detectChanges = function (recursive = false) {
    Binding.detectChanges(this, recursive);
};

Object3D.prototype.bindProperty = function (property, getValue, renderOnChange) {
    Binding.bindProperty(property, this, getValue, renderOnChange);
    return this;
};

Object3D.prototype.unbindProperty = function (property) {
    Binding.unbindProperty(this, property);
    return this;
};

const addBase = Object3D.prototype.add;
Object3D.prototype.add = function (object: Object3D) {
    addBase.call(this, ...arguments);
    if (arguments.length === 1 && object !== this && object?.isObject3D === true) {
        if ((this as Scene).isScene === true) { //TODO provare ad isolare questa parte
            this.scene = this as Scene;
        }
        if (this.scene !== undefined) {
            setSceneReference(object, this.scene);
            this.scene.needsRender = true;
        }
    }
    return this;
};

const removeBase = Object3D.prototype.remove;
Object3D.prototype.remove = function (object: Object3D) {
    if (arguments.length == 1 && this.children.indexOf(object) !== -1) {
        if (this.scene !== undefined) {
            removeSceneReference(object);
            this.scene.needsRender = true;
        }
    }
    removeBase.call(this, ...arguments); //todo opt all call
    return this;
};
