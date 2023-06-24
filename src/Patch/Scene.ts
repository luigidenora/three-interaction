import { Object3D, Scene } from "three";
import { DistinctTargetArray } from "../Utils/DistinctTargetArray";

export interface SceneExtPrototype {
    /** @internal */ __needsRender: boolean;
    /** @internal */ __smartRendering: boolean;
}

Scene.prototype.activable = false;
Scene.prototype.__needsRender = true;
Scene.prototype.__smartRendering = false;
