import { Object3D, Scene } from "three";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";

export interface SceneExtPrototype {
    /** @internal */ __dropTargets: DistinctTargetArray;
}

Scene.prototype.activable = false;
Scene.prototype.__dropTargets = new DistinctTargetArray();

export function addDropTargetToScene(dropTarget: Object3D): void {

}
