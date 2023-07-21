import { Object3D } from "three";
import { Easing, Easings } from "./Easings";
import { Tween } from "./Tween";
import { ActionDescriptor, ActionRepeat, ActionYoyo } from "./Actions";

type updateCallback<T> = (start?: T, end?: T, alpha?: number) => void;

interface ExecutionTween {
    tween: Tween;
    target: Object3D;
    blocks: ExecutionBlock[];
    currentBlock?: ExecutionBlock;
    actionIndex: number;
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
            executionTween.currentBlock = executionTween.blocks[executionTween.blockIndex] = block;
            this._executionTweens.push(executionTween);
        }
    }

    private static getNextBlock(target: Object3D, executionTween: ExecutionTween): ExecutionBlock {
        const tween = executionTween.tween;

        while (executionTween.actionIndex < tween.actions.length) {
            if (executionTween.reversed) {
                while (executionTween.blockIndex > -1) {
                    const block = executionTween.blocks[executionTween.blockIndex--];
                    block.elapsedTime = 0;
                    return block;
                }
            }

            const action = tween.actions[executionTween.actionIndex];
            if (action.hasActions) {
                const descriptor = tween.actions[executionTween.actionIndex].init(target);
                if (descriptor.actions?.length > 0) {
                    return this.handleMotion(descriptor);
                } else {
                    //tween
                }
            } else {
                if (action.isYoyo) {
                    this.handleYoyo(executionTween, action.times);
                } else {
                    this.handleRepetition(executionTween, action.times);
                }
            }
        }
    }

    private static handleMotion(descriptor: ActionDescriptor): ExecutionBlock {
        return {
            actions: descriptor.actions,
            elapsedTime: 0,
            totalTime: Math.max(...descriptor.actions.map(x => x.time)),
        };
    }

    private static handleRepetition(executionTween: ExecutionTween, times: number): void {
        const repeat = executionTween.repeat;
        repeat[executionTween.actionIndex] ??= 0;
        if (repeat[executionTween.actionIndex] < times) {
            repeat[executionTween.actionIndex]++;
            while (--executionTween.actionIndex > -1) { //todo migliorare sto while
                if (executionTween.tween.actions[executionTween.actionIndex].hasActions) break;
            }
        } else {
            executionTween.actionIndex++;
        }
    }

    private static handleYoyo(executionTween: ExecutionTween, times: number): void {
        const repeat = executionTween.repeat;
        repeat[executionTween.actionIndex] ??= 0;
        if (repeat[executionTween.actionIndex] <= times) {
            if (repeat[executionTween.actionIndex]++ === times) {
                executionTween.actionIndex++;
                executionTween.reversed = false;
            } else {
                executionTween.reversed = !executionTween.reversed;
                executionTween.blockIndex = executionTween.blocks.length - 1;
                while (--executionTween.actionIndex > -1) {
                    if (executionTween.tween.actions[executionTween.actionIndex].hasActions) break;
                }
            }
        } else {
            executionTween.actionIndex++;
        }
    }

    public static update(delta: number): void {
        let i = 0;
        while (i < this._executionTweens.length) {
            const executionTween = this._executionTweens[i];
            this.executeBlock(executionTween, delta, i);
            if (executionTween.blocks[executionTween.blockIndex] === undefined) {
                this._executionTweens.splice(i, 1);
            } else {
                i++;
            }
        }
    }

    private static executeBlock(executionTween: ExecutionTween, delta: number, index: number): void {
        let block = executionTween.blocks[executionTween.blockIndex];
        block.elapsedTime += delta;

        for (const action of block.actions) {
            const alpha = Math.min(1, block.elapsedTime / action.time);
            if (executionTween.reversed) {
                action.callback(action.end, action.start, action.easing ? this._easings[action.easing](alpha) : alpha);
            } else {
                action.callback(action.start, action.end, action.easing ? this._easings[action.easing](alpha) : alpha);
            }
        }

        if (block.elapsedTime >= block.totalTime) {
            delta = block.elapsedTime - block.totalTime;
            executionTween.actionIndex++;
            block = this.getNextBlock(executionTween.target, executionTween);
            executionTween.blocks[executionTween.blockIndex] = block;
            if (block !== undefined) {
                this.executeBlock(executionTween, delta);
            }
        }
    }

}
