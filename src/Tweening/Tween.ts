import { Object3D } from "three";
import { TweenManager } from "./TweenManager";
import { ActionCallback, ActionDelay, ActionMotion, ActionRepeat, ActionTween, ActionYoyo, IAction, Motion } from "./Actions";

export class Tween {
    public actions: IAction[] = [];
    public tags: string[] = [];
    public target: Object3D;

    constructor(target?: Object3D) {
        this.target = target;
    }

    public setTarget(target: Object3D): this {
        this.target = target;
        return this;
    }

    public to(time: number, action: Motion): this {
        this.actions.push(new ActionMotion(time, action, false));
        return this;
    }

    public by(time: number, action: Motion): this {
        this.actions.push(new ActionMotion(time, action, true));
        return this;
    }

    public call(callback: () => void): this {
        this.actions.push(new ActionCallback(callback));
        return this;
    }

    public delay(time: number): this {
        this.actions.push(new ActionDelay(time));
        return this;
    }

    public repeat(times = 1): this {
        this.actions.push(new ActionRepeat(times));
        return this;
    }

    public repeatForever(): this {
        this.actions.push(new ActionRepeat(Infinity));
        return this;
    }

    public yoyo(times = 1): this {
        this.actions.push(new ActionYoyo(times));
        return this;
    }

    public yoyoForever(): this {
        this.actions.push(new ActionYoyo(Infinity));
        return this;
    }

    public then(tween: Tween): this {
        this.actions.push(new ActionTween([tween]));
        return this;
    }

    public parallel(tweens: Tween[]): this {
        this.actions.push(new ActionTween(tweens));
        return this;
    }

    public start(): void {
        TweenManager.start(this.target, this);
    }

    public stop(): void {
        // TweenManager.stop(this._target, this);
    }

    public clone(): Tween {
        const tween = new Tween(this.target);
        tween.actions = [...this.actions];
        tween.tags = [...this.tags];
        return tween;
    }

}
