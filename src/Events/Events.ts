import { Intersection, Object3D, Vector3, WebGLRenderer } from "three";

export interface Events extends InteractionEvents, MiscEvents, UpdateEvents { };

export interface UpdateEvents {
  positionchange: never;
  scalechange: never;
  rotationchange: never;
  // scenechange: never;
  // parentchange: never;
  // enablechange // This event propagation Up to down.
  // visiblechange // This event propagation Up to down.
}

export interface MiscEvents {
  rendererresize: RendererResizeEvent;
  beforeanimate: { delta: DOMHighResTimeStamp, total: DOMHighResTimeStamp };
  animate: { delta: DOMHighResTimeStamp, total: DOMHighResTimeStamp };
  afteranimate: { delta: DOMHighResTimeStamp, total: DOMHighResTimeStamp };
}

export interface InteractionEvents {
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
  focusin: FocusEventExt
  focusout: FocusEventExt
  focus: FocusEventExt
  blur: FocusEventExt
  keydown: KeyboardEventExt;
  keyup: KeyboardEventExt;
  drag: DragEventExt;
  dragstart: DragEventExt;
  dragend: DragEventExt;
  dragcancel: DragEventExt;

  dragenter: DragEventExt;
  dragover: DragEventExt;
  dragleave: DragEventExt;
  drop: DragEventExt;

  // mouseover: PointerEventExt;
  // mouseenter: PointerEventExt;
  // mouseout: PointerEventExt;
  // mouseleave: PointerEventExt;
  // mousemove: PointerEventExt;
  // mousedown: PointerEventExt;
  // mouseup: PointerEventExt;
  // touchstart: TouchEventExt;
  // touchmove: TouchEventExt;
  // touchend: TouchEventExt;
  // touchcancel: TouchEventExt;
}

export interface IntersectionExt extends Intersection {
  object: Object3D;
  /** The hitbox hit by the raycaster. */
  hitbox: Object3D;
}

export class EventExt {
  /** A boolean value indicating whether or not the event bubbles up through the DOM. */
  public get bubbles() { return this._bubbles }
  /** A boolean value indicating whether the event is cancelable. */
  public readonly cancelable;
  /** A reference to the currently registered target for the event. This is the object to which the event is currently slated to be sent. It's possible this has been changed along the way through retargeting. */
  public currentTarget: Object3D;
  /** Indicates whether or not the call to event.preventDefault() canceled the event. */
  public get defaultPrevented() { return this._defaultPrevented }
  /** A reference to the object to which the event was originally dispatched. */
  public get target() { return this._target }
  /** The time at which the event was created (in milliseconds). By specification, this value is time since epoch—but in reality, browsers' definitions vary. In addition, work is underway to change this to be a DOMHighResTimeStamp instead. */
  public readonly timeStamp = performance.now();
  /** The case-insensitive name identifying the type of the event. */
  public get type() { return this._type }

    /** @internal */ public _defaultPrevented: boolean;
    /** @internal */ public _stoppedImmediatePropagation: boolean;
    /** @internal */ public _bubbles: boolean;
    /** @internal */ public _type: keyof Events;
    /** @internal */ public _target: Object3D;

  constructor(cancelable = false) {
    this.cancelable = cancelable;
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
  /** Original dom event. */
  public domEvent: MouseEvent;
  /** Returns true if the alt key was down when the mouse event was fired. */
  public get altKey() { return this.domEvent.altKey }
  /** The button number that was pressed (if applicable) when the mouse event was fired. */
  public get button() { return this.domEvent.button }
  /** The buttons being pressed (if any) when the mouse event was fired. */
  public get buttons() { return this.domEvent.buttons }
  /** The X coordinate of the mouse pointer in local (DOM content) coordinates. */
  public get clientX() { return this.domEvent.clientX }
  /** The Y coordinate of the mouse pointer in local (DOM content) coordinates. */
  public get clientY() { return this.domEvent.clientY }
  /** Returns true if the control key was down when the mouse event was fired. */
  public get ctrlKey() { return this.domEvent.ctrlKey }
  /** Returns true if the meta key was down when the mouse event was fired. */
  public get metaKey() { return this.domEvent.metaKey }
  /** The X coordinate of the pointer relative to the position of the last event. */
  public get movementX() { return this.domEvent.movementX }
  /** The Y coordinate of the pointer relative to the position of the last event. */
  public get movementY() { return this.domEvent.movementY }
  /** The X coordinate of the mouse pointer relative to the position of the padding edge of the target node. */
  public get offsetX() { return this.domEvent.offsetX }
  /** The Y coordinate of the mouse pointer relative to the position of the padding edge of the target node. */
  public get offsetY() { return this.domEvent.offsetY }
  /** The X coordinate of the mouse pointer relative to the whole document. */
  public get pageX() { return this.domEvent.pageX }
  /** The Y coordinate of the mouse pointer relative to the whole document. */
  public get pageY() { return this.domEvent.pageY }
  /** The secondary target for the event, if there is one. */
  public readonly relatedTarget: Object3D;
  /** The X coordinate of the mouse pointer in global (screen) coordinates. */
  public get screenX() { return this.domEvent.screenX }
  /** The Y coordinate of the mouse pointer in global (screen) coordinates. */
  public get screenY() { return this.domEvent.screenY }
  /** Returns true if the shift key was down when the mouse event was fired. */
  public get shiftKey() { return this.domEvent.shiftKey }
  /** TODO. */
  public readonly intersection: IntersectionExt;

  constructor(event: MouseEvent, intersection: IntersectionExt, relatedTarget?: Object3D, cancelable?: boolean) {
    super(cancelable);
    this.domEvent = event;
    this.intersection = intersection;
    this.relatedTarget = relatedTarget;
  }

  /** Returns the current state of the specified modifier key. See KeyboardEvent.getModifierState() for details. */
  public getModifierState(keyArg: string): boolean {
    return this.domEvent.getModifierState(keyArg);
  }
}

export class PointerEventExt extends MouseEventExt {
  public override domEvent: PointerEvent;
  /** A unique identifier for the pointer causing the event. */
  public get pointerId() { return this.domEvent.pointerId }
  /** The width (magnitude on the X axis), in CSS pixels, of the contact geometry of the pointer. */
  public get width() { return this.domEvent.width }
  /** The height (magnitude on the Y axis), in CSS pixels, of the contact geometry of the pointer. */
  public get height() { return this.domEvent.height }
  /** The normalized pressure of the pointer input in the range 0 to 1, where 0 and 1 represent the minimum and maximum pressure the hardware is capable of detecting, respectively. */
  public get pressure() { return this.domEvent.pressure }
  /** The normalized tangential pressure of the pointer input (also known as barrel pressure or cylinder stress) in the range -1 to 1, where 0 is the neutral position of the control. */
  public get tangentialPressure() { return this.domEvent.tangentialPressure }
  /** The plane angle (in degrees, in the range of -90 to 90) between the Y–Z plane and the plane containing both the pointer (e.g. pen stylus) axis and the Y axis. */
  public get tiltX() { return this.domEvent.tiltX }
  /** The plane angle (in degrees, in the range of -90 to 90) between the X–Z plane and the plane containing both the pointer (e.g. pen stylus) axis and the X axis. */
  public get tiltY() { return this.domEvent.tiltY }
  /** The clockwise rotation of the pointer (e.g. pen stylus) around its major axis in degrees, with a value in the range 0 to 359. */
  public get twist() { return this.domEvent.twist }
  /** Indicates the device type that caused the event (mouse, pen, touch, etc.). */
  public get pointerType() { return this.domEvent.pointerType }
  /** Indicates if the pointer represents the primary pointer of this pointer type. */
  public get isPrimary() { return this.domEvent.isPrimary }

  constructor(event: PointerEvent, intersection: IntersectionExt, relatedTarget?: Object3D, cancelable?: boolean) {
    super(event, intersection, relatedTarget, cancelable);
  }

  /** Returns a sequence of all PointerEvent instances that were coalesced into the dispatched pointermove event. */
  public getCoalescedEvents(): PointerEventExt {
    console.error("getCoalescedEvents not implemented yet.");
    return undefined; // TODO
  }

  /** Returns a sequence of PointerEvent instances that the browser predicts will follow the dispatched pointermove event's coalesced events. */
  public getPredictedEvents(): PointerEventExt {
    console.error("getPredictedEvents not implemented yet.");
    return undefined; // TODO
  }
}

export class DragEventExt extends PointerEventExt {
  /** TODO */
  public readonly dataTransfer: { [x: string]: any };
  /** TODO */
  public readonly position: Vector3;

  constructor(event?: PointerEvent, cancelable = false, dataTransfer: { [x: string]: any } = {}, position?: Vector3, relatedTarget?: Object3D, intersection?: IntersectionExt) {
    super(event, intersection, relatedTarget, cancelable);
    this.position = position;
    this.dataTransfer = dataTransfer;
  }
}

export class PointerIntersectionEvent extends EventExt {
  /** TODO. */
  public readonly intersection: IntersectionExt;

  constructor(intersection: IntersectionExt) {
    super();
    this.intersection = intersection;
  }
}

export class WheelEventExt extends MouseEventExt {
  public override domEvent: WheelEvent;
  /*  Returns an unsigned long representing the unit of the delta* values' scroll amount. Permitted values are: 0 = pixels, 1 = lines, 2 = pages. */
  public get deltaMode() { return this.domEvent.deltaMode }
  /** Returns a double representing the horizontal scroll amount. */
  public get deltaX() { return this.domEvent.deltaX }
  /** Returns a double representing the vertical scroll amount. */
  public get deltaY() { return this.domEvent.deltaY }
  /** Returns a double representing the scroll amount for the z-axis. */
  public get deltaZ() { return this.domEvent.deltaZ }

  constructor(event: WheelEvent, intersection: IntersectionExt) {
    super(event, intersection);
  }
}

export class KeyboardEventExt extends EventExt {
  /** Original dom event. */
  public readonly domEvent: KeyboardEvent;
  /** Returns a boolean value that is true if the Alt (Option or ⌥ on macOS) key was active when the key event was generated. */
  public get altKey() { return this.domEvent.altKey }
  /** Returns a string with the code value of the physical key represented by the event. */
  public get code() { return this.domEvent.code }
  /** Returns a boolean value that is true if the Ctrl key was active when the key event was generated. */
  public get ctrlKey() { return this.domEvent.ctrlKey }
  /** Returns a string representing the key value of the key represented by the event. */
  public get key() { return this.domEvent.key }
  /** Returns a number representing the location of the key on the keyboard or other input device. Visit https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/location for more info. */
  public get location() { return this.domEvent.location }
  /** Returns a boolean value that is true if the Meta key (on Mac keyboards, the ⌘ Command key; on Windows keyboards, the Windows key (⊞)) was active when the key event was generated. */
  public get metaKey() { return this.domEvent.metaKey }
  /** Returns a boolean value that is true if the key is being held down such that it is automatically repeating. */
  public get repeat() { return this.domEvent.repeat }
  /** Returns a boolean value that is true if the Shift key was active when the key event was generated. */
  public get shiftKey() { return this.domEvent.shiftKey }

  constructor(event: KeyboardEvent, cancelable: boolean) {
    super(cancelable);
    this.domEvent = event;
  }

  /** Returns a boolean value indicating if a modifier key such as Alt, Shift, Ctrl, or Meta, was pressed when the event was created. */
  public getModifierState(keyArg: string): boolean {
    return this.domEvent.getModifierState(keyArg);
  }
}

export class FocusEventExt extends EventExt {
  /** The secondary target for the event. */
  public relatedTarget: Object3D

  constructor(relatedTarget: Object3D) {
    super();
    this.relatedTarget = relatedTarget;
  }
}

export class RendererResizeEvent extends EventExt {
  /** Returns the new renderer width. TODO */
  public readonly width: number;
  /** Returns the new renderer height. TODO */
  public readonly height: number;
  /** Returns resized renderer. TODO */
  public readonly renderer: WebGLRenderer;

  constructor(renderer: WebGLRenderer, width: number, height: number) {
    super();
    this.renderer = renderer;
    this.width = width;
    this.height = height;
  }
}
