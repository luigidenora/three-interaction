export function eventExt(event, type, target) {
    return {
        timeStamp: event.timeStamp,
        type: type,
        target: target,
        preventDefault: function () { this._preventDefault = true; },
        stopImmediatePropagation: function () { this._stopImmediatePropagation = this._stopPropagation = true; },
        stopPropagation: function () { this._stopPropagation = true; },
        _preventDefault: false,
        _stopImmediatePropagation: false,
        _stopPropagation: false,
    };
}
export function mouseEventExt(event, type, intersection, target) {
    const mouseEventExt = eventExt(event, type, target);
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
