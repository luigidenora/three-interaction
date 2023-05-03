import { Intersection, Object3D, Vector3, WebGLRenderer } from "three";
export interface Events extends DOMEvents {
    positionchange: never;
    scalechange: never;
    rotationchange: never;
    quaternionchange: never;
    rendererresize: RendererResizeEvent;
    framerendering: never;
    animate: {
        delta: DOMHighResTimeStamp;
        total: DOMHighResTimeStamp;
    };
}
export interface DOMEvents {
    pointerover: PointerEventExt;
    pointerenter: PointerEventExt;
    pointerout: PointerEventExt;
    pointerleave: PointerEventExt;
    pointermove: PointerEventExt;
    pointerdown: PointerEventExt;
    pointerup: PointerEventExt;
    pointercancel: PointerEventExt;
    pointerintersection: PointerIntersectionEvent;
    click: PointerEventExt;
    dblclick: PointerEventExt;
    wheel: WheelEventExt;
    focusin: FocusEventExt;
    focusout: FocusEventExt;
    focus: FocusEventExt;
    blur: FocusEventExt;
    keydown: KeyboardEventExt;
    keyup: KeyboardEventExt;
    dragvalidation: DragEventExt;
    drag: DragEventExt;
    afterdrag: DragEventExt;
    dragstart: DragEventExt;
    dragenter: DragEventExt;
    dragover: DragEventExt;
    dragleave: DragEventExt;
    dragend: DragEventExt;
    drop: DragEventExt;
}
export interface IntersectionExt extends Intersection {
    object: Object3D;
    /** The hitbox hit by the raycaster. */
    hitbox: Object3D;
}
export declare class EventExt {
    /** A boolean value indicating whether or not the event bubbles up through the DOM. */
    get bubbles(): boolean;
    /** A boolean value indicating whether the event is cancelable. */
    readonly cancelable: boolean;
    /** A reference to the currently registered target for the event. This is the object to which the event is currently slated to be sent. It's possible this has been changed along the way through retargeting. */
    currentTarget: Object3D;
    /** Indicates whether or not the call to event.preventDefault() canceled the event. */
    get defaultPrevented(): boolean;
    /** A reference to the object to which the event was originally dispatched. */
    get target(): Object3D;
    /** The time at which the event was created (in milliseconds). By specification, this value is time since epoch—but in reality, browsers' definitions vary. In addition, work is underway to change this to be a DOMHighResTimeStamp instead. */
    readonly timeStamp: number;
    /** The case-insensitive name identifying the type of the event. */
    get type(): keyof Events;
    constructor(cancelable?: boolean);
    /** Cancels the event. */
    preventDefault(): void;
    /** For this particular event, prevent all other listeners from being called. This includes listeners attached to the same element as well as those attached to elements that will be traversed later (during the capture phase, for instance). */
    stopImmediatePropagation(): void;
    /** Stops the propagation of events further along in the Object3D hierarchy. */
    stopPropagation(): void;
}
export declare class MouseEventExt extends EventExt {
    /** Returns true if the alt key was down when the mouse event was fired. */
    get altKey(): boolean;
    /** The button number that was pressed (if applicable) when the mouse event was fired. */
    get button(): number;
    /** The buttons being pressed (if any) when the mouse event was fired. */
    get buttons(): number;
    /** The X coordinate of the mouse pointer in local (DOM content) coordinates. */
    get clientX(): number;
    /** The Y coordinate of the mouse pointer in local (DOM content) coordinates. */
    get clientY(): number;
    /** Returns true if the control key was down when the mouse event was fired. */
    get ctrlKey(): boolean;
    /** Returns true if the meta key was down when the mouse event was fired. */
    get metaKey(): boolean;
    /** The X coordinate of the pointer relative to the position of the last event. */
    get movementX(): number;
    /** The Y coordinate of the pointer relative to the position of the last event. */
    get movementY(): number;
    /** The X coordinate of the mouse pointer relative to the position of the padding edge of the target node. */
    get offsetX(): number;
    /** The Y coordinate of the mouse pointer relative to the position of the padding edge of the target node. */
    get offsetY(): number;
    /** The X coordinate of the mouse pointer relative to the whole document. */
    get pageX(): number;
    /** The Y coordinate of the mouse pointer relative to the whole document. */
    get pageY(): number;
    /** The secondary target for the event, if there is one. */
    readonly relatedTarget: Object3D;
    /** The X coordinate of the mouse pointer in global (screen) coordinates. */
    get screenX(): number;
    /** The Y coordinate of the mouse pointer in global (screen) coordinates. */
    get screenY(): number;
    /** Returns true if the shift key was down when the mouse event was fired. */
    get shiftKey(): boolean;
    /** Original dom event */
    _event: MouseEvent;
    /** TODO. */
    readonly intersection: IntersectionExt;
    /** TODO. */
    readonly movement: Vector3;
    constructor(event: MouseEvent, intersection: IntersectionExt, lastIntersection: IntersectionExt, relatedTarget?: Object3D, cancelable?: boolean);
    /** Returns the current state of the specified modifier key. See KeyboardEvent.getModifierState() for details. */
    getModifierState(keyArg: string): boolean;
}
export declare class PointerEventExt extends MouseEventExt {
    /** A unique identifier for the pointer causing the event. */
    get pointerId(): number;
    /** The width (magnitude on the X axis), in CSS pixels, of the contact geometry of the pointer. */
    get width(): number;
    /** The height (magnitude on the Y axis), in CSS pixels, of the contact geometry of the pointer. */
    get height(): number;
    /** The normalized pressure of the pointer input in the range 0 to 1, where 0 and 1 represent the minimum and maximum pressure the hardware is capable of detecting, respectively. */
    get pressure(): number;
    /** The normalized tangential pressure of the pointer input (also known as barrel pressure or cylinder stress) in the range -1 to 1, where 0 is the neutral position of the control. */
    get tangentialPressure(): number;
    /** The plane angle (in degrees, in the range of -90 to 90) between the Y–Z plane and the plane containing both the pointer (e.g. pen stylus) axis and the Y axis. */
    get tiltX(): number;
    /** The plane angle (in degrees, in the range of -90 to 90) between the X–Z plane and the plane containing both the pointer (e.g. pen stylus) axis and the X axis. */
    get tiltY(): number;
    /** The clockwise rotation of the pointer (e.g. pen stylus) around its major axis in degrees, with a value in the range 0 to 359. */
    get twist(): number;
    /** Indicates the device type that caused the event (mouse, pen, touch, etc.). */
    get pointerType(): string;
    /** Indicates if the pointer represents the primary pointer of this pointer type. */
    get isPrimary(): boolean;
    _event: PointerEvent;
    constructor(event: PointerEvent, intersection: IntersectionExt, lastIntersection: IntersectionExt, relatedTarget?: Object3D, cancelable?: boolean);
    /** Returns a sequence of all PointerEvent instances that were coalesced into the dispatched pointermove event. */
    getCoalescedEvents(): PointerEventExt;
    /** Returns a sequence of PointerEvent instances that the browser predicts will follow the dispatched pointermove event's coalesced events. */
    getPredictedEvents(): PointerEventExt;
}
export declare class PointerIntersectionEvent extends EventExt {
    /** TODO. */
    readonly intersection: IntersectionExt;
    /** TODO. */
    readonly movement: Vector3;
    constructor(intersection: IntersectionExt, lastIntersection: IntersectionExt);
}
export declare class WheelEventExt extends MouseEventExt {
    readonly deltaMode: number;
    /** Returns a double representing the horizontal scroll amount. */
    readonly deltaX: number;
    /** Returns a double representing the vertical scroll amount. */
    readonly deltaY: number;
    /** Returns a double representing the scroll amount for the z-axis. */
    readonly deltaZ: number;
    _event: WheelEvent;
    constructor(event: WheelEvent, intersection: IntersectionExt);
}
export interface DragEventExt extends PointerEventExt {
    /** The coordinates of the pointer in local (scene) coordinates. */
    positionToApply: Vector3;
    /** The coordinates of the pointer in local (scene) coordinates. */
    originalPosition: Vector3;
}
export interface KeyboardEventExt extends EventExt {
    /** Returns a boolean value that is true if the Alt (Option or ⌥ on macOS) key was active when the key event was generated. */
    altKey: boolean;
    /** Returns a string with the code value of the physical key represented by the event. */
    code: string;
    /** Returns a boolean value that is true if the Ctrl key was active when the key event was generated. */
    ctrlKey: boolean;
    /** Returns a string representing the key value of the key represented by the event. */
    key: string;
    /** Returns a number representing the location of the key on the keyboard or other input device. Visit https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/location for more info. */
    location: number;
    /** Returns a boolean value that is true if the Meta key (on Mac keyboards, the ⌘ Command key; on Windows keyboards, the Windows key (⊞)) was active when the key event was generated. */
    metaKey: boolean;
    /** Returns a boolean value that is true if the key is being held down such that it is automatically repeating. */
    repeat: boolean;
    /** Returns a boolean value that is true if the Shift key was active when the key event was generated. */
    shiftKey: boolean;
    /** Returns a boolean value indicating if a modifier key such as Alt, Shift, Ctrl, or Meta, was pressed when the event was created. */
    getModifierState(keyArg: string): boolean;
}
export declare class RendererResizeEvent extends EventExt {
    /** Returns the new renderer width. TODO */
    readonly width: number;
    /** Returns the new renderer height. TODO */
    readonly height: number;
    /** Returns resized renderer. TODO */
    readonly renderer: WebGLRenderer;
    constructor(renderer: WebGLRenderer, width: number, height: number);
}
export declare class FocusEventExt extends EventExt {
    /** The secondary target for the event. */
    relatedTarget: Object3D;
    constructor(relatedTarget: Object3D);
}
