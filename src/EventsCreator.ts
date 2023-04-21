import { Object3D } from "three";
import { EventExt, Events, IntersectionExt, MouseEventExt } from "./Events";

export function eventExt(event: Event, type: keyof Events, target: Object3D): EventExt {
    return {
        timeStamp: event.timeStamp,
        type: type,
        target: target,
        preventDefault: function () { this._preventDefault = true },
        stopImmediatePropagation: function () { this._stopImmediatePropagation = this._stopPropagation = true },
        stopPropagation: function () { this._stopPropagation = true },
        _preventDefault: false,
        _stopImmediatePropagation: false,
        _stopPropagation: false,
    };
}

export function mouseEventExt(event: MouseEvent, type: keyof Events, intersection: IntersectionExt, target: Object3D): MouseEventExt {
    const mouseEventExt = eventExt(event, type, target) as MouseEventExt;
    mouseEventExt.altKey = event.altKey;
    mouseEventExt.button = event.button;
    mouseEventExt.buttons = event.buttons;
    mouseEventExt.ctrlKey = event.ctrlKey;
    mouseEventExt.metaKey = event.metaKey;
    mouseEventExt.shiftKey = event.shiftKey;
    mouseEventExt.intersection = intersection;
    mouseEventExt.movement = undefined;
    mouseEventExt.getModifierState = undefined;
    return mouseEventExt;
}
