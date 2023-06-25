import { Object3D as Object3DBase } from "three/index";
import { Events } from "../src/Events/Events";
import { Object3DExtInternalPrototype, Object3DExtPrototype } from "../src/Patch/Object3D";
import { Cursor } from "../src/Events/CursorManager";
import { BindingCallback } from "../src/Binding/Binding";
import { Scene } from "three";
import { EventsDispatcher } from "../src/Events/EventsDispatcher";

export class Object3D extends Object3DBase implements Object3DExtPrototype, Object3DExtInternalPrototype {
    __scene: Scene;
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
    /** @internal */ __enabled: boolean;
    /** @internal */ __visible: boolean;
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
    // frustumNeedsUpdate: boolean; //todo REMOVE
    // isInFrustum: boolean; //todo REMOVE
    bindEvent<K extends keyof Events>(type: K | K[], listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasBoundEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    unbindEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    triggerEvent<K extends keyof Events>(type: K, args: Events[K]): void;
    triggerEventAncestor<K extends keyof Events>(type: K, args: Events[K]): void;
}
