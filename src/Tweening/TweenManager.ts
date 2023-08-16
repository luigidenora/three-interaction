import { RunningTween } from "./RunningTween";
import { Tween } from "./Tween";

/** @internal */
export class TweenManager {
    private static _running: RunningTween[] = [];
    private static _runningChildren: RunningTween[] = [];

    public static create(target: any, tween: Tween): RunningTween {
        const runningTween = new RunningTween(target, tween);
        runningTween.getBlock();
        this._running.push(runningTween);
        return runningTween;
    }

    public static createChildren(target: any, tween: Tween, root: RunningTween): RunningTween {
        const runningTween = new RunningTween(target, tween);
        runningTween.root = root;
        runningTween.getBlock();
        this._runningChildren.push(runningTween);
        return runningTween;
    }

    public static addChildren(runningTween: RunningTween): void {
        this._runningChildren.push(runningTween);
    }

    public static update(delta: number): void {
        const runningChildren = this._runningChildren;
        for (let i = runningChildren.length - 1; i >= 0; i--) {
            if (!runningChildren[i].execute(delta)) {
                runningChildren.splice(i, 1);
            }
        }

        const running = this._running;
        for (let i = running.length - 1; i >= 0; i--) {
            if (!running[i].execute(delta)) {
                running[i]._finished = true;
                running.splice(i, 1);
            }
        }
    }

    public static stop(runningTween: RunningTween): void {
        const index = this._running.indexOf(runningTween);
        if (index === -1) return;
        this._running.splice(index, 1);
        runningTween._finished = true;
        runningTween.paused = false;

        const runningChildren = this._runningChildren;
        for (let i = runningChildren.length - 1; i >= 0; i--) {
            if (runningChildren[i].root === runningTween) {
                runningChildren.splice(i, 1);
            }
        }
    }

    public static complete(runningTween: RunningTween): void {
        const index = this._running.indexOf(runningTween);
        if (index === -1) return;
        runningTween.paused = false;

        const runningChildren = this._runningChildren;
        for (let i = runningChildren.length - 1; i >= 0; i--) {
            if (runningChildren[i].root === runningTween && !runningChildren[i].execute(Infinity)) {
                runningChildren.splice(i, 1);
            }
        }

        if (!runningTween.execute(Infinity)) {
            this._running.splice(index, 1);
            runningTween._finished = true;
        }
    }

}
