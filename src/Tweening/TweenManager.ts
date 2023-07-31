import { ExecutionTween } from "./ExecutionTween";
import { Tween } from "./Tween";

/** @internal */
export class TweenManager {
    private static _executionTweens: ExecutionTween[] = [];
    private static _executionTweensChildren: ExecutionTween[] = [];

    public static create(target: any, tween: Tween): ExecutionTween {
        const executionTween = new ExecutionTween(target, tween);
        executionTween.getBlock();
        this._executionTweens.push(executionTween);
        return executionTween;
    }

    public static createChildren(target: any, tween: Tween): ExecutionTween {
        const executionTween = new ExecutionTween(target, tween);
        executionTween.getBlock();
        this._executionTweensChildren.push(executionTween);
        return executionTween;
    }

    public static addChildren(runningTween: ExecutionTween): void {
        this._executionTweensChildren.push(runningTween);
    }

    // public static stop2(executionTween: ExecutionTween, target: any): void {
    //     const index = this._executionTweens.findIndex(x => x.target === target && (x.root ?? x) === executionTween);
    //     if (index === -1) return;
    //     this._executionTweens.splice(index, 1);
    // }

    public static update(delta: number): void {
        for (let i = this._executionTweensChildren.length - 1; i >= 0; i--) {
            if (!this._executionTweensChildren[i].execute(delta)) {
                this._executionTweensChildren.splice(i, 1);
            }
        }

        for (let i = this._executionTweens.length - 1; i >= 0; i--) {
            if (!this._executionTweens[i].execute(delta)) {
                this._executionTweens.splice(i, 1);
            }
        }
    }

}
