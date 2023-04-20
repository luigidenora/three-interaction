import { Object3D, Vector3 } from "three";

export interface Event {
  // A boolean value indicating whether or not the event bubbles up through the Object3D hierarchy.
  readonly bubbles: boolean;
  // A boolean value indicating whether the event is cancelable.
  readonly cancelable: boolean;
  // Indicates whether or not the call to event.preventDefault() canceled the event.
  readonly defaultPrevented: boolean;
  // The time at which the event was created (in milliseconds). By specification, this value is time since epoch—but in reality, browsers' definitions vary. In addition, work is underway to change this to be a DOMHighResTimeStamp instead.
  readonly timeStamp: DOMHighResTimeStamp;
  // The case-insensitive name identifying the type of the event.
  readonly type: string;
  // For this particular event, prevent all other listeners from being called. This includes listeners attached to the same element as well as those attached to elements that will be traversed later (during the capture phase, for instance).
  stopImmediatePropagation(): void;
  // Stops the propagation of events further along in the Object3D hierarchy.
  stopPropagation(): void;
  // Cancels the event.
  preventDefault(): void;
}

export interface MouseEvent extends Event {
  // Returns true if the alt key was down when the mouse event was fired.
  readonly altKey: boolean;
  // The button number that was pressed (if applicable) when the mouse event was fired.
  readonly button: number;
  // The buttons being pressed (if any) when the mouse event was fired.
  readonly buttons: number;
  // Returns true if the control key was down when the mouse event was fired.
  readonly ctrlKey: boolean;
  // Returns true if the meta key was down when the mouse event was fired.
  readonly metaKey: boolean;
  // Returns true if the shift key was down when the mouse event was fired.
  readonly shiftKey: boolean;
  // The coordinates of the pointer in local (scene) coordinates.
  readonly position: Vector3;
  // The coordinates of the pointer relative to the position of the last mousemove event.
  readonly movement: Vector3;
  // Returns the current state of the specified modifier key. See KeyboardEvent.getModifierState() for details.
  getModifierState(keyArg: string): boolean;
}

export interface PointerEvent extends MouseEvent {
  // Indicates if the pointer represents the primary pointer of this pointer type.
  readonly isPrimary: boolean;
  // A unique identifier for the pointer causing the event.
  readonly pointerId: number;
  // Indicates the device type that caused the event (mouse, pen, touch, etc.).
  readonly pointerType: string;
  // The normalized pressure of the pointer input in the range 0 to 1, where 0 and 1 represent the minimum and maximum pressure the hardware is capable of detecting, respectively.
  readonly pressure: number;
  // The normalized tangential pressure of the pointer input (also known as barrel pressure or cylinder stress) in the range -1 to 1, where 0 is the neutral position of the control.
  readonly tangentialPressure: number;
  // The plane angle (in degrees, in the range of -90 to 90) between the Y–Z plane and the plane containing both the pointer (e.g. pen stylus) axis and the Y axis.
  readonly tiltX: number;
  // The plane angle (in degrees, in the range of -90 to 90) between the X–Z plane and the plane containing both the pointer (e.g. pen stylus) axis and the X axis.
  readonly tiltY: number;
  // The clockwise rotation of the pointer (e.g. pen stylus) around its major axis in degrees, with a value in the range 0 to 359.
  readonly twist: number;
  // Returns a sequence of all PointerEvent instances that were coalesced into the dispatched pointermove event.
  getCoalescedEvents(): PointerEvent[];
  // Returns a sequence of PointerEvent instances that the browser predicts will follow the dispatched pointermove event's coalesced events.
  getPredictedEvents(): PointerEvent[];
}

export interface TouchEvent extends Event {
  // A Boolean value indicating whether or not the alt key was down when the touch event was fired.
  readonly altKey: boolean;
  // A TouchList of all the Touch objects representing individual points of contact whose states changed between the previous touch event and this one.
  readonly changedTouches: TouchList;
  // A Boolean value indicating whether or not the control key was down when the touch event was fired.
  readonly ctrlKey: boolean;
  // A Boolean value indicating whether or not the meta key was down when the touch event was fired.
  readonly metaKey: boolean;
  // A Boolean value indicating whether or not the shift key was down when the touch event was fired.
  readonly shiftKey: boolean;
  // A TouchList of all the Touch objects that are both currently in contact with the touch surface and were also started on the same element that is the target of the event.
  readonly targetTouches: Touch[];
  // A TouchList of all the Touch objects representing all current points of contact with the surface, regardless of target or changed status.
  readonly touches: Touch[];
}

export interface Touch {
  // Returns the amount of pressure being applied to the surface by the user, as a float between 0.0 (no pressure) and 1.0 (maximum pressure).
  readonly force: number;
  // Returns a unique identifier for this Touch object. A given touch point (say, by a finger) will have the same identifier for the duration of its movement around the surface. This lets you ensure that you're tracking the same touch all the time.
  readonly identifier: number;
  // Returns the angle (in degrees) that the ellipse described by radiusX and radiusY must be rotated, clockwise, to most accurately cover the area of contact between the user and the surface.
  readonly rotationAngle: number;
  // Returns the element on which the touch point started when it was first placed on the surface, even if the touch point has since moved outside the interactive area of that element or even been removed.
  readonly target: Object3D;
  // The coordinates of the touch in local (scene) coordinates.
  readonly position: Vector3;
}

export interface WheelEvent extends MouseEvent {
  // Returns an unsigned long representing the unit of the delta* values' scroll amount. Permitted values are: 0 = pixels, 1 = lines, 2 = pages.
  readonly deltaMode: number;
  // Returns a double representing the horizontal scroll amount.
  readonly deltaX: number;
  // Returns a double representing the vertical scroll amount.
  readonly deltaY: number;
  // Returns a double representing the scroll amount for the z-axis.
  readonly deltaZ: number;
}

export interface DragEvent extends MouseEvent {
  // The coordinates of the pointer in local (scene) coordinates.
  readonly positionToApply: Vector3;
  // The coordinates of the pointer in local (scene) coordinates.
  readonly originalPosition: Vector3;
}

export interface KeyboardEvent extends Event {
  // Returns a boolean value that is true if the Alt (Option or ⌥ on macOS) key was active when the key event was generated.
  readonly altKey: boolean;
  // Returns a string with the code value of the physical key represented by the event.
  readonly code: string;
  // Returns a boolean value that is true if the Ctrl key was active when the key event was generated.
  readonly ctrlKey: boolean;
  // Returns a string representing the key value of the key represented by the event.
  readonly key: string;
  // Returns a number representing the location of the key on the keyboard or other input device. Visit https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/location for more info.
  readonly location: number;
  // Returns a boolean value that is true if the Meta key (on Mac keyboards, the ⌘ Command key; on Windows keyboards, the Windows key (⊞)) was active when the key event was generated.
  readonly metaKey: boolean;
  // Returns a boolean value that is true if the key is being held down such that it is automatically repeating.
  readonly repeat: boolean;
  // Returns a boolean value that is true if the Shift key was active when the key event was generated.
  readonly shiftKey: boolean;
  // Returns a boolean value indicating if a modifier key such as Alt, Shift, Ctrl, or Meta, was pressed when the event was created.
  getModifierState(keyArg: string): boolean;
}

export interface Events extends DOMEvents {
  // onMouseInterception: (args: Object3DEventArgs) => void;
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
  pointerOver: PointerEvent;
  pointerEnter: PointerEvent;  //no propagation
  pointerOut: PointerEvent;
  pointerLeave: PointerEvent;  //no propagation
  pointerMove: PointerEvent;
  pointerDown: PointerEvent;
  pointerUp: PointerEvent;
  pointerCancel: PointerEvent;

  mouseOver: MouseEvent;
  mouseEnter: MouseEvent; //no propagation
  mouseOut: MouseEvent;
  mouseLeave: MouseEvent; //no propagation
  mouseMove: MouseEvent;
  mouseDown: MouseEvent;
  mouseUp: MouseEvent;

  touchStart: TouchEvent;
  touchMove: TouchEvent;
  touchEnd: TouchEvent;
  touchCancel: TouchEvent;

  click: MouseEvent;
  dblClick: MouseEvent;
  wheel: WheelEvent;

  keyDown: KeyboardEvent;
  keyUp: KeyboardEvent;

  drag: DragEvent;
  dragStart: DragEvent;
  dragEnter: DragEvent;
  dragOver: DragEvent;
  dragLeave: DragEvent;
  dragEnd: DragEvent;
  drop: DragEvent;

  // onBeforeDragMove: (args: BeforeDragMoveEventArgs) => void;
  // onAfterDragMove: (args: AfterDragMoveEventArgs) => void;
  // tap
  // dblTap
}
