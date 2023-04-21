export class EventsDispatcher {
    constructor(_parent) {
        this._parent = _parent;
        this._listeners = {};
    }
    //TODO multibind mousedown mouseup
    addEventListener(type, listener) {
        var _a;
        (_a = this._listeners[type]) !== null && _a !== void 0 ? _a : (this._listeners[type] = []);
        this._listeners[type].indexOf(listener) === -1 && this._listeners[type].push(listener);
        return listener;
    }
    hasEventListener(type, listener) {
        var _a, _b;
        return (_b = ((_a = this._listeners[type]) === null || _a === void 0 ? void 0 : _a.indexOf(listener)) !== -1) !== null && _b !== void 0 ? _b : false;
    }
    removeEventListener(type, listener) {
        var _a, _b;
        const index = (_b = (_a = this._listeners[type]) === null || _a === void 0 ? void 0 : _a.indexOf(listener)) !== null && _b !== void 0 ? _b : -1;
        index !== -1 && this._listeners[type].splice(index, 1);
    }
    dispatchEvent(type, args) {
        if (!this._listeners[type])
            return;
        for (const callback of [...this._listeners[type]]) { // Make a copy, in case listeners are removed while iterating.
            if (args._stopImmediatePropagation)
                break;
            callback.call(this._parent, args);
        }
    }
}
