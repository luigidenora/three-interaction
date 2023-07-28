import { Object3D } from "three";
import { ActionTween } from "./Actions";
import { Easing, Easings } from "./Easings";
import { Tween } from "./Tween";

type updateCallback<T> = (start?: T, end?: T, alpha?: number) => void;

interface ExecutionTween {
    tween: Tween;
    target: Object3D;
    actionIndex: number;
    currentBlock?: ExecutionBlock;
    history: ExecutionBlock[];
    reversed?: boolean;
    yoyo?: boolean;
    repeat: { [x: number]: number };
    parent?: ExecutionTween;
    root?: ExecutionTween;
}

interface ExecutionBlock {
    tweens?: Tween[];
    executionTweens?: ExecutionTween[];
    actions?: ExecutionAction[];
    elapsedTime: number;
    totalTime: number;
    reversed?: boolean;
    tweensStarted?: boolean;
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

    public static create(target: Object3D, tween: Tween, parent?: ExecutionTween, root?: ExecutionTween): ExecutionTween {
        const executionTween: ExecutionTween = {
            tween,
            target,
            actionIndex: -1,
            history: [],
            repeat: {},
            parent,
            root
        };

        this.getBlock(executionTween);
        this._executionTweens.push(executionTween);
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

    private static getBlock(executionTween: ExecutionTween): ExecutionBlock {
        const block = executionTween.reversed ? this.getPrevBlock(executionTween) : this.getNextBlock(executionTween);
        if (!executionTween.reversed && block) {
            executionTween.history.push(block);
        }
        executionTween.currentBlock = block;
        return block;
    }

    private static getPrevBlock(executionTween: ExecutionTween): ExecutionBlock {
        if (executionTween.actionIndex > 0) {
            const block = executionTween.history[--executionTween.actionIndex];
            block.elapsedTime = 0;
            block.reversed = !block.reversed;
            return block;
        }
    }

    private static getNextBlock(executionTween: ExecutionTween): ExecutionBlock {
        while (++executionTween.actionIndex < executionTween.tween.actions.length) {
            const action = executionTween.tween.actions[executionTween.actionIndex];
            if (action.isRepeat) {
                this.handleRepetition(executionTween, action.times);
            } else if (action.isYoyo) {
                const block = this.handleYoyo(executionTween, action.times);
                if (block) return block;
            } else if (action.isTween) {
                return this.handleTween(action as ActionTween);
            } else {
                return this.handleMotion(executionTween);
            }
        }
    }

    private static cloneBlock(block: ExecutionBlock): ExecutionBlock {
        return {
            elapsedTime: 0,
            totalTime: block.totalTime,
            actions: block.actions,
            tweens: block.tweens,
            executionTweens: this.cloneExecutionTweens(block.executionTweens),
            reversed: block.reversed //TODO cpaire se mettere true forzato
        }
    }

    private static cloneExecutionTweens(executionTweens: ExecutionTween[]): ExecutionTween[] {
        if (!executionTweens) return undefined;
        const ret: ExecutionTween[] = [];
        for (const exTween of executionTweens) {
            ret.push({
                history: this.cloneHistory(exTween.history),
                actionIndex: exTween.history.length,
                repeat: {},
                target: exTween.target,
                tween: exTween.tween,
                parent: exTween.parent,
                root: exTween.root,
                reversed: exTween.reversed
            });
        }
        return ret;
    }

    private static cloneHistory(history: ExecutionBlock[]): ExecutionBlock[] {
        const ret: ExecutionBlock[] = [];
        for (const block of history) {
            ret.push(this.cloneBlock(block));
        }
        return ret;
    }

    private static handleMotion(executionTween: ExecutionTween): ExecutionBlock {
        const descriptor = executionTween.tween.actions[executionTween.actionIndex].init(executionTween.target);
        return {
            actions: descriptor.actions,
            elapsedTime: 0,
            totalTime: Math.max(...descriptor.actions.map(x => x.time)),
        };
    }

    private static handleTween(action: ActionTween): ExecutionBlock {
        return {
            tweens: action.tweens,
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
            executionTween.actionIndex--;
        }
    }

    private static handleYoyo(executionTween: ExecutionTween, times: number): ExecutionBlock {
        const repeat = executionTween.repeat;
        repeat[executionTween.actionIndex] ??= 0;
        if (repeat[executionTween.actionIndex] <= times) {
            if (repeat[executionTween.actionIndex]++ === times) {
                executionTween.yoyo = false;
            } else {
                executionTween.yoyo = !executionTween.yoyo;
                if (executionTween.yoyo) {
                    // if (executionTween.root === undefined) debugger;
                    executionTween.actionIndex--;
                    const block = this.cloneBlock(executionTween.history[executionTween.history.length - 1]);
                    block.reversed = !block.reversed; //TODO mettere nella func?
                    return block;
                } else {
                    do {
                        executionTween.actionIndex--;
                    } while (executionTween.actionIndex > -1 && !executionTween.tween.actions[executionTween.actionIndex].hasActions);
                    executionTween.actionIndex--;
                }
            }
        }
    }

    public static update(delta: number): void {
        for (let i = this._executionTweens.length - 1; i >= 0; i--) {
            if (!this.execute(this._executionTweens[i], delta)) {
                this._executionTweens.splice(i, 1);
            }
        }
    }

    private static execute(executionTween: ExecutionTween, delta: number): boolean {
        do {
            delta = Math.min(this.executeBlock(executionTween, delta), this.getTweensDelta(executionTween.currentBlock));
        } while (delta >= 0 && this.getBlock(executionTween));
        return delta < 0;
    }

    private static executeBlock(executionTween: ExecutionTween, delta: number): number {
        const block = executionTween.currentBlock;
        block.elapsedTime += delta;
        this.executeActions(block);
        this.executeTweens(executionTween, block, delta);
        return block.elapsedTime - block.totalTime;
    }

    private static executeActions(block: ExecutionBlock): void {
        if (block.actions) {
            for (const action of block.actions) {
                const alpha = Math.min(1, block.elapsedTime / action.time);
                if (block.reversed) { //TODO opt
                    action.callback(action.end, action.start, action.easing ? this._easings[action.easing](alpha) : alpha);
                } else {
                    action.callback(action.start, action.end, action.easing ? this._easings[action.easing](alpha) : alpha);
                }
            }
        }
    }

    private static executeTweens(executionTween: ExecutionTween, block: ExecutionBlock, delta: number): void {
        if (block.tweens && !block.tweensStarted) {
            if (!block.executionTweens) {
                block.executionTweens = [];
                for (const tween of block.tweens) {
                    this.executeTween(executionTween, block, delta, tween);
                }
            } else {
                for (const newExecutionTween of block.executionTweens) {
                    this.executeReversedTween(newExecutionTween, delta);
                }
            }
            block.tweensStarted = true;
        }
    }

    private static executeTween(executionTween: ExecutionTween, block: ExecutionBlock, delta: number, tween: Tween): void {
        const newExecutionTween = this.create(executionTween.target, tween, executionTween, executionTween.root ?? executionTween);
        block.executionTweens.push(newExecutionTween);
        this.execute(newExecutionTween, delta);
    }

    private static executeReversedTween(newExecutionTween: ExecutionTween, delta: number): void {
        newExecutionTween.reversed = true;
        newExecutionTween.actionIndex = newExecutionTween.history.length;
        this._executionTweens.push(newExecutionTween);
        this.getBlock(newExecutionTween);
        this.execute(newExecutionTween, delta);
    }

    private static getTweensDelta(block: ExecutionBlock): number {
        let delta = Number.MAX_SAFE_INTEGER;
        if (block.executionTweens) {
            for (const exTween of block.executionTweens) {
                const lastBlock = exTween.reversed ? exTween.history[exTween.actionIndex] : exTween.history[exTween.history.length - 1];
                delta = Math.min(delta, lastBlock.elapsedTime - lastBlock.totalTime, this.getTweensDelta(lastBlock));
            }
        }
        return delta;
    }

}
