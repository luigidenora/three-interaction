import { RunningTween } from "./RunningTween";
import { Tween } from "./Tween";

/** @internal */
export class TweenManager {
    private static _runningTweens: RunningTween[] = [];
    private static _runningTweensChildren: RunningTween[] = [];

    public static create(target: any, tween: Tween): RunningTween {
        const runningTween = new RunningTween(target, tween);
        runningTween.getBlock();
        this._runningTweens.push(runningTween);
        return runningTween;
    }

    public static createChildren(target: any, tween: Tween): RunningTween {
        const runningTween = new RunningTween(target, tween);
        runningTween.getBlock();
        this._runningTweensChildren.push(runningTween);
        return runningTween;
    }

    public static addChildren(runningTween: RunningTween): void {
        this._runningTweensChildren.push(runningTween);
    }

    public static update(delta: number): void {
        for (let i = this._runningTweensChildren.length - 1; i >= 0; i--) {
            if (!this._runningTweensChildren[i].execute(delta)) {
                this._runningTweensChildren.splice(i, 1);
            }
        }

        for (let i = this._runningTweens.length - 1; i >= 0; i--) {
            if (!this._runningTweens[i].execute(delta)) {
                this._runningTweens.splice(i, 1);
            }
        }
    }

}
