import { ActionTween } from "./Actions";
import { Easing, Easings } from "./Easings";
import { Tween } from "./Tween";
import { TweenManager } from "./TweenManager";

type updateCallback<T> = (start?: T, end?: T, alpha?: number) => void;

interface RunningBlock {
    tweens?: Tween[];
    runningTweens?: RunningTween[];
    actions?: RunningAction[];
    elapsedTime: number;
    totalTime: number;
    reversed?: boolean;
    originallyReversed?: boolean;
    tweensStarted?: boolean;
}

/** @internal */
export interface RunningAction<T = any> {
    time: number;
    callback: updateCallback<T>;
    easing?: Easing;
    start?: T;
    end?: T;
}

const easings = new Easings();

export class RunningTween {
    /** @internal */ public root: RunningTween;
    /** @internal */ public tween: Tween;
    /** @internal */ public target: any;
    /** @internal */ public actionIndex = -1;
    /** @internal */ public currentBlock?: RunningBlock;
    /** @internal */ public history: RunningBlock[] = [];
    /** @internal */ public reversed?: boolean;
    /** @internal */ public originallyReversed?: boolean;
    /** @internal */ public repeat?: boolean;
    /** @internal */ public ripetitions: { [x: number]: number } = {};
    /** @internal */ public _finished = false;
    public paused = false;
    public timeScale = 1; //TODO implement

    public get finished(): boolean { return this._finished }

    constructor(target: any, tween: Tween) {
        this.target = target;
        this.tween = tween;
    }

    public pause(): void {
        this.paused = true;
    }

    public resume(): void {
        this.paused = false;
    }

    public stop(): void {
        TweenManager.stop(this);
    }

    public complete(): void {
        TweenManager.complete(this);
    }

    //TODO
    public revert(): void {
        console.error("Rever method not implemented yet.");
    }

    /** @internal */
    public getBlock(): RunningBlock {
        const block = this.getCurrentBlock();
        if (!this.repeat && !this.reversed && block) {
            this.history.push(block);
        }
        this.currentBlock = block;
        return block;
    }

    /** @internal */
    private getCurrentBlock(): RunningBlock {
        if (this.reversed) return this.getPrevBlock();
        return this.repeat ? this.getRepeatBlock() : this.getNextBlock();
    }

    /** @internal */
    private getPrevBlock(): RunningBlock {
        if (this.actionIndex > 0) {
            const block = this.history[--this.actionIndex];
            block.reversed = !block.originallyReversed;
            block.elapsedTime = 0;
            block.tweensStarted = false;
            return block;
        }
    }

    /** @internal */
    private getRepeatBlock(): RunningBlock {
        if (this.actionIndex < this.history.length - 1) {
            const block = this.history[++this.actionIndex];
            block.reversed = block.originallyReversed;
            block.elapsedTime = 0;
            block.tweensStarted = false;
            return block;
        }
    }

    /** @internal */
    private getNextBlock(): RunningBlock {
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

    /** @internal */
    private cloneBlock(block: RunningBlock): RunningBlock {
        return {
            elapsedTime: 0,
            totalTime: block.totalTime,
            reversed: !block.reversed,
            originallyReversed: !block.reversed,
            actions: block.actions,
            tweens: block.tweens,
            runningTweens: this.cloneRunningTweens(block.runningTweens)
        }
    }

    /** @internal */
    private cloneRunningTweens(runningTweens: RunningTween[]): RunningTween[] {
        if (!runningTweens) return undefined;
        const ret: RunningTween[] = [];
        for (const runningTween of runningTweens) {
            const runningCloned = new RunningTween(runningTween.target, runningTween.tween);
            runningCloned.root = runningTween.root;
            runningCloned.history = runningTween.history;
            runningCloned.actionIndex = !runningTween.reversed ? runningTween.history.length : -1;
            runningCloned.originallyReversed = !runningTween.reversed;
            runningCloned.repeat = runningTween.reversed
            ret.push(runningCloned);
        }
        return ret;
    }

    /** @internal */
    private handleMotion(): RunningBlock {
        const descriptor = this.tween.actions[this.actionIndex].init(this.target);
        return {
            actions: descriptor.actions,
            elapsedTime: 0,
            totalTime: Math.max(...descriptor.actions.map(x => x.time)),
        };
    }

    /** @internal */
    private handleTween(action: ActionTween): RunningBlock {
        return {
            tweens: action.tweens,
            elapsedTime: 0,
            totalTime: 0
        };
    }

    /** @internal */
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

    /** @internal */
    private handleYoyo(times: number): RunningBlock {
        const repeat = this.ripetitions;
        repeat[this.actionIndex] ??= 0;
        if (repeat[this.actionIndex] < times) {
            repeat[this.actionIndex]++;
            if (repeat[this.actionIndex--] < 3) {
                return this.cloneBlock(this.history[this.history.length - 1]);
            }
            const block = this.history[this.history.length - 2];
            block.elapsedTime = 0;
            block.tweensStarted = false;
            return block;
        }
    }

    /** @internal */
    public execute(delta: number): boolean {
        if (this.paused) return true;
        do {
            delta = Math.min(this.executeBlock(delta), this.getTweensDelta(this.currentBlock));
        } while (delta >= 0 && this.getBlock());
        return delta < 0;
    }

    /** @internal */
    private executeBlock(delta: number): number {
        const block = this.currentBlock;
        block.elapsedTime += delta;
        this.executeActions(block);
        this.executeTweens(block, delta);
        return block.elapsedTime - block.totalTime;
    }

    /** @internal */
    private executeActions(block: RunningBlock): void {
        if (block.actions) {
            for (const action of block.actions) {
                const alpha = block.reversed ? 1 - Math.min(1, block.elapsedTime / action.time) : Math.min(1, block.elapsedTime / action.time);
                action.callback(action.start, action.end, easings[action.easing] ? easings[action.easing](alpha) : alpha);
            }
        }
    }

    /** @internal */
    private executeTweens(block: RunningBlock, delta: number): void {
        if (block.tweens && !block.tweensStarted) {
            if (!block.runningTweens) {
                block.runningTweens = [];
                for (const tween of block.tweens) {
                    this.executeTween(block, delta, tween);
                }
            } else {
                for (const runningTween of block.runningTweens) {
                    runningTween.executeExistingTween(delta, this.reversed);
                }
            }
            block.tweensStarted = true;
        }
    }

    /** @internal */
    private executeTween(block: RunningBlock, delta: number, tween: Tween): void {
        const runningTween = TweenManager.createChildren(this.target, tween, this.root ?? this);
        block.runningTweens.push(runningTween);
        runningTween.execute(delta);
    }

    /** @internal */
    private executeExistingTween(delta: number, reversed: boolean): void {
        this.reversed = reversed ? !this.originallyReversed : this.originallyReversed;
        this.repeat = !this.reversed;
        this.actionIndex = this.reversed ? this.history.length : -1;
        TweenManager.addChildren(this);
        this.getBlock();
        this.execute(delta);
    }

    /** @internal */
    public getTweensDelta(block: RunningBlock): number {
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
