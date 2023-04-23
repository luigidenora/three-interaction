import { Intersection, Object3D, Vector3 } from "three";

export class EventExt {
  /** A boolean value indicating whether or not the event bubbles up through the DOM. */
  public get bubbles() { return this._bubbles }
  /** A boolean value indicating whether the event is cancelable. */
  public readonly cancelable: boolean;
  /** A reference to the currently registered target for the event. This is the object to which the event is currently slated to be sent. It's possible this has been changed along the way through retargeting. */
  public readonly currentTarget: Object3D;
  /** Indicates whether or not the call to event.preventDefault() canceled the event. */
  public get defaultPrevented() { return this._defaultPrevented }
  /** Indicates which phase of the event flow is being processed. It is one of the following numbers: NONE, CAPTURING_PHASE, AT_TARGET, BUBBLING_PHASE. */
  public eventPhase: number;
  /** A reference to the object to which the event was originally dispatched. */
  public target: Object3D;
  /** The time at which the event was created (in milliseconds). By specification, this value is time since epoch—but in reality, browsers' definitions vary. In addition, work is underway to change this to be a DOMHighResTimeStamp instead. */
  public get timeStamp() { return this._originalEvent.timeStamp }
  /** The case-insensitive name identifying the type of the event. */
  public readonly type: keyof Events;

  protected _defaultPrevented = false;
  protected _stoppedImmediatePropagation = false;
  protected _originalEvent: Event;

  constructor(event: Event, type: keyof Events, target: Object3D, cancelable = false, protected _bubbles = true) {
    if (!target) console.error("target"); //TODO remove
    this._originalEvent = event;
    this.cancelable = cancelable;
    this.target = this.currentTarget = target;
    this.eventPhase = 0;
    this.type = type;
  }

  /** Cancels the event. */
  public preventDefault(): void {
    this._defaultPrevented = true;
  }

  /** For this particular event, prevent all other listeners from being called. This includes listeners attached to the same element as well as those attached to elements that will be traversed later (during the capture phase, for instance). */
  public stopImmediatePropagation(): void {
    this._stoppedImmediatePropagation = true;
  }

  /** Stops the propagation of events further along in the Object3D hierarchy. */
  public stopPropagation(): void {
    this._bubbles = false;
  }
}

export class MouseEventExt extends EventExt {
  /** Returns true if the alt key was down when the mouse event was fired. */
  public get altKey() { return this._originalEvent.altKey }
  /** The button number that was pressed (if applicable) when the mouse event was fired. */
  public get button() { return this._originalEvent.button }
  /** The buttons being pressed (if any) when the mouse event was fired. */
  public get buttons() { return this._originalEvent.buttons }
  /** The X coordinate of the mouse pointer in local (DOM content) coordinates. */
  public get clientX() { return this._trunc ? Math.trunc(this._originalEvent.clientX) : this._originalEvent.clientX }
  /** The Y coordinate of the mouse pointer in local (DOM content) coordinates. */
  public get clientY() { return this._trunc ? Math.trunc(this._originalEvent.clientY) : this._originalEvent.clientY }
  /** Returns true if the control key was down when the mouse event was fired. */
  public get ctrlKey() { return this._originalEvent.ctrlKey }
  /** Returns true if the meta key was down when the mouse event was fired. */
  public get metaKey() { return this._originalEvent.metaKey }
  /** The X coordinate of the pointer relative to the position of the last event. */
  public get movementX() { return this._originalEvent.movementX }
  /** The Y coordinate of the pointer relative to the position of the last event. */
  public get movementY() { return this._originalEvent.movementY }
  /** The X coordinate of the mouse pointer relative to the position of the padding edge of the target node. */
  public get offsetX() { return this._trunc ? Math.trunc(this._originalEvent.offsetX) : this._originalEvent.offsetX }
  /** The Y coordinate of the mouse pointer relative to the position of the padding edge of the target node. */
  public get offsetY() { return this._trunc ? Math.trunc(this._originalEvent.offsetY) : this._originalEvent.offsetY }
  /** The X coordinate of the mouse pointer relative to the whole document. */
  public get pageX() { return this._trunc ? Math.trunc(this._originalEvent.pageX) : this._originalEvent.pageX }
  /** The Y coordinate of the mouse pointer relative to the whole document. */
  public get pageY() { return this._trunc ? Math.trunc(this._originalEvent.pageY) : this._originalEvent.pageY }
  /** The secondary target for the event, if there is one. */
  public readonly relatedTarget: Object3D;
  /** The X coordinate of the mouse pointer in global (screen) coordinates. */
  public get screenX() { return this._originalEvent.screenX }
  /** The Y coordinate of the mouse pointer in global (screen) coordinates. */
  public get screenY() { return this._originalEvent.screenY }
  /** Returns true if the shift key was down when the mouse event was fired. */
  public get shiftKey() { return this._originalEvent.shiftKey }
  /** TODO. */
  public readonly intersection: IntersectionExt;
  /** TODO. */
  public readonly movement: Vector3;

  protected override _originalEvent: PointerEvent;
  protected _trunc = true;

  constructor(event: PointerEvent, type: keyof Events, target: Object3D, intersection: IntersectionExt, lastIntersection: IntersectionExt,
    relatedTarget?: Object3D, cancelable?: boolean, bubbles?: boolean) {
    super(event, type, target, cancelable, bubbles);
    this.intersection = intersection;
    this.relatedTarget = relatedTarget;
    if (intersection?.object === lastIntersection?.object) {
      this.movement = intersection.point.clone().sub(lastIntersection.point);
    }
  }

  /** Returns the current state of the specified modifier key. See KeyboardEvent.getModifierState() for details. */
  public getModifierState(keyArg: string): boolean {
    return this._originalEvent.getModifierState(keyArg);
  }
}

export class PointerEventExt extends MouseEventExt {
  /** A unique identifier for the pointer causing the event. */
  public get pointerId() { return this._originalEvent.pointerId }
  /** The width (magnitude on the X axis), in CSS pixels, of the contact geometry of the pointer. */
  public get width() { return this._originalEvent.width }
  /** The height (magnitude on the Y axis), in CSS pixels, of the contact geometry of the pointer. */
  public get height() { return this._originalEvent.height }
  /** The normalized pressure of the pointer input in the range 0 to 1, where 0 and 1 represent the minimum and maximum pressure the hardware is capable of detecting, respectively. */
  public get pressure() { return this._originalEvent.pressure }
  /** The normalized tangential pressure of the pointer input (also known as barrel pressure or cylinder stress) in the range -1 to 1, where 0 is the neutral position of the control. */
  public get tangentialPressure() { return this._originalEvent.tangentialPressure }
  /** The plane angle (in degrees, in the range of -90 to 90) between the Y–Z plane and the plane containing both the pointer (e.g. pen stylus) axis and the Y axis. */
  public get tiltX() { return this._originalEvent.tiltX }
  /** The plane angle (in degrees, in the range of -90 to 90) between the X–Z plane and the plane containing both the pointer (e.g. pen stylus) axis and the X axis. */
  public get tiltY() { return this._originalEvent.tiltY }
  /** The clockwise rotation of the pointer (e.g. pen stylus) around its major axis in degrees, with a value in the range 0 to 359. */
  public get twist() { return this._originalEvent.twist }
  /** Indicates the device type that caused the event (mouse, pen, touch, etc.). */
  public get pointerType() { return this._originalEvent.pointerType }
  /** Indicates if the pointer represents the primary pointer of this pointer type. */
  public get isPrimary() { return this._originalEvent.isPrimary }

  constructor(event: PointerEvent, type: keyof Events, target: Object3D, intersection: IntersectionExt, lastIntersection: IntersectionExt,
    relatedTarget?: Object3D, cancelable?: boolean, bubbles?: boolean) {
    super(event, type, target, intersection, lastIntersection, relatedTarget, cancelable, bubbles);
    this._trunc = false;
  }

  /** Returns a sequence of all PointerEvent instances that were coalesced into the dispatched pointermove event. */
  public getCoalescedEvents(): PointerEventExt {
    return undefined;
  }

  /** Returns a sequence of PointerEvent instances that the browser predicts will follow the dispatched pointermove event's coalesced events. */
  public getPredictedEvents(): PointerEventExt {
    return undefined;
  }
}

export class PointerIntersectionEvent extends EventExt {
  /** TODO. */
  public readonly intersection: IntersectionExt;
  /** TODO. */
  public readonly movement: Vector3;

  constructor(target: Object3D, intersection: IntersectionExt, lastIntersection: IntersectionExt) {
    super(undefined, "pointerIntersection", target);
    this.intersection = intersection;
    if (intersection.object === lastIntersection?.object) {
      this.movement = intersection.point.clone().sub(lastIntersection.point);
    }
  }
}

export interface TouchEventExt extends EventExt {
  /** A Boolean value indicating whether or not the alt key was down when the touch event was fired. */
  altKey: boolean;
  /** A TouchList of all the Touch objects representing individual points of contact whose states changed between the previous touch event and this one. */
  changedTouches: TouchList;
  /** A Boolean value indicating whether or not the control key was down when the touch event was fired. */
  ctrlKey: boolean;
  /** A Boolean value indicating whether or not the meta key was down when the touch event was fired. */
  metaKey: boolean;
  /** A Boolean value indicating whether or not the shift key was down when the touch event was fired. */
  shiftKey: boolean;
  /** A TouchList of all the Touch objects that are both currently in contact with the touch surface and were also started on the same element that is the target of the event. */
  targetTouches: TouchExt[];
  /** A TouchList of all the Touch objects representing all current points of contact with the surface, regardless of target or changed status. */
  touches: TouchExt[];
}

export interface TouchExt {
  /** Returns the amount of pressure being applied to the surface by the user, as a float between 0.0 (no pressure) and 1.0 (maximum pressure). */
  force: number;
  /** Returns a unique identifier for this Touch object. A given touch point (say, by a finger) will have the same identifier for the duration of its movement around the surface. This lets you ensure that you're tracking the same touch all the time. */
  identifier: number;
  /** Returns the angle (in degrees) that the ellipse described by radiusX and radiusY must be rotated, clockwise, to most accurately cover the area of contact between the user and the surface. */
  rotationAngle: number;
  /** Returns the element on which the touch point started when it was first placed on the surface, even if the touch point has since moved outside the interactive area of that element or even been removed. */
  target: Object3D;
  /** The coordinates of the touch in local (scene) coordinates. */
  intersection: IntersectionExt;
}

export interface WheelEventExt extends MouseEventExt {
  /*  Returns an unsigned long representing the unit of the delta* values' scroll amount. Permitted values are: 0 = pixels, 1 = lines, 2 = pages. */
  deltaMode: number;
  /** Returns a double representing the horizontal scroll amount. */
  deltaX: number;
  /** Returns a double representing the vertical scroll amount. */
  deltaY: number;
  /** Returns a double representing the scroll amount for the z-axis. */
  deltaZ: number;
}

export interface DragEventExt extends MouseEventExt {
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

export class FocusEventExt extends EventExt {
  /** The secondary target for the event. */
  public readonly relatedTarget: Object3D

  constructor(event: PointerEvent, type: keyof Events, target: Object3D, relatedTarget: Object3D) {
    const bubbles = type === "focus" || type === "blur";
    super(event, type, target, false, bubbles);
    this.relatedTarget = relatedTarget;
  }
}

export interface Events extends DOMEvents {
  pointerIntersection: PointerIntersectionEvent;
  // onWindowResize: () => void;
  // onPositionComponentChange: (args: ComponentChangeArgs) => void;
  // onScaleComponentChange: (args: ComponentChangeArgs) => void;
  // onRotationComponentChange: (args: ComponentChangeArgs) => void;
  // onFrameGeneration: (delta: number) => void;
  // onChildAdded: (objects: Object3D[]) => void;
  // onEnabledChange: (value: boolean) => void; / This event propagation Up to down.
  // onVisibleChange: (value: boolean) => void; / This event propagation Up to down.
  // onAppIteration: (delta: number) => void;
}

export interface DOMEvents {
  pointerover: PointerEventExt;
  pointerout: PointerEventExt;
  pointermove: PointerEventExt;
  pointerdown: PointerEventExt;
  pointerup: PointerEventExt;
  pointercancel: PointerEventExt;

  mouseover: MouseEventExt;
  mouseout: MouseEventExt;
  mousemove: MouseEventExt;
  mousedown: MouseEventExt;
  mouseup: MouseEventExt;

  touchstart: TouchEventExt;
  touchmove: TouchEventExt;
  touchend: TouchEventExt;
  touchcancel: TouchEventExt;

  click: PointerEventExt;
  dblclick: PointerEventExt;
  wheel: WheelEventExt;

  focusIn: FocusEventExt
  focusOut: FocusEventExt
  focus: FocusEventExt
  blur: FocusEventExt

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
