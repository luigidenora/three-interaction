import { Intersection, Object3D, Vector3 } from "three";

export interface EventExt {
  // A reference to the object to which the event was originally dispatched.
  target: Object3D;
  // The time at which the event was created (in milliseconds). By specification, this value is time since epoch—but in reality, browsers' definitions vary. In addition, work is underway to change this to be a DOMHighResTimeStamp instead.
  timeStamp: DOMHighResTimeStamp;
  // The case-insensitive name identifying the type of the event.
  type: string;
  // For this particular event, prevent all other listeners from being called. This includes listeners attached to the same element as well as those attached to elements that will be traversed later (during the capture phase, for instance).
  stopImmediatePropagation(): void;
  // Stops the propagation of events further along in the Object3D hierarchy.
  stopPropagation(): void;
  // Cancels the event.
  preventDefault(): void;
  _stopImmediatePropagation: boolean;
  _stopPropagation: boolean;
  _preventDefault: boolean;
}

export interface MouseEventExt extends EventExt {
  // Returns true if the alt key was down when the mouse event was fired.
  altKey: boolean;
  // The button number that was pressed (if applicable) when the mouse event was fired.
  button: number;
  // The buttons being pressed (if any) when the mouse event was fired.
  buttons: number;
  // Returns true if the control key was down when the mouse event was fired.
  ctrlKey: boolean;
  // Returns true if the meta key was down when the mouse event was fired.
  metaKey: boolean;
  // Returns true if the shift key was down when the mouse event was fired.
  shiftKey: boolean;
  // TODO
  intersection: IntersectionExt;
  // The coordinates of the pointer relative to the position of the last mousemove event.
  movement: Vector3;
  // Returns the current state of the specified modifier key. See KeyboardEvent.getModifierState() for details.
  getModifierState(keyArg: string): boolean;
}

export interface PointerEventExt extends MouseEventExt {
  // Indicates if the pointer represents the primary pointer of this pointer type.
  isPrimary: boolean;
  // A unique identifier for the pointer causing the event.
  pointerId: number;
  // Indicates the device type that caused the event (mouse, pen, touch, etc.).
  pointerType: string;
  // The normalized pressure of the pointer input in the range 0 to 1, where 0 and 1 represent the minimum and maximum pressure the hardware is capable of detecting, respectively.
  pressure: number;
  // The normalized tangential pressure of the pointer input (also known as barrel pressure or cylinder stress) in the range -1 to 1, where 0 is the neutral position of the control.
  tangentialPressure: number;
  // The plane angle (in degrees, in the range of -90 to 90) between the Y–Z plane and the plane containing both the pointer (e.g. pen stylus) axis and the Y axis.
  tiltX: number;
  // The plane angle (in degrees, in the range of -90 to 90) between the X–Z plane and the plane containing both the pointer (e.g. pen stylus) axis and the X axis.
  tiltY: number;
  // The clockwise rotation of the pointer (e.g. pen stylus) around its major axis in degrees, with a value in the range 0 to 359.
  twist: number;
  // Returns a sequence of all PointerEvent instances that were coalesced into the dispatched pointermove event.
  getCoalescedEvents(): PointerEventExt[];
  // Returns a sequence of PointerEvent instances that the browser predicts will follow the dispatched pointermove event's coalesced events.
  getPredictedEvents(): PointerEventExt[];
}

export interface TouchEventExt extends EventExt {
  // A Boolean value indicating whether or not the alt key was down when the touch event was fired.
  altKey: boolean;
  // A TouchList of all the Touch objects representing individual points of contact whose states changed between the previous touch event and this one.
  changedTouches: TouchList;
  // A Boolean value indicating whether or not the control key was down when the touch event was fired.
  ctrlKey: boolean;
  // A Boolean value indicating whether or not the meta key was down when the touch event was fired.
  metaKey: boolean;
  // A Boolean value indicating whether or not the shift key was down when the touch event was fired.
  shiftKey: boolean;
  // A TouchList of all the Touch objects that are both currently in contact with the touch surface and were also started on the same element that is the target of the event.
  targetTouches: TouchExt[];
  // A TouchList of all the Touch objects representing all current points of contact with the surface, regardless of target or changed status.
  touches: TouchExt[];
}

export interface TouchExt {
  // Returns the amount of pressure being applied to the surface by the user, as a float between 0.0 (no pressure) and 1.0 (maximum pressure).
  force: number;
  // Returns a unique identifier for this Touch object. A given touch point (say, by a finger) will have the same identifier for the duration of its movement around the surface. This lets you ensure that you're tracking the same touch all the time.
  identifier: number;
  // Returns the angle (in degrees) that the ellipse described by radiusX and radiusY must be rotated, clockwise, to most accurately cover the area of contact between the user and the surface.
  rotationAngle: number;
  // Returns the element on which the touch point started when it was first placed on the surface, even if the touch point has since moved outside the interactive area of that element or even been removed.
  target: Object3D;
  // The coordinates of the touch in local (scene) coordinates.
  intersection: IntersectionExt;
}

export interface WheelEventExt extends MouseEventExt {
  // Returns an unsigned long representing the unit of the delta* values' scroll amount. Permitted values are: 0 = pixels, 1 = lines, 2 = pages.
  deltaMode: number;
  // Returns a double representing the horizontal scroll amount.
  deltaX: number;
  // Returns a double representing the vertical scroll amount.
  deltaY: number;
  // Returns a double representing the scroll amount for the z-axis.
  deltaZ: number;
}

export interface DragEventExt extends MouseEventExt {
  // The coordinates of the pointer in local (scene) coordinates.
  positionToApply: Vector3;
  // The coordinates of the pointer in local (scene) coordinates.
  originalPosition: Vector3;
}

export interface KeyboardEventExt extends EventExt {
  // Returns a boolean value that is true if the Alt (Option or ⌥ on macOS) key was active when the key event was generated.
  altKey: boolean;
  // Returns a string with the code value of the physical key represented by the event.
  code: string;
  // Returns a boolean value that is true if the Ctrl key was active when the key event was generated.
  ctrlKey: boolean;
  // Returns a string representing the key value of the key represented by the event.
  key: string;
  // Returns a number representing the location of the key on the keyboard or other input device. Visit https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/location for more info.
  location: number;
  // Returns a boolean value that is true if the Meta key (on Mac keyboards, the ⌘ Command key; on Windows keyboards, the Windows key (⊞)) was active when the key event was generated.
  metaKey: boolean;
  // Returns a boolean value that is true if the key is being held down such that it is automatically repeating.
  repeat: boolean;
  // Returns a boolean value that is true if the Shift key was active when the key event was generated.
  shiftKey: boolean;
  // Returns a boolean value indicating if a modifier key such as Alt, Shift, Ctrl, or Meta, was pressed when the event was created.
  getModifierState(keyArg: string): boolean;
}

export interface Events extends DOMEvents {
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

  // onBeforeDragMove: (args: BeforeDragMoveEventArgs) => void;
  // onAfterDragMove: (args: AfterDragMoveEventArgs) => void;
}

export interface IntersectionExt extends Intersection {
  object: Object3D;
  // Hitbox hit by raycaster.
  hitbox: Object3D;
}
