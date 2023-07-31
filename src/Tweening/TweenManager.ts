import { ActionTween } from "./Actions";
import { Easing, Easings } from "./Easings";
import { Tween } from "./Tween";

type updateCallback<T> = (start?: T, end?: T, alpha?: number) => void;

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

/** @internal */
export interface ExecutionAction<T = any> {
    time: number;
    callback: updateCallback<T>;
    easing?: Easing;
    start?: T;
    end?: T;
}

const easings = new Easings();

export class ExecutionTween {
    /** @internal */ public tween: Tween;
    /** @internal */ public target: any;
    /** @internal */ public actionIndex = -1;
    /** @internal */ public currentBlock?: ExecutionBlock;
    /** @internal */ public history: ExecutionBlock[] = [];
    /** @internal */ public reversed?: boolean;
    /** @internal */ public originallyReversed?: boolean;
    /** @internal */ public repeat?: boolean;
    /** @internal */ public ripetitions: { [x: number]: number } = {};
    public timeScale = 1

    constructor(target: any, tween: Tween) {
        this.target = target;
        this.tween = tween;
    }

    public stop(): void {
        // TweenManager.stop(this._target, this);
    }

    public pause(): void {
        // TweenManager.stop(this._target, this);
    }

    public resume(): void {
        // TweenManager.stop(this._target, this);
    }

    public complete(): void {
        // 
    }

    public revert(): void {
        // 
    }

    /** @internal */
    public getBlock(): ExecutionBlock {
        const block = this.reversed ? this.getPrevBlock() : (this.repeat ? this.getRepeatBlock() : this.getNextBlock());
        if (!this.repeat && !this.reversed && block) {
            this.history.push(block);
        }
        this.currentBlock = block;
        return block;
    }

    private getPrevBlock(): ExecutionBlock {
        if (this.actionIndex > 0) {
            const block = this.history[--this.actionIndex];
            block.reversed = !block.originallyReversed;
            block.elapsedTime = 0;
            block.tweensStarted = false;
            return block;
        }
    }

    private getRepeatBlock(): ExecutionBlock {
        if (this.actionIndex < this.tween.actions.length) {
            const block = this.history[++this.actionIndex];
            block.reversed = block.originallyReversed;
            block.elapsedTime = 0;
            block.tweensStarted = false;
            return block;
        }
    }

    private getNextBlock(): ExecutionBlock {
        while (++this.actionIndex < this.tween.actions.length) {
            const action = this.tween.actions[this.actionIndex];
            if (action.isRepeat) {
                this.handleRepetition(action.times);
            } else if (action.isYoyo) {
                const block = this.handleYoyo(action.times);
                if (block) return block;
            } else if (action.isTween) {
                return this.handleTween(action as ActionTween);
            } else {
                return this.handleMotion();
            }
        }
    }

    private cloneBlock(block: ExecutionBlock): ExecutionBlock {
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

    private cloneExecutionTweens(runningTweens: ExecutionTween[]): ExecutionTween[] {
        if (!runningTweens) return undefined;
        const ret: ExecutionTween[] = [];
        for (const exTween of runningTweens) {
            const runningTween = new ExecutionTween(exTween.target, exTween.tween);
            runningTween.history = exTween.history;
            runningTween.actionIndex = !exTween.reversed ? exTween.history.length : -1;
            runningTween.originallyReversed = !exTween.reversed;
            runningTween.repeat = exTween.reversed
            ret.push(runningTween);
        }
        return ret;
    }

    private handleMotion(): ExecutionBlock {
        const descriptor = this.tween.actions[this.actionIndex].init(this.target);
        return {
            actions: descriptor.actions,
            elapsedTime: 0,
            totalTime: Math.max(...descriptor.actions.map(x => x.time)),
        };
    }

    private handleTween(action: ActionTween): ExecutionBlock {
        return {
            tweens: action.tweens,
            elapsedTime: 0,
            totalTime: 0
        };
    }

    private handleRepetition(times: number): void {
        const repeat = this.ripetitions;
        repeat[this.actionIndex] ??= 0;
        if (repeat[this.actionIndex] < times) {
            repeat[this.actionIndex]++;
            do {
                this.actionIndex--;
            } while (this.actionIndex > -1 && !this.tween.actions[this.actionIndex].hasActions);
            this.actionIndex--;
        }
    }

    private handleYoyo(times: number): ExecutionBlock {
        const repeat = this.ripetitions;
        repeat[this.actionIndex] ??= 0;
        if (repeat[this.actionIndex] < times) {
            repeat[this.actionIndex]++;
            if (repeat[this.actionIndex--] < 3) {
                return this.cloneBlock(this.history[this.history.length - 1]);
            }
            const block = this.history[this.history.length - 2];
            block.elapsedTime = 0;
            return block;
        }
    }

    /** @internal */
    public execute(delta: number): boolean {
        do {
            delta = Math.min(this.executeBlock(delta), this.getTweensDelta(this.currentBlock));
        } while (delta >= 0 && this.getBlock());
        return delta < 0;
    }

    private executeBlock(delta: number): number {
        const block = this.currentBlock;
        block.elapsedTime += delta;
        this.executeActions(block);
        this.executeTweens(this, block, delta);
        return block.elapsedTime - block.totalTime;
    }

    private executeActions(block: ExecutionBlock): void {
        if (block.actions) {
            for (const action of block.actions) {
                const alpha = block.reversed ? 1 - Math.min(1, block.elapsedTime / action.time) : Math.min(1, block.elapsedTime / action.time);
                action.callback(action.start, action.end, easings[action.easing](alpha));
            }
        }
    }

    private executeTweens(executionTween: ExecutionTween, block: ExecutionBlock, delta: number): void {
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

    private executeTween(executionTween: ExecutionTween, block: ExecutionBlock, delta: number, tween: Tween): void {
        const newExecutionTween = TweenManager.createChildren(executionTween.target, tween);
        block.runningTweens.push(newExecutionTween);
        newExecutionTween.execute(delta);
    }

    private executeExistingTween(runningTween: ExecutionTween, delta: number, reversed: boolean): void {
        runningTween.reversed = reversed ? !runningTween.originallyReversed : runningTween.originallyReversed;
        runningTween.repeat = !runningTween.reversed;
        runningTween.actionIndex = runningTween.reversed ? runningTween.history.length : -1;
        TweenManager.addChildren(runningTween);
        runningTween.getBlock();
        runningTween.execute(delta);
    }

    /** @internal */
    public getTweensDelta(block: ExecutionBlock): number {
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

/** @internal */
export class TweenManager {
    private static _executionTweens: ExecutionTween[] = [];
    private static _executionTweensChildren: ExecutionTween[] = [];

    public static create(target: any, tween: Tween): ExecutionTween {
        const executionTween = new ExecutionTween(target, tween);
        executionTween.getBlock();
        this._executionTweens.push(executionTween);
        return executionTween;
    }

    public static createChildren(target: any, tween: Tween): ExecutionTween {
        const executionTween = new ExecutionTween(target, tween);
        executionTween.getBlock();
        this._executionTweensChildren.push(executionTween);
        return executionTween;
    }

    public static addChildren(runningTween: ExecutionTween): void {
        this._executionTweensChildren.push(runningTween);
    }

    // public static stop2(executionTween: ExecutionTween, target: any): void {
    //     const index = this._executionTweens.findIndex(x => x.target === target && (x.root ?? x) === executionTween);
    //     if (index === -1) return;
    //     this._executionTweens.splice(index, 1);
    // }

    public static update(delta: number): void {
        for (let i = this._executionTweensChildren.length - 1; i >= 0; i--) {
            if (!this._executionTweensChildren[i].execute(delta)) {
                this._executionTweensChildren.splice(i, 1);
            }
        }

        for (let i = this._executionTweens.length - 1; i >= 0; i--) {
            if (!this._executionTweens[i].execute(delta)) {
                this._executionTweens.splice(i, 1);
            }
        }
    }

}
