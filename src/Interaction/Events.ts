import { Intersection, Object3D, Vector3, WebGLRenderer } from "three";

export interface Events extends InteractionEvents, MiscEvents, UpdateEvents { };

export interface UpdateEvents {
  positionchange: never;
  scalechange: never;
  rotationchange: never;
  quaternionchange: never;
  // childadd
  // childremove 
  // parentdadd // This event propagation Up to down.
  // parentremove // This event propagation Up to down.
  // enablechange // This event propagation Up to down.
  // visiblechange // This event propagation Up to down.
  // ownenablechange // This event propagation Up to down.
  // ownvisiblechange // This event propagation Up to down.
}

export interface MiscEvents {
  rendererresize: RendererResizeEvent;
  animate: { delta: DOMHighResTimeStamp, total: DOMHighResTimeStamp };
  framerendering: never;
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
  click: PointerEventExt;
  dblclick: PointerEventExt;
  wheel: WheelEventExt;
  focusin: FocusEventExt
  focusout: FocusEventExt
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
  /** Returns true if the alt key was down when the mouse event was fired. */
  public get altKey() { return this._event.altKey }
  /** The button number that was pressed (if applicable) when the mouse event was fired. */
  public get button() { return this._event.button }
  /** The buttons being pressed (if any) when the mouse event was fired. */
  public get buttons() { return this._event.buttons }
  /** The X coordinate of the mouse pointer in local (DOM content) coordinates. */
  public get clientX() { return this._event.clientX }
  /** The Y coordinate of the mouse pointer in local (DOM content) coordinates. */
  public get clientY() { return this._event.clientY }
  /** Returns true if the control key was down when the mouse event was fired. */
  public get ctrlKey() { return this._event.ctrlKey }
  /** Returns true if the meta key was down when the mouse event was fired. */
  public get metaKey() { return this._event.metaKey }
  /** The X coordinate of the pointer relative to the position of the last event. */
  public get movementX() { return this._event.movementX }
  /** The Y coordinate of the pointer relative to the position of the last event. */
  public get movementY() { return this._event.movementY }
  /** The X coordinate of the mouse pointer relative to the position of the padding edge of the target node. */
  public get offsetX() { return this._event.offsetX }
  /** The Y coordinate of the mouse pointer relative to the position of the padding edge of the target node. */
  public get offsetY() { return this._event.offsetY }
  /** The X coordinate of the mouse pointer relative to the whole document. */
  public get pageX() { return this._event.pageX }
  /** The Y coordinate of the mouse pointer relative to the whole document. */
  public get pageY() { return this._event.pageY }
  /** The secondary target for the event, if there is one. */
  public readonly relatedTarget: Object3D;
  /** The X coordinate of the mouse pointer in global (screen) coordinates. */
  public get screenX() { return this._event.screenX }
  /** The Y coordinate of the mouse pointer in global (screen) coordinates. */
  public get screenY() { return this._event.screenY }
  /** Returns true if the shift key was down when the mouse event was fired. */
  public get shiftKey() { return this._event.shiftKey }
  /** Original dom event */
  public _event: MouseEvent;
  /** TODO. */
  public readonly intersection: IntersectionExt;
  /** TODO. */
  public readonly movement: Vector3;

  constructor(event: MouseEvent, intersection: IntersectionExt, lastIntersection: IntersectionExt, relatedTarget?: Object3D, cancelable?: boolean) {
    super(cancelable);
    this._event = event;
    this.intersection = intersection;
    this.relatedTarget = relatedTarget;
    if (intersection?.object === lastIntersection?.object) {
      this.movement = intersection.point.clone().sub(lastIntersection.point); //TODO cache vec
    }
  }

  /** Returns the current state of the specified modifier key. See KeyboardEvent.getModifierState() for details. */
  public getModifierState(keyArg: string): boolean {
    return this._event.getModifierState(keyArg);
  }
}

export class PointerEventExt extends MouseEventExt {
  /** A unique identifier for the pointer causing the event. */
  public get pointerId() { return this._event.pointerId }
  /** The width (magnitude on the X axis), in CSS pixels, of the contact geometry of the pointer. */
  public get width() { return this._event.width }
  /** The height (magnitude on the Y axis), in CSS pixels, of the contact geometry of the pointer. */
  public get height() { return this._event.height }
  /** The normalized pressure of the pointer input in the range 0 to 1, where 0 and 1 represent the minimum and maximum pressure the hardware is capable of detecting, respectively. */
  public get pressure() { return this._event.pressure }
  /** The normalized tangential pressure of the pointer input (also known as barrel pressure or cylinder stress) in the range -1 to 1, where 0 is the neutral position of the control. */
  public get tangentialPressure() { return this._event.tangentialPressure }
  /** The plane angle (in degrees, in the range of -90 to 90) between the Y–Z plane and the plane containing both the pointer (e.g. pen stylus) axis and the Y axis. */
  public get tiltX() { return this._event.tiltX }
  /** The plane angle (in degrees, in the range of -90 to 90) between the X–Z plane and the plane containing both the pointer (e.g. pen stylus) axis and the X axis. */
  public get tiltY() { return this._event.tiltY }
  /** The clockwise rotation of the pointer (e.g. pen stylus) around its major axis in degrees, with a value in the range 0 to 359. */
  public get twist() { return this._event.twist }
  /** Indicates the device type that caused the event (mouse, pen, touch, etc.). */
  public get pointerType() { return this._event.pointerType }
  /** Indicates if the pointer represents the primary pointer of this pointer type. */
  public get isPrimary() { return this._event.isPrimary }
  public override _event: PointerEvent;

  constructor(event: PointerEvent, intersection: IntersectionExt, lastIntersection: IntersectionExt, relatedTarget?: Object3D, cancelable?: boolean) {
    super(event, intersection, lastIntersection, relatedTarget, cancelable);
  }

  /** Returns a sequence of all PointerEvent instances that were coalesced into the dispatched pointermove event. */
  public getCoalescedEvents(): PointerEventExt {
    return undefined; // TODO
  }

  /** Returns a sequence of PointerEvent instances that the browser predicts will follow the dispatched pointermove event's coalesced events. */
  public getPredictedEvents(): PointerEventExt {
    return undefined; // TODO
  }
}

export class PointerIntersectionEvent extends EventExt {
  /** TODO. */
  public readonly intersection: IntersectionExt;
  /** TODO. */
  public readonly movement: Vector3;

  constructor(intersection: IntersectionExt, lastIntersection: IntersectionExt) {
    super();
    this.intersection = intersection;
    if (intersection.object === lastIntersection?.object) {
      this.movement = intersection.point.clone().sub(lastIntersection.point);
    }
  }
}

export class WheelEventExt extends MouseEventExt {
  /*  Returns an unsigned long representing the unit of the delta* values' scroll amount. Permitted values are: 0 = pixels, 1 = lines, 2 = pages. */
  public readonly deltaMode: number;
  /** Returns a double representing the horizontal scroll amount. */
  public readonly deltaX: number;
  /** Returns a double representing the vertical scroll amount. */
  public readonly deltaY: number;
  /** Returns a double representing the scroll amount for the z-axis. */
  public readonly deltaZ: number;
  public override _event: WheelEvent;

  constructor(event: WheelEvent, intersection: IntersectionExt) {
    super(event, intersection, undefined);
  }
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

export class FocusEventExt extends EventExt {
  /** The secondary target for the event. */
  public relatedTarget: Object3D

  constructor(relatedTarget: Object3D) {
    super();
    this.relatedTarget = relatedTarget;
  }
}
