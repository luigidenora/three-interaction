import { Object3D } from "three";
import { Scene as SceneBase } from "three/index";
import { BindingCallback, Cursor, DistinctTargetArray, Events, EventsDispatcher, IntersectionExt, Object3DExtPrototypeInternal, SceneExtPrototypeInternal } from "../src/index";

export class Scene extends SceneBase implements Object3DExtPrototypeInternal, SceneExtPrototypeInternal {
    __boundObjects: DistinctTargetArray;
    __smartRendering: boolean;
    continousRaycasting: boolean;
    continousRaycastingDropTarget: boolean;
    intersections: IntersectionExt[];
    intersectionsDropTarget: IntersectionExt[];
    focusedObject: Object3D;
    blurOnClickOut: boolean;
    timeScale: number;
    totalTime: number;
    activeSmartRendering(): this;
    focus(target?: Object3D): void;
    __boundCallbacks: BindingCallback[];
    __manualDetection: boolean;
    __eventsDispatcher: EventsDispatcher;
    __vec3Patched: boolean;
    __rotationPatched: boolean;
    __smartRenderingPatched: boolean;
    __enabled: boolean;
    __visible: boolean;
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
    hovered: boolean;
    focused: boolean;
    clicking: boolean;
    dragging: boolean;
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
