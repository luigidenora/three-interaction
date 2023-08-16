import { OrthographicCamera } from "three";

export class OrthographicCamera2 extends OrthographicCamera {
    private _frustumSize: number;
    private _fixWidth: boolean;
    private _width = -1;
    private _height = -1;

    public get frustumSize(): number { return this._frustumSize }
    public set frustumSize(value: number) {
        this._frustumSize = value;
        this.update();
    }

    public get fixWidth(): boolean { return this._fixWidth }
    public set fixWidth(value: boolean) {
        this._fixWidth = value;
        this.update();
    }

    constructor(frustumSize = 100, fixWidth = false, near?: number, far?: number) {
        super(-1, 1, 1, -1, near, far);
        this._frustumSize = frustumSize;
        this._fixWidth = fixWidth;
        this.on("rendererresize", (e) => {
            this._width = e.width;
            this._height = e.height;
            this.update();
        });
    }

    private update(): void {
        const size = 0.5 * this._frustumSize;
        if (this._fixWidth) {
            const aspect = this._height / this._width;
            this.left = -size;
            this.right = size;
            this.top = size  * aspect;
            this.bottom = -size  * aspect;
        } else {
            const aspect = this._width / this._height;
            this.left = -size * aspect;
            this.right = size * aspect;
            this.top = size;
            this.bottom = -size;
        }
        this.updateProjectionMatrix();
    }
}
