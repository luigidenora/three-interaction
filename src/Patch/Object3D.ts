import { Object3D, Scene } from "three";
import { Binding, BindingCallback } from "../Binding/Binding";
import { Cursor } from "../Events/CursorManager";
import { Events } from "../Events/Events";
import { EventsDispatcher } from "../Events/EventsDispatcher";
import { applyEulerPatch } from "./Euler";
import { applyMatrix4Patch } from "./Matrix4";
import { applyQuaternionPatch } from "./Quaternion";
import { removeSceneReference, setSceneReference } from "./Scene";
import { applyVec3Patch } from "./Vector3";
import { Tween } from "../Tweening/Tween";

/** @internal */
export interface Object3DExtPrototypeInternal extends Object3DExtPrototype {
    hovered: boolean;
    focused: boolean;
    clicking: boolean;
    dragging: boolean;
    __boundCallbacks: BindingCallback[];
    __manualDetection: boolean;
    __eventsDispatcher: EventsDispatcher;
    __vec3Patched: boolean;
    __rotationPatched: boolean;
    __smartRenderingPatched: boolean;
    __enabled: boolean;
    __visible: boolean;
    __isDropTarget: boolean;
    __originalVisibleDescriptor: PropertyDescriptor;
}

export interface Object3DExtPrototype {
    enabled: boolean; //TODO Handle default true
    interceptByRaycaster: boolean; // default true
    hitboxes: Object3D[];
    focusable: boolean; // default true
    draggable: boolean; // default false
    findDropTarget: boolean;
    scene: Scene;
    cursor: Cursor;
    cursorDrag: Cursor;
    cursorDrop: Cursor;
    needsRender: boolean;
    get hovered(): boolean;
    get focused(): boolean;
    get clicking(): boolean;
    get dragging(): boolean;
    get enabledUntilParent(): boolean;
    get firstFocusable(): Object3D;
    applyFocus(): void;
    applyBlur(): void;
    on<K extends keyof Events>(type: K | K[], listener: (event?: Events[K]) => void): (event?: Events[K]) => void;
    hasEvent<K extends keyof Events>(type: K, listener: (event?: Events[K]) => void): boolean;
    off<K extends keyof Events>(type: K, listener: (event?: Events[K]) => void): void;
    trigger<K extends keyof Events>(type: K, event?: Events[K]): void;
    /** Works only with InteractionEvents */
    triggerAncestor<K extends keyof Events>(type: K, event?: Events[K]): void;
    setManualDetectionMode(): void;
    detectChanges(recursive?: boolean): void;
    bindProperty<T extends keyof this>(property: T, getCallback: () => this[T], renderOnChange?: boolean): this;
    unbindProperty<T extends keyof this>(property: T): this;
    tween(): Tween<this>;
}

Object3D.prototype.focusable = true;
Object3D.prototype.focused = false;
Object3D.prototype.clicking = false;
Object3D.prototype.dragging = false;
Object3D.prototype.draggable = false;
Object3D.prototype.hovered = false;
Object3D.prototype.interceptByRaycaster = true;
Object3D.prototype.findDropTarget = false;
Object3D.prototype.__manualDetection = false;

Object3D.prototype.__visible = true;
Object.defineProperty(Object3D.prototype, "visible", {
    get: function (this: Object3D) { return this.__visible },
    set: function (this: Object3D, value: boolean) {
        if (this.__visible !== value) {
            this.__visible = value;
            this.__eventsDispatcher.dispatchDescendant("visiblechange", { value, target: this });
        }
    },
    configurable: true
});

Object3D.prototype.__enabled = true;
Object.defineProperty(Object3D.prototype, "enabled", {
    get: function (this: Object3D) { return this.__enabled },
    set: function (this: Object3D, value: boolean) {
        if (this.__enabled !== value) {
            this.__enabled = value;
            this.__eventsDispatcher.dispatchDescendant("enabledchange", { value, target: this });
        }
    },
    configurable: true
});

Object.defineProperty(Object3D.prototype, "firstFocusable", {
    get: function (this: Object3D) {
        let obj = this;
        while (!obj?.focusable) {
            obj = obj.parent;
        }
        return obj;
    }
});

Object.defineProperty(Object3D.prototype, "enabledUntilParent", {
    get: function (this: Object3D) {
        let obj = this;
        do {
            if (obj.enabled !== true) return false;
        } while (obj = obj.parent);
        return true;
    }
});

Object.defineProperty(Object3D.prototype, "needsRender", {
    get: function (this: Object3D) {
        return this.scene?.needsRender;
    },
    set: function (this: Object3D, value: boolean) {
        if (!this.scene) return;
        this.scene.needsRender = value;
    }
});

Object3D.prototype.on = function <K extends keyof Events>(this: Object3D, types: K | K[], listener: (event: Events[K]) => void): (event: Events[K]) => void {
    if (typeof (types) === "string") {
        return this.__eventsDispatcher.add(types, listener);
    }
    for (const type of types) {
        this.__eventsDispatcher.add(type, listener);
    }
    return listener;
};

Object3D.prototype.hasEvent = function <K extends keyof Events>(type: K, listener: (event: Events[K]) => void): boolean {
    return this.__eventsDispatcher.has(type, listener);
}

Object3D.prototype.off = function <K extends keyof Events>(type: K, listener: (event: Events[K]) => void): void {
    this.__eventsDispatcher.remove(type, listener);
}

Object3D.prototype.trigger = function <T extends keyof Events>(type: T, event?: Events[T]): void {
    this.__eventsDispatcher.dispatchManual(type, event);
}

Object3D.prototype.triggerAncestor = function <T extends keyof Events>(type: T, event?: Events[T]): void {
    this.__eventsDispatcher.dispatchAncestorManual(type, event);
}

Object.defineProperty(Object3D.prototype, "userData", { // needed to inject code in constructor
    set: function (value) {
        this.__eventsDispatcher = new EventsDispatcher(this);
        Object.defineProperty(this, "userData", {
            value, writable: true, configurable: true
        });
    },
    configurable: true
});

/** @Internal */
export function applyObject3DVector3Patch(target: Object3D): void {
    if (target.__vec3Patched !== true) {
        applyVec3Patch(target);
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
    if (!this.scene) {
        console.error("Cannot apply focus if the object is not added to a scene.");
    }
    this.scene.focus(this);
};

Object3D.prototype.applyBlur = function () {
    this.scene?.focus();
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

Object3D.prototype.tween = function () {
    return new Tween(this);
};

/** @internal */
export const addBase = Object3D.prototype.add;
Object3D.prototype.add = function (object: Object3D) {
    addBase.call(this, ...arguments);
    if (arguments.length === 1 && object?.isObject3D && object !== this && this.scene) {
        setSceneReference(object, this.scene);
        this.scene.needsRender = true;
    }
    return this;
};

/** @internal */
export const removeBase = Object3D.prototype.remove;
Object3D.prototype.remove = function (object: Object3D) {
    if (arguments.length === 1 && this.children.indexOf(object) > -1) {
        if (this.scene) {
            removeSceneReference(object);
            this.scene.needsRender = true;
        }
    }
    removeBase.call(this, ...arguments);
    return this;
};
