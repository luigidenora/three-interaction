import { Object3D as Object3DBase } from "three/index";
import { Events } from "../src/Events";
import { InteractionPrototype } from "../src/Patch";

export class Object3D extends Object3DBase implements InteractionPrototype {
    override parent: Object3D;
    override children: Object3D[];
    interceptByRaycaster: boolean;
    objectsToRaycast: Object3D[];
    bindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void;
}
