import { Object3D } from "three";
import { Line2 } from "./Line2";

export class LinkedLine extends Line2 {
    private _needsUpdate: boolean;

    constructor(targetA: Object3D, targetB: Object3D) {
        super();

        targetA.on("positionchange", () => {
            this._needsUpdate = true;
        });

        targetB.on("positionchange", () => {
            this._needsUpdate = true;
        });

        this.on("animate", () => {
            if (this._needsUpdate) {
                this.setPoints([targetA.position, targetB.position]); // todo could  be opt
                this._needsUpdate = false;
            }
        });
    }

    //add dispose
}
