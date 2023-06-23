import { Object3D as Object3DBase } from "three/index";
import { Events } from "../src/Events/Events";
import { Object3DExtPrototype } from "../src/Patch/Object3D";
import { EventsDispatcher } from "../src/index";
import { Cursor } from "../src/Events/CursorManager";
import { BindingCallback } from "../src/Binding/Binding";

export class Object3D extends Object3DBase implements Object3DExtPrototype {
    needsRender(): void;
    __boundCallbacks: BindingCallback[];
    __manualDetection: boolean;
    setManualDetectionMode(): void;
    detectChanges(): void;
    bindProperty<T extends keyof this>(property: T, getCallback: () => this[T], bindAfterParentAdded?: boolean): this;
    unbindProperty<T extends keyof this>(property: T): this;
    override parent: Object3D;
    override children: Object3D[];
    __eventsDispatcher: EventsDispatcher;
    __vec3Patched: boolean;
    __rotationPatched: boolean;
    draggable: boolean;
    dragging: boolean;
    clicked: boolean;
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
    cursorOnHover: Cursor;
    cursorOnDrag: Cursor;
    // frustumNeedsUpdate: boolean; //todo REMOVE
    // isInFrustum: boolean; //todo REMOVE
    bindEvent<K extends keyof Events>(type: K | K[], listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void;
    triggerEventAncestor<K extends keyof Events>(type: K, args: Events[K]): void;
}
