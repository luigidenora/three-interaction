import { Object3D } from "three";
import { Easing, Easings } from "./Easings";
import { Tween } from "./Tween";
import { ActionDescriptor, ActionRepeat, ActionTween, ActionYoyo, IAction } from "./Actions";

type updateCallback<T> = (start?: T, end?: T, alpha?: number) => void;

interface ExecutionTween {
    tween: Tween;
    target: Object3D;
    blocks: ExecutionBlock[];
    actionIndex: number;
    blockIndex: number;
    reversed: boolean;
    repeat: { [x: number]: number };
    parent?: ExecutionTween;
    root?: ExecutionTween;
}

interface ExecutionBlock {
    tween?: Tween;
    actions?: ExecutionAction[];
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

    public static start(target: Object3D, tween: Tween, parent?: ExecutionTween, root?: ExecutionTween): ExecutionTween {
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

        const block = this.getNextBlock(executionTween);
        if (!block) return undefined;
        executionTween.blocks[executionTween.blockIndex] = block;
        if (!parent) {
            this._executionTweens.push(executionTween);
        }
        return executionTween;
    }

    public static stop(tween: Tween, target: Object3D): void {
        const index = this._executionTweens.findIndex(x => x.target === target && (x.root?.tween ?? x.tween) === tween);
        if (index === -1) return;
        this._executionTweens.splice(index, 1);
    }

    public static stop2(executionTween: ExecutionTween, target: Object3D): void {
        const index = this._executionTweens.findIndex(x => x.target === target && (x.root ?? x) === executionTween);
        if (index === -1) return;
        this._executionTweens.splice(index, 1);
    }

    private static getNextBlock(executionTween: ExecutionTween): ExecutionBlock {
        const tween = executionTween.tween;

        while (executionTween.actionIndex < tween.actions.length) {

            if (executionTween.reversed && executionTween.blockIndex > -1) {
                const block = executionTween.blocks[executionTween.blockIndex--];
                block.elapsedTime = 0;
                //invert start and end TODO
                return block;
            }
            
            const action = tween.actions[executionTween.actionIndex];
            if (action.hasActions) {
                if (action.isTween) {
                    return this.handleTween(action as ActionTween);
                }
                return this.handleMotion(executionTween);
            } else {
                if (action.isYoyo) {
                    this.handleYoyo(executionTween, action.times);
                } else {
                    this.handleRepetition(executionTween, action.times);
                }
            }
        }
    }

    private static handleMotion(executionTween: ExecutionTween): ExecutionBlock {
        const descriptor = executionTween.tween.actions[executionTween.actionIndex].init(executionTween.target);
        return {
            actions: descriptor.actions,
            elapsedTime: 0,
            totalTime: Math.max(...descriptor.actions.map(x => x.time))
        };
    }

    private static handleTween(action: ActionTween): ExecutionBlock {
        return {
            tween: action.tweens[0], //TODO fix usando array
            elapsedTime: 0,
            totalTime: 0
        };
    }

    private static handleRepetition(executionTween: ExecutionTween, times: number): void {
        const repeat = executionTween.repeat;
        repeat[executionTween.actionIndex] ??= 0;
        if (repeat[executionTween.actionIndex] < times) {
            repeat[executionTween.actionIndex]++;
            do {
                executionTween.actionIndex--;
            } while (executionTween.actionIndex > -1 && !executionTween.tween.actions[executionTween.actionIndex].hasActions);
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
                do {
                    executionTween.actionIndex--;
                } while (executionTween.actionIndex > -1 && !executionTween.tween.actions[executionTween.actionIndex].hasActions);
            }
        } else {
            executionTween.actionIndex++;
        }
    }

    public static update(delta: number): void {
        let i = 0;
        while (i < this._executionTweens.length) {
            this.executeBlock(this._executionTweens[i], delta, i); // (this._executionTweens[i] can be changed here, if tween
            if (this._executionTweens[i].blocks[this._executionTweens[i].blockIndex] === undefined) {
                this._executionTweens.splice(i, 1);
            } else {
                i++;
            }
        }
    }

    private static executeBlock(executionTween: ExecutionTween, delta: number, index: number): void {
        let block = executionTween.blocks[executionTween.blockIndex];
        block.elapsedTime += delta;

        if (block.actions) {
            for (const action of block.actions) {
                const alpha = Math.min(1, block.elapsedTime / action.time);
                if (executionTween.reversed) {
                    action.callback(action.end, action.start, action.easing ? this._easings[action.easing](alpha) : alpha);
                } else {
                    action.callback(action.start, action.end, action.easing ? this._easings[action.easing](alpha) : alpha);
                }
            }
        } else {
            const newExecutionTween = this.start(executionTween.target, block.tween, executionTween, executionTween?.root ?? executionTween);
            this._executionTweens[index] = newExecutionTween;
            this.executeBlock(newExecutionTween, delta, index);
            return;
        }

        if (block.elapsedTime >= block.totalTime) {
            delta = block.elapsedTime - block.totalTime;
            executionTween.actionIndex++;
            block = this.getNextBlock(executionTween);
            executionTween.blocks[executionTween.blockIndex] = block;
            if (block) {
                this.executeBlock(executionTween, delta, index);
            } else {
                executionTween = executionTween.parent;
                if (executionTween) {
                    this._executionTweens[index] = executionTween;
                    executionTween.actionIndex++; //aumentare index direttamente in questa func
                    block = this.getNextBlock(executionTween); //codice ripetuto
                    executionTween.blocks[executionTween.blockIndex] = block;
                    this.executeBlock(executionTween, delta, index);
                }
            }
        }
    }

}
