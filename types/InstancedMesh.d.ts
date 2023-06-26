import { Object3D } from "three";
import { InstancedMesh as InstancedMeshBase } from "three/index";
import { Cursor } from "../src/Events/CursorManager";
import { Events } from "../src/Events/Events";
import { BindingCallback, EventsDispatcher } from "../src/index";
import { Object3DExtPrototype } from "../src/Patch/Object3D";

export class InstancedMesh extends InstancedMeshBase implements Object3DExtPrototype {
    __boundCallbacks: BindingCallback[];
    __manualDetection: boolean;
    setManualDetectionMode(): void;
    detectChanges(): void;
    bindProperty<T extends keyof this>(property: T, getCallback: () => this[T], renderOnChange?: boolean): this;
    unbindProperty<T extends keyof this>(property: T): this;
    needsRender(): void;
    __eventsDispatcher: EventsDispatcher;
    override parent: Object3D;
    override children: Object3D[];
    draggable: boolean;
    dragging: boolean;
    clicked: boolean;
    activable: boolean;
    get activableObj(): Object3D;
    active: boolean;
    hovered: boolean;
    enabled: boolean;
    enabledUntilParent: boolean;
    interceptByRaycaster: boolean;
    objectsToRaycast: Object3D[];
    cursorOnHover: Cursor;
    cursorOnDrag: Cursor;
    bindEvent<K extends keyof Events>(type: K | K[], listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void;
    triggerEventAncestor<K extends keyof Events>(type: K, args: Events[K]): void;
}
