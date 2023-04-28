import { Target } from "../Events/Events";

export class DistinctTargetArray<T extends Target = Target> {
    private _set = new Set();
    public data: T[] = [];

    public push(target: T): void {
        if (this._set.has(target.id)) {
            this.data.push(target);
        }
    }

    public has(target: T): boolean {
        return this._set.has(target.id);
    }

    public clear(): void {
        this._set = new Set(); //or this._set.clear(); todo check performance
        this.data = [];
    }
}
