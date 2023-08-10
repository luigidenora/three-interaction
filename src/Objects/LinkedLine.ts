import { Object3D } from "three";
import { Line2 } from "./Line2";

export class LinkedLine extends Line2 {
    private _needsUpdate: boolean;
    private _targetAEvent: () => void;
    private _targetBEvent: () => void;

    constructor(private targetA: Object3D, private targetB: Object3D) {
        super();

        this._targetAEvent = targetA.on("positionchange", () => this._needsUpdate = true);
        this._targetBEvent = targetB.on("positionchange", () => this._needsUpdate = true);

        this.on("animate", () => {
            if (this._needsUpdate) {
                this.setPoints([targetA.position, targetB.position]);
                this._needsUpdate = false;
            }
        });
    }

    public dispose() {
        this.targetA.off("positionchange", this._targetAEvent);
        this.targetB.off("positionchange", this._targetBEvent);
    }
}
