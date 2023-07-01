import { Object3D } from "three";
import { Line2 as Line2Base } from "../node_modules/@types/three/examples/jsm/lines/Line2";
import { Cursor } from "../src/Events/CursorManager";
import { Events } from "../src/Events/Events";
import { BindingCallback, EventsDispatcher } from "../src/index";
import { Object3DExtPrototype } from "../src/Patch/Object3D";

export class Line2 extends Line2Base  implements Object3DExtPrototype {
    __boundCallbacks: BindingCallback[];
    __manualDetection: boolean;
    needsRender(): void;
    setManualDetectionMode(): void;
    detectChanges(recursive?: boolean): void;
    bindProperty<T extends keyof this>(property: T, getCallback: () => this[T], renderOnChange?: boolean): this;
    unbindProperty<T extends keyof this>(property: T): this;
    __eventsDispatcher: EventsDispatcher;
    override parent: Object3D;
    override children: Object3D[];
    draggable: boolean;
    dragging: boolean;
    clicking: boolean;
    activable: boolean;
    get firstActivable(): Object3D;
    active: boolean;
    hovered: boolean;
    enabled: boolean;
    enabledUntilParent: boolean;
    interceptByRaycaster: boolean;
    objectsToRaycast: Object3D[];
    cursor: Cursor;
    cursorOnDrag: Cursor;
    on<K extends keyof Events>(type: K | K[], listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    off<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    trigger<K extends keyof Events>(type: K, args: Events[K]): void;
    triggerAncestor<K extends keyof Events>(type: K, args: Events[K]): void;
}
