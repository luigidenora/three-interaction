import { Object3D, Scene } from "three";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";
import { EventsCache } from "../Events/MiscEventsManager";
import { applySmartRenderingPatch, removeSmartRenderingPatch } from "./SmartRendering";
import { Binding } from "../Binding/Binding";
import { FocusEventExt, IntersectionExt } from "../Events/Events";

export interface SceneExtPrototype {
    continousRaycasting: boolean;  //for intersection event
    continousRaycastingDropTarget: boolean; //for trigger drag without moving
    intersections: IntersectionExt[];
    intersectionsDropTarget: IntersectionExt[];
    focusedObject: Object3D;
    blurOnClickOut: boolean;
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
Scene.prototype.__smartRendering = false;
Scene.prototype.__boundObjects = new DistinctTargetArray();

Scene.prototype.activeSmartRendering = function () {
    this.__smartRendering = true;
    //TODO aggiungere patch ecc nel caso non venga chiamata subito questa func
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
    EventsCache.remove(target, target.scene);
    removeSmartRenderingPatch(target);
    Binding.unbindFromScene(target);
    target.scene = undefined;

    for (const object of target.children) {
        removeSceneReference(object);
    }
}
