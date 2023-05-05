import { Object3D } from "three";
import { InstancedMesh as InstancedMeshBase } from "three/index";
import { Cursors } from "../src/Events/CursorHandler";
import { Events } from "../src/Events/Events";
import { EventsDispatcher } from "../src/index";
import { InteractionPrototype } from "../src/Patch/Object3D";

export class InstancedMesh extends InstancedMeshBase implements InteractionPrototype {
    __eventsDispatcher: EventsDispatcher;
    override parent: Object3D;
    override children: Object3D[];
    activable: boolean;
    get activableObj(): Object3D;
    active: boolean;
    activeUntilParent: boolean;
    hovered: boolean;
    enabled: boolean;
    enabledUntilParent: boolean;
    visibleUntilParent: boolean;
    interceptByRaycaster: boolean;
    objectsToRaycast: Object3D[];
    cursorOnHover: keyof Cursors;
    cursorOnDrag: keyof Cursors;
    bindEvent<K extends keyof Events>(type: K | K[], listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void;
    triggerEventAncestor<K extends keyof Events>(type: K, args: Events[K]): void;
}
