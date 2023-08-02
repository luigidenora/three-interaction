import { ActionCallback, ActionDelay, ActionMotion, ActionRepeat, ActionTween, ActionYoyo, IAction, Motion } from "./Actions";
import { RunningTween } from "./RunningTween";
import { TweenManager } from "./TweenManager";

export class Tween<T = any> {
    /** @internal */ public actions: IAction[] = [];
    public tags: string[] = [];

    constructor(public target?: T) { }

    public setTags(tags: string[]): this {
        this.tags = tags;
        return this;
    }

    public setTarget(target: T): this {
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
        if (this.actions[this.actions.length - 1].isRepeat) {
            this.actions[this.actions.length - 1].times += times;
        } else {
            this.actions.push(new ActionRepeat(times));
        }
        return this;
    }

    public repeatForever(): this {
        return this.repeat(Infinity); //TODO fix don't save history
    }

    public yoyo(times = 1): this {
        if (this.actions[this.actions.length - 1].isYoyo) {
            this.actions[this.actions.length - 1].times += times;
        } else {
            this.actions.push(new ActionYoyo(times));
        }
        return this;
    }

    public yoyoForever(): this {
        return this.yoyo(Infinity);
    }

    public then(tween: Tween): this {
        this.actions.push(new ActionTween([tween]));
        return this;
    }

    public parallel(tweens: Tween[]): this {
        this.actions.push(new ActionTween(tweens));
        return this;
    }

    public sequence(tweens: Tween[]): this {
        for (const tween of tweens) {
            this.actions.push(new ActionTween([tween]));
        }
        return this;
    }

    public chain(tween: Tween): this {
        this.actions.push(...tween.actions);
        return this;
    }

    public clone(): Tween {
        const tween = new Tween(this.target);
        tween.actions = [...this.actions];
        tween.tags = [...this.tags];
        return tween;
    }
    
    public start(): RunningTween {
        return TweenManager.create(this.target, this);
    }

}
