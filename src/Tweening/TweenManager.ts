import { Object3D } from "three";
import { Easing, Easings } from "./Easings";
import { Tween } from "./Tween";
import { ActionDescriptor } from "./Actions";

type updateCallback<T> = (start?: T, end?: T, alpha?: number) => void;

interface ExecutionTween {
    tween: Tween;
    target: Object3D;
    blocks: ExecutionBlock[];
    actionIndex?: number;
    blockIndex: number;
    reversed: boolean;
    repeat: { [x: number]: number };
    parent?: Tween;
    root?: Tween
}

interface ExecutionBlock {
    actions: ExecutionAction[];
    elapsedTime: number;
    totalTime: number;
}

export interface ExecutionAction<T = any> {
    time: number;
    callback: updateCallback<T>;
    easing?: Easing;
    start?: T;
    end?: T;
}

export class TweenManager {
    private static _executionTweens: ExecutionTween[] = [];
    private static _easings = new Easings();

    public static start(target: Object3D, tween: Tween, parent?: Tween, root?: Tween): void {
        const executionTween: ExecutionTween = {
            tween,
            target,
            blocks: [],
            actionIndex: 0,
            blockIndex: 0,
            reversed: false,
            repeat: {},
            parent,
            root
        };

        const block = this.getNextBlock(target, executionTween);
        if (block !== undefined) {
            executionTween.blocks[executionTween.blockIndex] = block;
            this._executionTweens.push(executionTween);
        }
    }

    private static getNextBlock(target: Object3D, executionTween: ExecutionTween): ExecutionBlock {
        const tween = executionTween.tween;
        while (executionTween.actionIndex < tween.actions.length) {
            console.log(executionTween.actionIndex);
            const descriptor = tween.actions[executionTween.actionIndex].init(target);
            if (descriptor.actions?.length > 0) {

                return {
                    actions: descriptor.actions,
                    elapsedTime: 0,
                    totalTime: Math.max(...descriptor.actions.map(x => x.time)),
                };

            } else if (descriptor.tweens) {

            } else if (descriptor.repeat > 0) {
                if (descriptor.yoyo) {
                    // this.handleYoyo(executionTween, descriptor)
                    // this.handleRepetition(executionTween, descriptor);
                    // executionTween.reversed = !executionTween.reversed;
                } else {
                    this.handleRepetition(executionTween, descriptor);
                }
            }
        }
    }

    private static handleRepetition(executionTween: ExecutionTween, descriptor: ActionDescriptor): void {
        const repeat = executionTween.repeat;
        repeat[executionTween.actionIndex] ??= 0;
        if (repeat[executionTween.actionIndex] < descriptor.repeat) {
            repeat[executionTween.actionIndex]++;
            while (--executionTween.actionIndex > -1) {
                if (executionTween.tween.actions[executionTween.actionIndex].hasActions) break;
            }
        } else {
            executionTween.actionIndex++;
        }
    }

    public static update(delta: number): void {
        let i = 0;
        while (i < this._executionTweens.length) {
            const executionTween = this._executionTweens[i];
            this.executeBlock(executionTween, delta);
            if (executionTween.blocks[executionTween.blockIndex] === undefined) {
                this._executionTweens.splice(i, 1);
                console.log("finito");
            } else {
                i++;
            }
        }
    }

    private static executeBlock(executionTween: ExecutionTween, delta: number): void {
        let block = executionTween.blocks[executionTween.blockIndex];
        block.elapsedTime += delta;

        for (const action of block.actions) {
            const alpha = Math.min(1, block.elapsedTime / action.time);
            action.callback(action.start, action.end, action.easing ? this._easings[action.easing](alpha) : alpha);
        }

        if (block.elapsedTime >= block.totalTime) {
            delta = block.elapsedTime - block.totalTime;
            executionTween.actionIndex++;
            block = this.getNextBlock(executionTween.target, executionTween);
            executionTween.blocks[executionTween.blockIndex] = block;
            if (block !== undefined) {
                this.executeBlock(executionTween, delta); //todo remove recursion?
            }
        }
    }

}
