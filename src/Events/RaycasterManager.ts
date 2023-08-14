import { Object3D, Raycaster, Vector2 } from "three";
import { RenderManager } from "../Rendering/RenderManager";
import { IntersectionExt } from "./Events";

export type RaycasterSortComparer = (a: IntersectionExt, b: IntersectionExt) => number;

/** @internal */
export class RaycasterManager {
    public raycaster = new Raycaster();
    public raycasterSortComparer: RaycasterSortComparer = (a: IntersectionExt, b: IntersectionExt) => a.distance - b.distance;
    public pointer = new Vector2();
    private _computedPointer = new Vector2();
    private _renderManager: RenderManager;

    constructor(renderManager: RenderManager) {
        this._renderManager = renderManager;
    }

    //TODO aggiungere a evento solo scena intersezione?
    public getIntersections(event: PointerEvent, isDragging: boolean, excluded?: Object3D): IntersectionExt[] {
        const intersections: IntersectionExt[] = [];
        this.pointer.set(event.offsetX, event.offsetY);
        if (this.getComputedMousePosition(this.pointer, this._computedPointer, isDragging, event.isPrimary) === true) {
            const scene = this._renderManager.activeScene;
            const camera = this._renderManager.activeView.camera;
            this.raycaster.setFromCamera(this._computedPointer, camera);
            if (isDragging === false || excluded !== undefined) {
                this.raycastObjects(scene, intersections, excluded);
            }
            intersections.sort(this.raycasterSortComparer);
        }
        return intersections;
    }

    private getComputedMousePosition(mouse: Vector2, target: Vector2, isDragging: boolean, isPrimary: boolean): boolean {
        if (!isDragging && isPrimary) {
            this._renderManager.updateActiveView(mouse);
        }
        const activeView = this._renderManager.activeView;
        if (activeView === undefined || activeView.enabled !== true || activeView !== this._renderManager.hoveredView) return false;
        const viewport = activeView.computedViewport;
        target.set((mouse.x - viewport.left) / viewport.width * 2 - 1, (mouse.y - viewport.top) / viewport.height * -2 + 1);
        return true;
    }

    private raycastObjects(object: Object3D, target: IntersectionExt[], excluded?: Object3D): IntersectionExt[] {
        if (object === excluded) return;

        if (object.interceptByRaycaster === true && object.visible === true) {

            for (const obj of object.children) {
                this.raycastObjects(obj, target, excluded);
            }

            let previousCount = target.length;

            if (object.hitboxes) {
                this.raycaster.intersectObjects(object.hitboxes, false, target);
            } else {
                this.raycaster.intersectObject(object, false, target);
            }

            while (target.length > previousCount) {
                const intersection = target[previousCount];
                intersection.hitbox = intersection.object;
                intersection.object = object;
                previousCount++;
            }
        }

        return target;
    }

}
