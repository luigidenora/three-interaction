import { Intersection, Object3D, Vector3 } from "three";
export interface EventExt {
    target: Object3D;
    timeStamp: DOMHighResTimeStamp;
    type: string;
    stopImmediatePropagation(): void;
    stopPropagation(): void;
    preventDefault(): void;
    _stopImmediatePropagation: boolean;
    _stopPropagation: boolean;
    _preventDefault: boolean;
}
export interface MouseEventExt extends EventExt {
    altKey: boolean;
    button: number;
    buttons: number;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    intersection: IntersectionExt;
    movement: Vector3;
    getModifierState(keyArg: string): boolean;
}
export interface PointerEventExt extends MouseEventExt {
    isPrimary: boolean;
    pointerId: number;
    pointerType: string;
    pressure: number;
    tangentialPressure: number;
    tiltX: number;
    tiltY: number;
    twist: number;
    getCoalescedEvents(): PointerEventExt[];
    getPredictedEvents(): PointerEventExt[];
}
export interface TouchEventExt extends EventExt {
    altKey: boolean;
    changedTouches: TouchList;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    targetTouches: TouchExt[];
    touches: TouchExt[];
}
export interface TouchExt {
    force: number;
    identifier: number;
    rotationAngle: number;
    target: Object3D;
    intersection: IntersectionExt;
}
export interface WheelEventExt extends MouseEventExt {
    deltaMode: number;
    deltaX: number;
    deltaY: number;
    deltaZ: number;
}
export interface DragEventExt extends MouseEventExt {
    positionToApply: Vector3;
    originalPosition: Vector3;
}
export interface KeyboardEventExt extends EventExt {
    altKey: boolean;
    code: string;
    ctrlKey: boolean;
    key: string;
    location: number;
    metaKey: boolean;
    repeat: boolean;
    shiftKey: boolean;
    getModifierState(keyArg: string): boolean;
}
export interface Events extends DOMEvents {
}
interface DOMEvents {
    pointerOver: PointerEventExt;
    pointerOut: PointerEventExt;
    pointerMove: PointerEventExt;
    pointerDown: PointerEventExt;
    pointerUp: PointerEventExt;
    pointerCancel: PointerEventExt;
    mouseOver: MouseEventExt;
    mouseOut: MouseEventExt;
    mouseMove: MouseEventExt;
    mouseDown: MouseEventExt;
    mouseUp: MouseEventExt;
    touchStart: TouchEventExt;
    touchMove: TouchEventExt;
    touchEnd: TouchEventExt;
    touchCancel: TouchEventExt;
    click: MouseEventExt;
    dblClick: MouseEventExt;
    wheel: WheelEventExt;
    tap: TouchEventExt;
    dblTap: TouchEventExt;
    keyDown: KeyboardEventExt;
    keyUp: KeyboardEventExt;
    beforeDrag: DragEventExt;
    drag: DragEventExt;
    afterDrag: DragEventExt;
    dragStart: DragEventExt;
    dragEnter: DragEventExt;
    dragOver: DragEventExt;
    dragLeave: DragEventExt;
    dragEnd: DragEventExt;
    drop: DragEventExt;
}
export interface IntersectionExt extends Intersection {
    object: Object3D;
    hitbox: Object3D;
}
export {};
