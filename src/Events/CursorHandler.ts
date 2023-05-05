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

const CursorSet = new Set(
    "auto", "default","none",

    // Links & status
    "context-menu",
    "help",
    "pointer",
    "progress",
    "wait",

    // Selection
    "cell",
    "crosshair",
    "text",
    "vertical-text",

    // Drag & drop
    "alias",
    "copy",
    "move",
    "no-drop",
    "not-allowed",
    "grab",
    "grabbing",

    // Resizing & scrolling
    "all-scroll",
    "col-resize",
    "row-resize",
    "n-resize",
    "e-resize",
    "s-resize",
    "w-resize",
    "ne-resize",
    "nw-resize",
    "se-resize",
    "sw-resize",
    "ew-resize",
    "ns-resize",
    "nesw-resize",
    "nwse-resize",

    // Zooming
    "zoom-in",
    "zoom-out",
}

export class CursorHandler {
    public enabled = true;
    private _cursor: string;
    private _domElement: HTMLCanvasElement;

    constructor(domElement: HTMLCanvasElement) {
        this._domElement = domElement;
    }

    // Consts.canvasContainer.style.cursor = `url(${cursor}), default`; TODO
    public update(objHovered: Object3D): void {
        if (!this.enabled) return;

        let cursor = objHovered ? "pointer" : "default"; //todo implement drag

        if (cursor !== this._cursor) {
            this._cursor = cursor;
            this._domElement.style.cursor = cursor;
        }
    }
}
