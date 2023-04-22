import { Object3D } from "three";
import { EventExt, Events, IntersectionExt, MouseEventExt, PointerEventExt } from "./Events";

export function createEventExt<K extends keyof Events>(type: K, event: Event, target: Object3D, intersection: IntersectionExt): Events[K] {
    switch (type) {
        case "click":
        case "dblclick":
        case "pointercancel":
        case "pointerdown":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "pointerup":
            return pointerEventExt(type, event as PointerEvent, intersection, target) as Events[K];
        case "mousedown":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "mouseup":
            return mouseEventExt(type, event as MouseEvent, intersection, target) as Events[K];
        default:
            console.error(`Cannot create eventExt object with '${type}' type. Please implements it in createEventExt function.`);
    }
}

function eventExt(type: keyof Events, event: Event, target: Object3D): EventExt {
    return {
        timeStamp: event.timeStamp,
        type: type,
        target: target,
        preventDefault: function () { this._preventDefault = true },
        stopImmediatePropagation: function () { this._stopImmediatePropagation = this._stopPropagation = true },
        stopPropagation: function () { this._stopPropagation = true },
        _preventDefault: false,
        _stopImmediatePropagation: false,
        _stopPropagation: false
    };
}

function mouseEventExt(type: keyof Events, event: MouseEvent, intersection: IntersectionExt, target?: Object3D): MouseEventExt {
    const mouseEventExt = eventExt(type, event, target) as MouseEventExt;
    mouseEventExt.altKey = event.altKey;
    mouseEventExt.button = event.button;
    mouseEventExt.buttons = event.buttons;
    mouseEventExt.ctrlKey = event.ctrlKey;
    mouseEventExt.metaKey = event.metaKey;
    mouseEventExt.shiftKey = event.shiftKey;
    mouseEventExt.intersection = intersection;
    mouseEventExt.movement = undefined; //TODO
    mouseEventExt.getModifierState = (keyArg) => event.getModifierState(keyArg);
    return mouseEventExt;
}

function pointerEventExt(type: keyof Events, event: PointerEvent, intersection: IntersectionExt, target?: Object3D): PointerEventExt {
    const pointerEventExt = mouseEventExt(type, event, intersection, target) as PointerEventExt;
    pointerEventExt.isPrimary = event.isPrimary;
    pointerEventExt.pointerId = event.pointerId;
    pointerEventExt.pointerType = event.pointerType;
    pointerEventExt.pressure = event.pressure;
    pointerEventExt.tangentialPressure = event.tangentialPressure;
    pointerEventExt.tiltX = event.tiltX;
    pointerEventExt.tiltY = event.tiltY;
    pointerEventExt.twist = event.twist;
    pointerEventExt.getCoalescedEvents = undefined; //TODO
    pointerEventExt.getPredictedEvents = undefined; //TODO
    return pointerEventExt;
}
