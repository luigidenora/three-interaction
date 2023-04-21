import { Object3D } from "https://unpkg.com/three@0.151.0/build/three.module.js";
import { EventsDispatcher } from "./EventsDispatcher";
export function applyPatch() {
    Object3D.prototype.interceptByRaycaster = true;
    Object3D.prototype.bindEvent = function (type, listener) {
        var _a;
        (_a = this._eventsDispatcher) !== null && _a !== void 0 ? _a : (this._eventsDispatcher = new EventsDispatcher(this));
        return this._eventsDispatcher.addEventListener(type.toLowerCase(), listener);
    };
    Object3D.prototype.hasBoundEvent = function (type, listener) {
        var _a;
        (_a = this._eventsDispatcher) !== null && _a !== void 0 ? _a : (this._eventsDispatcher = new EventsDispatcher(this));
        return this._eventsDispatcher.hasEventListener(type.toLowerCase(), listener);
    };
    Object3D.prototype.unbindEvent = function (type, listener) {
        var _a;
        (_a = this._eventsDispatcher) !== null && _a !== void 0 ? _a : (this._eventsDispatcher = new EventsDispatcher(this));
        this._eventsDispatcher.removeEventListener(type.toLowerCase(), listener);
    };
    Object3D.prototype.triggerEvent = function (type, args) {
        var _a;
        (_a = this._eventsDispatcher) !== null && _a !== void 0 ? _a : (this._eventsDispatcher = new EventsDispatcher(this));
        this._eventsDispatcher.dispatchEvent(type.toLowerCase(), args);
    };
}
