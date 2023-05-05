import { Euler, Vector3 } from "three";
/** For more info check https://easings.net */
export declare class Easings {
    easeInSine(x: number): number;
    easeOutSine(x: number): number;
    easeInOutSine(x: number): number;
    easeInQuad(x: number): number;
    easeOutQuad(x: number): number;
    easeInOutQuad(x: number): number;
    easeInCubic(x: number): number;
    easeOutCubic(x: number): number;
    easeInOutCubic(x: number): number;
    easeInQuart(x: number): number;
    easeOutQuart(x: number): number;
    easeInOutQuart(x: number): number;
    easeInQuint(x: number): number;
    easeOutQuint(x: number): number;
    easeInOutQuint(x: number): number;
    easeInExpo(x: number): number;
    easeOutExpo(x: number): number;
    easeInOutExpo(x: number): number;
    easeInCirc(x: number): number;
    easeOutCirc(x: number): number;
    easeInOutCirc(x: number): number;
    easeInBack(x: number): number;
    easeOutBack(x: number): number;
    easeInOutBack(x: number): number;
    easeInElastic(x: number): number;
    easeOutElastic(x: number): number;
    easeInOutElastic(x: number): number;
    easeInBounce(x: number): number;
    easeOutBounce(x: number): number;
    easeInOutBounce(x: number): number;
}
type Easing = keyof Easings | ((x: number) => number);
export interface Action {
    position?: Vector3 | {
        value: Vector3;
        easing: Easing;
    };
    scale?: number | Vector3 | {
        value: number | Vector3;
        easing: Easing;
    };
    rotation?: Euler | {
        value: Euler;
        easing: Easing;
    };
    easing?: Easing;
}
export declare class Tweening {
    to(time: number, config: Action): this;
    by(): this;
    call(callback: () => void): this;
    repeat(times: number, config: Tweening): this;
    repeatForever(): this;
    delay(time: number): this;
    start(): void;
    clone(): Tweening;
    then(tween: Tweening): this;
}
export {};
