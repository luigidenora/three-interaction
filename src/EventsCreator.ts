import { Object3D } from "three";
import { EventExt, IntersectionExt, MouseEventExt } from "./Events";

export class EventsCreator {

    public static event(event: Event, target: Object3D): EventExt {
        console.log(event);
        return {
            timeStamp: event.timeStamp,
            type: event.type,
            target: target,
            preventDefault: function () { this._preventDefault = true },
            stopImmediatePropagation: function () { this._stopImmediatePropagation = this._stopPropagation = true },
            stopPropagation: function () { this._stopPropagation = true },
            _preventDefault: false,
            _stopImmediatePropagation: false,
            _stopPropagation: false,
        };
    }

    public static mouseEvent(event: MouseEvent, intersection: IntersectionExt): MouseEventExt {
        const eventExt = this.event(event, intersection.object) as MouseEventExt;
        eventExt.altKey = event.altKey;
        eventExt.button = event.button;
        eventExt.buttons = event.buttons;
        eventExt.ctrlKey = event.ctrlKey;
        eventExt.metaKey = event.metaKey;
        eventExt.shiftKey = event.shiftKey;
        eventExt.intersection = intersection;
        eventExt.movement = undefined;
        eventExt.getModifierState = undefined;
        return eventExt;
    }
}
