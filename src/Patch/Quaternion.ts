import { Object3D } from "three";
import { Utils } from "../Utils/Utils";

/** @internal */
export function applyQuaternionPatch(parent: Object3D): void {
    const base = parent.quaternion._onChangeCallback;
    parent.quaternion._onChange(() => {
        base();
        const scene = Utils.getSceneFromObj(parent); //TODO fare solo se serve
        if (scene !== undefined) {
            scene.needsRender();
        }
        parent.__eventsDispatcher.dispatchEvent("rotationchange");
    });
}
