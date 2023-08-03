import { Euler, MathUtils, Object3D, Vector3 } from "three";
import { DEFAULT_EASING, Easing } from "./Easings";
import { Tween } from "./Tween";
import { RunningAction } from "./RunningTween";

export type Motion = { [x: string]: any; easing?: Easing };

/** @internal */
export interface ActionDescriptor {
    actions?: RunningAction[];
    tweens?: Tween[];
}

/** @internal */
export interface IAction {
    init?(target: Object3D): ActionDescriptor;
    hasActions: boolean;
    isRepeat?: boolean;
    isYoyo?: boolean;
    isTween?: boolean;
    times?: number;
}

/** @internal */
export class ActionRepeat implements IAction {
    public hasActions = false;
    public isRepeat = true;
    constructor(public times: number) { }
}

/** @internal */
export class ActionYoyo implements IAction {
    public hasActions = false;
    public isYoyo = true;
    constructor(public times: number) { }
}

/** @internal */
export class ActionTween implements IAction {
    public hasActions = true;
    public isTween = true;
    constructor(public tweens: Tween[]) { }
}

/** @internal */
export class ActionCallback implements IAction {
    public hasActions = true;
    constructor(public callback: () => void) { }

    public init(): ActionDescriptor {
        return { actions: [{ callback: this.callback, time: 0 }] };
    }
}

/** @internal */
export class ActionDelay implements IAction {
    public hasActions = true;
    constructor(public time: number) { }

    public init(): ActionDescriptor {
        return { actions: [{ callback: () => { }, time: this.time }] };
    }
}

/** @internal */
export class ActionMotion implements IAction {
    public hasActions = true;
    constructor(public time: number, public motion: Motion, public isBy: boolean) { }

    public init(target: any): ActionDescriptor {
        const actions: RunningAction[] = [];
        for (const key in this.motion) {
            if (key === "easing") continue;
            const actionValue = this.motion[key];
            const targetValue = target[key];
            const action = this.vector3(actionValue, targetValue)
                ?? this.euler(actionValue, targetValue)
                ?? this.any(actionValue, target, key);
            if (action) {
                actions.push(action);
            }
        }
        return { actions };
    }

    private vector3(actionValue: any, targetValue: Vector3): RunningAction<Vector3> {
        if (targetValue?.isVector3 === true) {
            const valueRaw = actionValue.value ?? actionValue;
            const value = typeof (valueRaw) === "number" ? new Vector3(valueRaw, valueRaw, valueRaw) : valueRaw as Vector3;
            return {
                time: this.time,
                easing: actionValue.easing ?? this.motion.easing ?? DEFAULT_EASING,
                start: targetValue.clone(),
                end: this.isBy ? value.clone().add(targetValue) : value,
                callback: (start, end, alpha) => { targetValue.lerpVectors(start, end, alpha) }
            };
        }
    }

    private euler(actionValue: any, targetValue: Euler): RunningAction<Euler> {
        if (targetValue?.isEuler === true) {
            const valueRaw = actionValue.value ?? actionValue;
            const value = typeof (valueRaw) === "number" ? new Euler(valueRaw, valueRaw, valueRaw) : valueRaw as Euler;
            return {
                time: this.time,
                easing: actionValue.easing ?? this.motion.easing ?? DEFAULT_EASING,
                start: targetValue.clone(),
                end: this.isBy ? new Euler(value.x + targetValue.x, value.y + targetValue.y, value.z + targetValue.z) : value,
                callback: (start, end, alpha) => {
                    targetValue.set(MathUtils.lerp(start.x, end.x, alpha), MathUtils.lerp(start.y, end.y, alpha), MathUtils.lerp(start.z, end.z, alpha));
                }
            };
        }
    }

    private any(actionValue: any, target: any, key: string): RunningAction {
        const value = actionValue.value ?? actionValue;
        return {
            time: this.time,
            easing: actionValue.easing ?? this.motion.easing ?? DEFAULT_EASING,
            start: target[key],
            end: this.isBy ? value + target[key] : value,
            callback: (start, end, alpha) => { target[key] = MathUtils.lerp(start, end, alpha) }
        };
    }

}
