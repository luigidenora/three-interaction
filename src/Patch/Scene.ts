import { Object3D, Scene } from "three";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";
import { Utils } from "../Utils/Utils";

export interface SceneExtPrototype {
    /** @internal */ __dropTargets: DistinctTargetArray;
}

Scene.prototype.activable = false;
Scene.prototype.__dropTargets = new DistinctTargetArray();

export function addDropTargetToScene(dropTarget: Object3D): void {
    if ((dropTarget as Scene).isScene) return;

    const scene = Utils.getSceneFromObj(dropTarget);
    if (!dropTarget.parent) { //sta roba non va TODO FIX
        // const event = () => {
        //     Utils.getSceneFromObj(dropTarget).__dropTargets.push(dropTarget);
        //     dropTarget.removeEventListener("added", event);
        // };
        // dropTarget.addEventListener("added", event);
    } else {
        scene.__dropTargets.push(dropTarget);
    }
}