import { Object3D } from "three";
import { Scene as SceneBase } from "three/index";
import { BindingCallback, Cursor, DistinctTargetArray, Events, EventsDispatcher, IntersectionExt, Object3DExtPrototype, SceneExtPrototype } from "../index";

export class Scene extends SceneBase implements Object3DExtPrototype, SceneExtPrototype {
    findDropTarget: boolean;
    timeScale: number;
    totalTime: number;
    blurOnClickOut: boolean;
    focus(target?: Object3D): void;
    continousRaycasting: boolean;
    continousRaycastingDropTarget: boolean;
    intersections: IntersectionExt[];
    intersectionsDropTarget: IntersectionExt[];
    focusedObject: Object3D;
    activeSmartRendering(): this;
    enabled: boolean;
    enabledUntilParent: boolean;
    interceptByRaycaster: boolean;
    objectsToRaycast: Object3D[];
    focusable: boolean;
    draggable: boolean;
    hovered: boolean;
    focused: boolean;
    clicking: boolean;
    dragging: boolean;
    cursor: Cursor;
    cursorOnDrag: Cursor;
    scene: Scene;
    needsRender: boolean;
    get firstFocusable(): Object3D;
    applyFocus(): void;
    applyBlur(): void;
    on<K extends keyof Events>(type: K | K[], listener: (args: Events[K]) => void): (args: Events[K]) => void;
    hasEvent<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): boolean;
    off<K extends keyof Events>(type: K, listener: (args: Events[K]) => void): void;
    trigger<K extends keyof Events>(type: K, args: Events[K]): void;
    triggerAncestor<K extends keyof Events>(type: K, args: Events[K]): void;
    setManualDetectionMode(): void;
    detectChanges(recursive?: boolean): void;
    bindProperty<T extends keyof this>(property: T, getCallback: () => this[T], renderOnChange?: boolean): this;
    unbindProperty<T extends keyof this>(property: T): this;
    override parent: Object3D;
    override children: Object3D[];
    /** @internal */ __boundCallbacks: BindingCallback[];
    /** @internal */ __manualDetection: boolean;
    /** @internal */ __eventsDispatcher: EventsDispatcher;
    /** @internal */ __vec3Patched: boolean;
    /** @internal */ __rotationPatched: boolean;
    /** @internal */ __smartRenderingPatched: boolean;
    /** @internal */ __enabled: boolean;
    /** @internal */ __visible: boolean;
    /** @internal */ __boundObjects: DistinctTargetArray;
    /** @internal */ __smartRendering: boolean;
}
