import { Object3D } from "three";
import { EventExt, Events, IntersectionExt, MouseEventExt } from "./Events";
export declare function eventExt(event: Event, type: keyof Events, target: Object3D): EventExt;
export declare function mouseEventExt(event: MouseEvent, type: keyof Events, intersection: IntersectionExt, target: Object3D): MouseEventExt;
