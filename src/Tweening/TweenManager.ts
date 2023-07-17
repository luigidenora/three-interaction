import { Object3D } from "three";
import { Easing, Easings } from "./Easings";
import { Tween } from "./Tween";

type updateCallback<T> = (start?: T, end?: T, alpha?: number) => void;

interface ExecutionTween {
    tween: Tween;
    target: Object3D;
    blocks: ExecutionBlock[];
    actionIndex: number;
    blockIndex: number;
    reversed: boolean;
    repeat: { [x: number]: number };
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

    public static start(target: Object3D, tween: Tween): void {
        const executionTween: ExecutionTween = {
            tween,
            target,
            blocks: [],
            actionIndex: 0,
            blockIndex: 0,
            reversed: false,
            repeat: {}
        };
        const block = this.getNextBlock(target, executionTween);
        if (block !== undefined) {
            executionTween.blocks.push(block);
            this._executionTweens.push(executionTween);
        }
    }

    private static getNextBlock(target: Object3D, executionTween: ExecutionTween): ExecutionBlock {
        const tween = executionTween.tween;
        for (let i = executionTween.actionIndex; i < tween._actions.length; i++) {
            const descriptor = tween._actions[i].init(target);
            if (descriptor.actions?.length > 0) {
                executionTween.actionIndex = i;
                return {
                    actions: descriptor.actions,
                    elapsedTime: 0,
                    totalTime: Math.max(...descriptor.actions.map(x => x.time)),
                };
            } else {
                if (descriptor.repeat > 0) {

                    const repeat = executionTween.repeat;
                    repeat[i] ??= -1;
                    repeat[i]++;

                    // if (descriptor.repeat === Infinity)

                    if (repeat[i] !== descriptor.repeat) {
                        executionTween.actionIndex = 0;
                        i = -1;
                    } else {
                        repeat[i] = undefined;
                    }

                } else if (descriptor.reverse === true) {
                    //reverse
                }
            }
        }
    }

    public static update(delta: number): void {
        let i = 0;
        while (i < this._executionTweens.length) {
            const executionTween = this._executionTweens[i];
            this.executeBlock(executionTween, delta);
            if (executionTween.blocks[executionTween.blockIndex] === undefined) {
                this._executionTweens.splice(i, 1);
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
            executionTween.actionIndex++; //capire
            block = this.getNextBlock(executionTween.target, executionTween);
            executionTween.blockIndex++; //capire
            executionTween.blocks.push(block);
            if (block !== undefined) {
                this.executeBlock(executionTween, delta); //todo remove recursion
            }
        }
    }

}
