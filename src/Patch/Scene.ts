import { Object3D, Scene } from "three";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";
import { EventsCache } from "../Events/MiscEventsManager";
import { applySmartRenderingPatch, removeSmartRenderingPatch } from "./SmartRendering";
import { Binding } from "../Binding/Binding";
import { IntersectionExt } from "../Events/Events";

export interface SceneExtPrototype {
    continousRaycasting: boolean;
    continousRaycastingDropTarget: boolean;
    intersections: { [x: string]: IntersectionExt };
    activeSmartRendering(): this;
}

Scene.prototype.continousRaycasting = true;
Scene.prototype.continousRaycastingDropTarget = true;
Scene.prototype.focusable = false;
Scene.prototype.needsRender = true;
Scene.prototype.__smartRendering = false;
Scene.prototype.__boundObjects = new DistinctTargetArray();

Scene.prototype.activeSmartRendering = function (this: Scene) {
    this.__smartRendering = true;
    //TODO aggiungere patch ecc nel caso non venga chiamata subito questa func
    return this;
};

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
