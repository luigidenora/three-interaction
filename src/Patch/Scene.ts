import { Object3D, Scene } from "three";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";
import { EventsCache } from "../Events/MiscEventsManager";
import { activeSmartRendering, applySmartRenderingPatch, removeSmartRenderingPatch } from "./SmartRendering";
import { Binding } from "../Binding/Binding";
import { FocusEventExt, IntersectionExt } from "../Events/Events";
import { addBase } from "./Object3D";
import { EventsDispatcher } from "../Events/EventsDispatcher";

/** @internal */
export interface SceneExtPrototypeInternal extends SceneExtPrototype {
    __boundObjects: DistinctTargetArray;
    __smartRendering: boolean;
}

export interface SceneExtPrototype {
    continousRaycasting: boolean;  //for intersection event
    continousRaycastingDropTarget: boolean; //for trigger drag without moving
    intersections: IntersectionExt[];
    intersectionsDropTarget: IntersectionExt[];
    focusedObject: Object3D;
    blurOnClickOut: boolean;
    timeScale: number;
    totalTime: number;
    activeSmartRendering(): this;
    focus(target?: Object3D): void;
}

Scene.prototype.continousRaycasting = true;
Scene.prototype.continousRaycastingDropTarget = true;
Scene.prototype.intersections = [];
Scene.prototype.intersectionsDropTarget = [];
Scene.prototype.focusable = false;
Scene.prototype.needsRender = true;
Scene.prototype.blurOnClickOut = false;
Scene.prototype.timeScale = 1;
Scene.prototype.totalTime = 0;
Scene.prototype.__smartRendering = false;
Scene.prototype.__boundObjects = new DistinctTargetArray();

Scene.prototype.activeSmartRendering = function () {
    activeSmartRendering(this);
    return this;
};

Scene.prototype.focus = function (target?: Object3D): void {
    const focusableObj = target?.firstFocusable;
    if (this.focusedObject !== focusableObj) {
        const event = new FocusEventExt(focusableObj);
        const oldFocusedObj = this.focusedObject;

        if (oldFocusedObj) {
            oldFocusedObj.focused = false;
            oldFocusedObj.triggerAncestor("blur", event);
            oldFocusedObj.trigger("focusout", event);
        }

        if (focusableObj) {
            focusableObj.focused = true
            event.relatedTarget = oldFocusedObj;
            focusableObj.triggerAncestor("focus", event);
            focusableObj.trigger("focusin", event);
        }

        this.focusedObject = focusableObj;
        this.needsRender = true;
    }
}

Scene.prototype.add = function (object: Object3D) {
    addBase.call(this, ...arguments);
    if (arguments.length === 1 && object?.isObject3D && object !== this) {
        setSceneReference(object, this);
        this.needsRender = true;
    }
    return this;
}

Object.defineProperty(Scene.prototype, "userData", { // needed to inject code in constructor
    set: function (value) {
        this.__eventsDispatcher = new EventsDispatcher(this);
        this.scene = this;
        Object.defineProperty(this, "userData", {
            value, writable: true, configurable: true
        });
    },
    configurable: true
})

/** @internal */
export function setSceneReference(target: Object3D, scene: Scene) {
    target.scene = scene;
    EventsCache.update(target);
    applySmartRenderingPatch(target);
    Binding.bindToScene(target);

    for (const object of target.children) {
        setSceneReference(object, scene);
    }
}

/** @internal */
export function removeSceneReference(target: Object3D) {
    EventsCache.removeAll(target);
    removeSmartRenderingPatch(target);
    Binding.unbindFromScene(target);
    target.scene = undefined;

    for (const object of target.children) {
        removeSceneReference(object);
    }
}
