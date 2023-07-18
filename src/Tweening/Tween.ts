import { Object3D } from "three";
import { TweenManager } from "./TweenManager";
import { ActionCallback, ActionDelay, ActionMotion, ActionRepeat, ActionYoyo, IAction, Motion } from "./Actions";

export class Tween {
    /** @internal */ public _actions: IAction[] = [];
    private _target: Object3D;

    constructor(target: Object3D) {
        this._target = target;
    }

    public to(time: number, action: Motion): this {
        this._actions.push(new ActionMotion(time, action, false));
        return this;
    }

    public by(time: number, action: Motion): this {
        this._actions.push(new ActionMotion(time, action, true));
        return this;
    }

    public call(callback: () => void): this {
        this._actions.push(new ActionCallback(callback));
        return this;
    }

    public delay(time: number): this {
        this._actions.push(new ActionDelay(time));
        return this;
    }

    public repeat(times = 1): this {
        this._actions.push(new ActionRepeat(times));
        return this;
    }

    public repeatForever(): this {
        this._actions.push(new ActionRepeat(Infinity));
        return this;
    }

    public yoyo(times = 1): this {
        this._actions.push(new ActionYoyo(times));
        return this;
    }

    public start(): void {
        TweenManager.start(this._target, this);
    }

    public stop(): void {
        // TweenManager.stop(this._target, this);
    }

    public clone(): Tween {
        return undefined;
    }

    public then(tween: Tween): this {
        return this;
    }

    // public parallel()
}
