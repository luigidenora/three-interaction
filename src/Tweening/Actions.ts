import { Euler, Material, MathUtils, Mesh, Object3D, Vector3 } from "three";
import { DEFAULT_EASING, Easing } from "./Easings";
import { ExecutionAction } from "./TweenManager";

type MotionValueExt<T = any> = { value: T, easing?: Easing };
type MotionValue<T> = T | MotionValueExt<T>;

export interface ActionDescriptor {
    actions?: ExecutionAction<Vector3>[];
    repeat?: number;
    reverse?: boolean;
}

export interface Motion {
    easing?: Easing;
    position?: MotionValue<Vector3>;
    scale?: MotionValue<number | Vector3>;
    rotation?: MotionValue<Euler>;
    opacity?: MotionValue<number>;
    // custom TODO e add time per ogni cosino?
}

export interface IAction {
    init(target: Object3D): ActionDescriptor;
}

export class ActionCallback implements IAction {
    constructor(public callback: () => void) { }

    public init(): ActionDescriptor {
        return { actions: [{ callback: this.callback, time: 0 }] };
    }
}

export class ActionDelay implements IAction {
    constructor(public time: number) { }

    public init(): ActionDescriptor {
        return { actions: [{ callback: () => { }, time: this.time }] };
    }
}

export class ActionRepeat implements IAction {
    constructor(public times: number) { }

    public init(): ActionDescriptor {
        return { repeat: this.times };
    }
}

export class ActionYoyo implements IAction {
    constructor(public times: number) { }

    public init(): ActionDescriptor {
        return { reverse: true };
    }
}

export class ActionMotion implements IAction {
    constructor(public time: number, public motion: Motion, public isBy: boolean) { }

    public init(target: Object3D): ActionDescriptor {
        const actions: ExecutionAction[] = [];
        let action: ExecutionAction;
        (action = this.position(target)) && actions.push(action);
        (action = this.scale(target)) && actions.push(action);
        (action = this.rotation(target)) && actions.push(action);
        (action = this.opacity(target as Mesh)) && actions.push(action);
        return { actions };
    }

    private position(target: Object3D): ExecutionAction<Vector3> {
        const position = this.motion.position;
        if (position) {
            const value = (position as MotionValueExt).value ?? position as Vector3;
            return {
                time: this.time,
                easing: (position as MotionValueExt).easing ?? this.motion.easing ?? DEFAULT_EASING,
                start: target.position.clone(),
                end: this.isBy ? value.clone().add(target.position) : value,
                callback: (start, end, alpha): void => { target.position.lerpVectors(start, end, alpha) }
            };
        }
    }

    private scale(target: Object3D): ExecutionAction<Vector3> {
        const scale = this.motion.scale;
        if (scale) {
            const valueRaw = (scale as MotionValueExt<number | Vector3>).value ?? scale as (number | Vector3);
            const value = typeof (valueRaw) === "number" ? new Vector3(valueRaw, valueRaw, valueRaw) : valueRaw;
            return {
                time: this.time,
                easing: (scale as MotionValueExt<number | Vector3>).easing ?? this.motion.easing ?? DEFAULT_EASING,
                start: target.scale.clone(),
                end: this.isBy ? value.clone().add(target.scale) : value,
                callback: (start, end, alpha) => { target.scale.lerpVectors(start, end, alpha) }
            };
        }
    }

    private rotation(target: Object3D): ExecutionAction<Euler> {
        const rotation = this.motion.rotation;
        if (rotation) {
            const targetRotation = target.rotation;
            const value = ((rotation as MotionValueExt<Euler>).value ?? rotation as Euler).clone();
            return {
                time: this.time,
                easing: (rotation as MotionValueExt<Euler>).easing ?? this.motion.easing ?? DEFAULT_EASING,
                start: targetRotation.clone(),
                end: this.isBy ? new Euler(value.x + targetRotation.x, value.y + targetRotation.y, value.z + targetRotation.z) : value,
                callback: (start, end, alpha) => {
                    targetRotation.set( //TODO add lerp method for euler?
                        MathUtils.lerp(start.x, end.x, alpha),
                        MathUtils.lerp(start.y, end.y, alpha),
                        MathUtils.lerp(start.z, end.z, alpha)
                    );
                }
            };
        }
    }

    private opacity(target: Mesh): ExecutionAction<number> {
        const opacity = this.motion.opacity;
        if (opacity) {
            const value = (opacity as MotionValueExt<number>).value ?? opacity as number;
            return {
                time: this.time,
                easing: (opacity as MotionValueExt<number>).easing ?? this.motion.easing ?? DEFAULT_EASING,
                start: (target.material as Material).opacity,
                end: MathUtils.clamp(this.isBy ? value + (target.material as Material).opacity : value, 0, 1),
                callback: (start, end, alpha) => { (target.material as Material).opacity = MathUtils.lerp(start, end, alpha) }
            };
        }
    }

}
