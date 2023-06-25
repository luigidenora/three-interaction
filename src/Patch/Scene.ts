import { Scene } from "three";

export interface SceneExtPrototype {
    activeSmartRendering(): this;
}

Scene.prototype.activable = false;
Scene.prototype.__needsRender = true;
Scene.prototype.__smartRendering = false;

Scene.prototype.activeSmartRendering = function (this: Scene) {
    this.__smartRendering = true;
    return this;
};
