import { Object3D } from "three";

/** https://developer.mozilla.org/en-US/docs/Web/CSS/cursor */
export interface Cursors {
    // General
    "auto": never;
    "default": never;
    "none": never;

    // Links & status
    "context-menu": never;
    "help": never;
    "pointer": never;
    "progress": never;
    "wait": never;

    // Selection
    "cell": never;
    "crosshair": never;
    "text": never;
    "vertical-text": never;

    // Drag & drop
    "alias": never;
    "copy": never;
    "move": never;
    "no-drop": never;
    "not-allowed": never;
    "grab": never;
    "grabbing": never;

    // Resizing & scrolling
    "all-scroll": never;
    "col-resize": never;
    "row-resize": never;
    "n-resize": never;
    "e-resize": never;
    "s-resize": never;
    "w-resize": never;
    "ne-resize": never;
    "nw-resize": never;
    "se-resize": never;
    "sw-resize": never;
    "ew-resize": never;
    "ns-resize": never;
    "nesw-resize": never;
    "nwse-resize": never;

    // Zooming
    "zoom-in": never;
    "zoom-out": never;
}

const cursorSet = new Set([
    "auto", "default", "none", "context-menu", "help", "pointer", "progress", "wait",
    "cell", "crosshair", "text", "vertical-text", "alias", "copy", "move", "no-drop", "not-allowed", "grab", "grabbing",
    "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize",
    "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out"
]);

export type Cursor = keyof Cursors | String;

export class CursorHandler {
    public enabled = true;
    private _cursor: Cursor;
    private _domElement: HTMLCanvasElement;

    constructor(domElement: HTMLCanvasElement) {
        this._domElement = domElement;
    }

    public update(objHovered: Object3D): void {
        if (!this.enabled) return;

        let cursor: Cursor;
        if (objHovered) {
            cursor = objHovered.cursorOnHover ?? (objHovered.enabled ? "pointer" : "default");
        }

        if (cursor !== this._cursor) {
            this._cursor = cursor;
            if (cursorSet.has(cursor as string)) {
                this._domElement.style.cursor = cursor as string;
            } else {
                this._domElement.style.cursor = `url(${cursor}), default`;
            }
        }
    }
}
