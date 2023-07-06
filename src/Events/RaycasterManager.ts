import { Object3D, Raycaster, Vector2 } from "three";
import { RenderManager } from "../Rendering/RenderManager";
import { IntersectionExt } from "./Events";

export class RaycasterManager {
    public raycaster = new Raycaster();
    public intersectionSortComparer = (a: IntersectionExt, b: IntersectionExt) => a.distance - b.distance;
    private _pointer = new Vector2();
    private _pointerNormalized = new Vector2();
    private _renderManager: RenderManager;

    constructor(renderManager: RenderManager) {
        this._renderManager = renderManager;
    }

    public getIntersections(event: PointerEvent, isDragging: boolean, excluded?: Object3D): IntersectionExt[] {
        const intersections: IntersectionExt[] = [];
        this._pointer.set(event.offsetX, event.offsetY);
        if (this._renderManager.getNormalizedMouse(this._pointer, this._pointerNormalized) === true) {
            const scene = this._renderManager.activeView.scene;
            const camera = this._renderManager.activeView.camera;
            this.raycaster.setFromCamera(this._pointerNormalized, camera);
            if (isDragging === false || excluded !== undefined) {
                this.raycastObjects(scene as unknown as Object3D, intersections, excluded);
            }
            intersections.sort(this.intersectionSortComparer);
        }
        return intersections;
    }

    private raycastObjects(object: Object3D, target: IntersectionExt[], excluded?: Object3D): IntersectionExt[] {
        if (object === excluded) return;

        if (object.interceptByRaycaster === true && object.visible === true) {

            for (const obj of object.children) {
                this.raycastObjects(obj, target, excluded);
            }

            let previousCount = target.length;

            if (object.objectsToRaycast !== undefined) {
                this.raycaster.intersectObjects(object.objectsToRaycast, false, target);
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
