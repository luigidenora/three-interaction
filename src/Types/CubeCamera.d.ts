import { Object3D, Scene } from "three";
import { CubeCamera as CubeCameraBase } from "three/index";
import { Cursor, Events, Object3DExtPrototype } from "../index";

export class CubeCamera extends CubeCameraBase implements Object3DExtPrototype {
    enabled: boolean;
    interceptByRaycaster: boolean;
    objectsToRaycast: Object3D[];
    focusable: boolean;
    draggable: boolean;
    findDropTarget: boolean;
    scene: Scene;
    cursor: Cursor;
    cursorDrag: Cursor;
    cursorDrop: Cursor;
    needsRender: boolean;
    get hovered(): boolean;
    get focused(): boolean;
    get clicking(): boolean;
    get dragging(): boolean;
    get enabledUntilParent(): boolean;
    get firstFocusable(): Object3D;
    applyFocus(): void;
    applyBlur(): void;
    on<K extends keyof Events>(type: K | K[], listener: (args?: Events[K]) => void): (args?: Events[K]) => void;
    hasEvent<K extends keyof Events>(type: K, listener: (args?: Events[K]) => void): boolean;
    off<K extends keyof Events>(type: K, listener: (args?: Events[K]) => void): void;
    trigger<K extends keyof Events>(type: K, args?: Events[K]): void;
    triggerAncestor<K extends keyof Events>(type: K, args?: Events[K]): void;
    setManualDetectionMode(): void;
    detectChanges(recursive?: boolean): void;
    bindProperty<T extends keyof this>(property: T, getCallback: () => this[T], renderOnChange?: boolean): this;
    unbindProperty<T extends keyof this>(property: T): this;
    override parent: Object3D;
    override children: Object3D[];
}