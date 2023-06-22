import { Object3D } from "three";
import { Utils } from "../Utils/Utils";

/** @internal */
export function applyEulerPatch(parent: Object3D): void {
    const base = parent.rotation._onChangeCallback;
    parent.rotation._onChange(() => {
        base();
        const scene = Utils.getSceneFromObj(parent); //TODO fare solo se serve
        if (scene !== undefined) {
            scene.needsRender();
        }
        parent.__eventsDispatcher.dispatchEvent("rotationchange");
    });
}
