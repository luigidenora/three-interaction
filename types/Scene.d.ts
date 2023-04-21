import { Scene as SceneBase } from "three/index";
import { Object3D } from "three";
import { InteractionPrototype } from "../src/Patch";
import { Events } from "../src/Events";

export class Scene extends SceneBase implements InteractionPrototype {
    override parent: Object3D;
    override children: Object3D[];
    interceptByRaycaster: boolean;
    objectsToRaycast: Object3D[];
    bindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void;
}
