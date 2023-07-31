import { Euler, MathUtils, Object3D, Vector3 } from "three";
import { DEFAULT_EASING, Easing } from "./Easings";
import { Tween } from "./Tween";
import { ExecutionAction } from "./ExecutionTween";

// custom TODO e add time per ogni cosino?

export type MotionValue<T = any> = { value: T, easing?: Easing };
export type Motion<T> = { [Property in keyof T]?: T[Property] | MotionValue<T> } & { easing?: Easing };

/** @internal */
export interface ActionDescriptor {
    actions?: ExecutionAction[];
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
export class ActionMotion<T> implements IAction {
    public hasActions = true;
    constructor(public time: number, public motion: Motion<T>, public isBy: boolean) { }

    public init(target: any): ActionDescriptor { //TODO vedere gli any
        const actions: ExecutionAction[] = [];
        for (const key in this.motion) {
            if ((key as keyof Motion<T>) === "easing") continue;
            const actionValue = this.motion[key as keyof Motion<T>];
            const targetValue = target[key];
            const action = this.vector3(actionValue, targetValue as Vector3)
                ?? this.euler(actionValue, targetValue as Euler)
                ?? this.any(actionValue, target, key);
            if (action) {
                actions.push(action);
            }
        }
        return { actions };
    }

    private vector3(actionValue: Motion<T>[keyof T | "easing"], targetValue: Vector3): ExecutionAction<Vector3> {
        if (targetValue?.isVector3 === true) {
            const valueRaw = (actionValue as MotionValue<number | Vector3>).value ?? actionValue as (number | Vector3);
            const value = typeof (valueRaw) === "number" ? new Vector3(valueRaw, valueRaw, valueRaw) : valueRaw;
            return {
                time: this.time,
                easing: (actionValue as MotionValue<number | Vector3>).easing ?? this.motion.easing ?? DEFAULT_EASING,
                start: targetValue.clone(),
                end: this.isBy ? value.clone().add(targetValue) : value,
                callback: (start, end, alpha) => { targetValue.lerpVectors(start, end, alpha) }
            };
        }
    }

    private euler(actionValue: Motion<T>[keyof T | "easing"], targetValue: Euler): ExecutionAction<Euler> {
        if (targetValue?.isEuler === true) {
            const valueRaw = (actionValue as MotionValue<Euler>).value ?? actionValue as Euler;
            const value = typeof (valueRaw) === "number" ? new Euler(valueRaw, valueRaw, valueRaw) : valueRaw;
            value.order = targetValue.order;
            return {
                time: this.time,
                easing: (actionValue as MotionValue<Euler>).easing ?? this.motion.easing ?? DEFAULT_EASING,
                start: targetValue.clone(),
                end: this.isBy ? new Euler(value.x + targetValue.x, value.y + targetValue.y, value.z + targetValue.z, targetValue.order) : value,
                callback: (start, end, alpha) => {
                    targetValue.set(MathUtils.lerp(start.x, end.x, alpha), MathUtils.lerp(start.y, end.y, alpha), MathUtils.lerp(start.z, end.z, alpha));
                }
            };
        }
    }

    private any(actionValue: Motion<T>[keyof T | "easing"], target: any, key: string): ExecutionAction {
        const value = (actionValue as MotionValue).value ?? actionValue;
        return {
            time: this.time,
            easing: (actionValue as MotionValue<number | Vector3>).easing ?? this.motion.easing ?? DEFAULT_EASING,
            start: target[key],
            end: this.isBy ? value + target[key] : value,
            callback: (start, end, alpha) => {  MathUtils.lerp(start, end, alpha) }
        };
    }

}
