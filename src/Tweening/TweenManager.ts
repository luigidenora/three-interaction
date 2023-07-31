import { ActionTween } from "./Actions";
import { Easing, Easings } from "./Easings";
import { Tween } from "./Tween";

type updateCallback<T> = (start?: T, end?: T, alpha?: number) => void;

interface ExecutionTween {
    tween: Tween;
    target: any;
    actionIndex: number;
    currentBlock?: ExecutionBlock;
    history: ExecutionBlock[];
    reversed?: boolean;
    originallyReversed?: boolean;
    repeat?: boolean;
    ripetitions: { [x: number]: number };
}

interface ExecutionBlock {
    tweens?: Tween[];
    runningTweens?: ExecutionTween[];
    actions?: ExecutionAction[];
    elapsedTime: number;
    totalTime: number;
    reversed?: boolean;
    originallyReversed?: boolean;
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
    private static _executionTweensChildren: ExecutionTween[] = [];
    private static _easings = new Easings();

    public static create(target: any, tween: Tween): ExecutionTween {
        const executionTween: ExecutionTween = {
            tween,
            target,
            actionIndex: -1,
            history: [],
            ripetitions: {},
        };
        this.getBlock(executionTween);
        this._executionTweens.push(executionTween);
        return executionTween;
    }

    private static createChildren(target: any, tween: Tween): ExecutionTween {
        const executionTween: ExecutionTween = {
            tween,
            target,
            actionIndex: -1,
            history: [],
            ripetitions: {},
        };
        this.getBlock(executionTween);
        this._executionTweensChildren.push(executionTween);
        return executionTween;
    }

    // public static stop(tween: Tween, target: any): void {
    //     const index = this._executionTweens.findIndex(x => x.target === target && (x.root?.tween ?? x.tween) === tween);
    //     if (index === -1) return;
    //     this._executionTweens.splice(index, 1);
    // }

    // public static stop2(executionTween: ExecutionTween, target: any): void {
    //     const index = this._executionTweens.findIndex(x => x.target === target && (x.root ?? x) === executionTween);
    //     if (index === -1) return;
    //     this._executionTweens.splice(index, 1);
    // }

    private static getBlock(exTween: ExecutionTween): ExecutionBlock {
        const block = exTween.reversed ? this.getPrevBlock(exTween) : (exTween.repeat ? this.getRepeatBlock(exTween) : this.getNextBlock(exTween));
        if (!exTween.repeat && !exTween.reversed && block) {
            exTween.history.push(block);
        }
        exTween.currentBlock = block;
        return block;
    }

    private static getPrevBlock(executionTween: ExecutionTween): ExecutionBlock {
        if (executionTween.actionIndex > 0) {
            const block = executionTween.history[--executionTween.actionIndex];
            block.reversed = !block.originallyReversed;
            block.elapsedTime = 0;
            block.tweensStarted = false;
            return block;
        }
    }

    private static getRepeatBlock(executionTween: ExecutionTween): ExecutionBlock {
        if (executionTween.actionIndex < executionTween.tween.actions.length) {
            const block = executionTween.history[++executionTween.actionIndex];
            block.reversed = block.originallyReversed;
            block.elapsedTime = 0;
            block.tweensStarted = false;
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
            reversed: !block.reversed,
            originallyReversed: !block.reversed,
            actions: block.actions,
            tweens: block.tweens,
            runningTweens: this.cloneExecutionTweens(block.runningTweens)
        }
    }

    private static cloneExecutionTweens(executionTweens: ExecutionTween[]): ExecutionTween[] {
        if (!executionTweens) return undefined;
        const ret: ExecutionTween[] = [];
        for (const exTween of executionTweens) {
            ret.push({
                history: exTween.history,
                actionIndex: !exTween.reversed ? exTween.history.length : -1,
                ripetitions: {},
                target: exTween.target,
                tween: exTween.tween,
                originallyReversed: !exTween.reversed,
                repeat: exTween.reversed
            });
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
        const repeat = executionTween.ripetitions;
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
        const repeat = executionTween.ripetitions;
        repeat[executionTween.actionIndex] ??= 0;
        if (repeat[executionTween.actionIndex] < times) {
            repeat[executionTween.actionIndex]++;
            if (repeat[executionTween.actionIndex--] < 3) {
                return this.cloneBlock(executionTween.history[executionTween.history.length - 1]);
            }
            const block = executionTween.history[executionTween.history.length - 2];
            block.elapsedTime = 0;
            return block;
        }
    }

    public static update(delta: number): void {
        for (let i = this._executionTweensChildren.length - 1; i >= 0; i--) {
            if (!this.execute(this._executionTweensChildren[i], delta)) {
                this._executionTweensChildren.splice(i, 1);
            }
        }

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
                const alpha = block.reversed ? 1 - Math.min(1, block.elapsedTime / action.time) : Math.min(1, block.elapsedTime / action.time);
                action.callback(action.start, action.end, this._easings[action.easing](alpha));
            }
        }
    }

    private static executeTweens(executionTween: ExecutionTween, block: ExecutionBlock, delta: number): void {
        if (block.tweens && !block.tweensStarted) {
            if (!block.runningTweens) {
                block.runningTweens = [];
                for (const tween of block.tweens) {
                    this.executeTween(executionTween, block, delta, tween);
                }
            } else {
                for (const newExecutionTween of block.runningTweens) {
                    this.executeExistingTween(newExecutionTween, delta, executionTween.reversed);
                }
            }
            block.tweensStarted = true;
        }
    }

    private static executeTween(executionTween: ExecutionTween, block: ExecutionBlock, delta: number, tween: Tween): void {
        const newExecutionTween = this.createChildren(executionTween.target, tween);
        block.runningTweens.push(newExecutionTween);
        this.execute(newExecutionTween, delta);
    }

    private static executeExistingTween(newExecutionTween: ExecutionTween, delta: number, reversed: boolean): void {
        newExecutionTween.reversed = reversed ? !newExecutionTween.originallyReversed : newExecutionTween.originallyReversed;
        newExecutionTween.repeat = !newExecutionTween.reversed;
        newExecutionTween.actionIndex = newExecutionTween.reversed ? newExecutionTween.history.length : -1;
        this._executionTweensChildren.push(newExecutionTween);
        this.getBlock(newExecutionTween);
        this.execute(newExecutionTween, delta);
    }

    private static getTweensDelta(block: ExecutionBlock): number {
        let delta = Number.MAX_SAFE_INTEGER;
        if (block.runningTweens) {
            for (const exTween of block.runningTweens) {
                const indexLastBlock = (exTween.repeat || exTween.reversed) ? exTween.actionIndex : exTween.history.length - 1;
                const lastBlock = exTween.history[indexLastBlock];
                delta = Math.min(delta, lastBlock.elapsedTime - lastBlock.totalTime, this.getTweensDelta(lastBlock));
            }
        }
        return delta;
    }

}
