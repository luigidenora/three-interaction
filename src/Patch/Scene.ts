import { Object3D, Scene } from "three";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";
import { EventsCache } from "../Events/MiscEventsManager";
import { applySmartRenderingPatch, removeSmartRenderingPatch } from "./SmartRendering";
import { object3DList } from "./Object3D";
import { Binding } from "../Binding/Binding";

export interface SceneExtPrototype {
    activeSmartRendering(): this;
}

Scene.prototype.activable = false;
Scene.prototype.__needsRender = true;
Scene.prototype.__smartRendering = false;
Scene.prototype.__boundObjects = new DistinctTargetArray();

Scene.prototype.activeSmartRendering = function (this: Scene) {
    this.__smartRendering = true;
    //TODO aggiungere patch ecc nel caso non venga chiamata subito questa func
    return this;
};

/** @internal */
export function setSceneReference(target: Object3D, scene: Scene) {
    target.__scene = scene;
    EventsCache.update(target);
    object3DList[target.id] = target;
    applySmartRenderingPatch(target);
    Binding.bindToScene(target);

    for (const object of target.children) {
        setSceneReference(object, scene);
    }
}

/** @internal */
export function removeSceneReference(target: Object3D) {
    EventsCache.remove(target, target.__scene);
    object3DList[target.id] = undefined;
    removeSmartRenderingPatch(target);
    Binding.unbindFromScene(target);
    target.__scene = undefined;

    for (const object of target.children) {
        removeSceneReference(object);
    }
}
